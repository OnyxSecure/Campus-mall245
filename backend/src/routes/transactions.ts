import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { initializePayment, verifyPayment } from '../utils/paystack';
import { createNotification } from '../services/notification';

const router = Router();

router.post('/initiate', authenticate, authorize('BUYER'), async (req: AuthRequest, res) => {
  const { productId } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: { seller: true },
  });

  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.sellerId === req.user!.userId) {
    return res.status(400).json({ error: 'Cannot buy your own product' });
  }

  const reference = `CM_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const transaction = await prisma.transaction.create({
    data: {
      productId,
      buyerId: req.user!.userId,
      sellerId: product.sellerId,
      amount: product.price,
      status: 'PENDING_PAYMENT',
      paystackRef: reference,
    },
  });

  const buyer = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  const payment = await initializePayment(buyer!.email, product.price, reference, {
    transactionId: transaction.id,
    productId,
  });

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { paystackAccessCode: payment.access_code },
  });

  res.json({
    transactionId: transaction.id,
    authorizationUrl: payment.authorization_url,
    reference: payment.reference,
  });
});

router.post('/verify', authenticate, async (req: AuthRequest, res) => {
  const { reference } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { paystackRef: reference },
    include: { product: true, seller: true, buyer: true },
  });

  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (transaction.buyerId !== req.user!.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const verification = await verifyPayment(reference);
  if (verification.data?.status !== 'success') {
    return res.status(400).json({ error: 'Payment not successful' });
  }

  if (transaction.status === 'PENDING_PAYMENT') {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'PAYMENT_SECURED' },
      });

      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { userId: transaction.sellerId },
        include: { wallet: true },
      });

      if (sellerProfile?.wallet) {
        await tx.wallet.update({
          where: { id: sellerProfile.wallet.id },
          data: { pendingEscrow: { increment: transaction.amount } },
        });
      }
    });

    await createNotification(
      transaction.sellerId,
      'PAYMENT_RECEIVED',
      'Payment Secured!',
      `Payment secured for "${transaction.product.name}". Deliver item to buyer.`,
      '/seller/orders'
    );

    await createNotification(
      transaction.buyerId,
      'PRODUCT_PURCHASE',
      'Payment Successful',
      `Your payment for "${transaction.product.name}" is held in escrow.`,
      `/orders/${transaction.id}`
    );
  }

  const updated = await prisma.transaction.findUnique({
    where: { id: transaction.id },
    include: { product: true },
  });

  res.json(updated);
});

router.patch('/:id/deliver', authenticate, authorize('SELLER'), async (req: AuthRequest, res) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: req.params.id, sellerId: req.user!.userId, status: 'PAYMENT_SECURED' },
    include: { product: true },
  });

  if (!transaction) return res.status(404).json({ error: 'Transaction not found or invalid status' });

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'AWAITING_DELIVERY', deliveredAt: new Date() },
  });

  await createNotification(
    transaction.buyerId,
    'PRODUCT_DELIVERED',
    'Item Delivered',
    `Seller has marked "${transaction.product.name}" as delivered. Please confirm receipt.`,
    `/orders/${transaction.id}`
  );

  res.json(updated);
});

router.patch('/:id/confirm', authenticate, authorize('BUYER'), async (req: AuthRequest, res) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: req.params.id,
      buyerId: req.user!.userId,
      status: { in: ['AWAITING_DELIVERY', 'DELIVERED', 'PAYMENT_SECURED'] },
    },
    include: { product: true },
  });

  if (!transaction) return res.status(404).json({ error: 'Transaction not found or invalid status' });

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: 'ESCROW_RELEASED', confirmedAt: new Date(), releasedAt: new Date() },
    });

    const sellerProfile = await tx.sellerProfile.findUnique({
      where: { userId: transaction.sellerId },
      include: { wallet: true },
    });

    if (sellerProfile?.wallet) {
      await tx.wallet.update({
        where: { id: sellerProfile.wallet.id },
        data: {
          pendingEscrow: { decrement: transaction.amount },
          availableBalance: { increment: transaction.amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: sellerProfile.wallet.id,
          amount: transaction.amount,
          type: 'ESCROW_RELEASE',
          description: `Escrow released for ${transaction.product.name}`,
          reference: transaction.paystackRef,
        },
      });
    }
  });

  await createNotification(
    transaction.sellerId,
    'ESCROW_RELEASED',
    'Payment Released!',
    `₦${transaction.amount.toLocaleString()} has been released to your wallet for "${transaction.product.name}".`,
    '/seller/wallet'
  );

  const updated = await prisma.transaction.findUnique({ where: { id: transaction.id } });
  res.json(updated);
});

router.get('/my-purchases', authenticate, authorize('BUYER'), async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { buyerId: req.user!.userId },
    include: { product: true, seller: { select: { fullName: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(transactions);
});

router.get('/my-sales', authenticate, authorize('SELLER'), async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { sellerId: req.user!.userId },
    include: { product: true, buyer: { select: { fullName: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(transactions);
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: {
      product: true,
      buyer: { select: { fullName: true, email: true, phone: true } },
      seller: { select: { fullName: true, email: true, phone: true } },
      dispute: true,
    },
  });

  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
  if (transaction.buyerId !== req.user!.userId && transaction.sellerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(transaction);
});

export default router;
