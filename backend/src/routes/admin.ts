import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendEmail, sellerApprovalEmail } from '../utils/email';
import { createNotification } from '../services/notification';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/analytics', async (_req, res) => {
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    totalTransactions,
    totalProducts,
    pendingSellers,
    openDisputes,
    transactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.transaction.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.sellerProfile.count({ where: { status: 'PENDING' } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
    prisma.transaction.findMany({
      where: { status: 'ESCROW_RELEASED' },
      select: { amount: true },
    }),
  ]);

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  res.json({
    totalUsers,
    totalSellers,
    totalBuyers,
    totalTransactions,
    totalProducts,
    pendingSellers,
    openDisputes,
    totalVolume,
    revenueMetrics: { totalVolume, completedTransactions: transactions.length },
  });
});

router.get('/users', async (req, res) => {
  const { role } = req.query;
  const users = await prisma.user.findMany({
    where: role ? { role: role as 'BUYER' | 'SELLER' | 'ADMIN' } : undefined,
    select: {
      id: true,
      fullName: true,
      email: true,
      studentId: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      sellerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.patch('/users/:id/suspend', async (req, res) => {
  const { suspend } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isSuspended: suspend },
  });
  res.json(user);
});

router.get('/sellers/pending', async (_req, res) => {
  const sellers = await prisma.sellerProfile.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { fullName: true, email: true, studentId: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(sellers);
});

router.patch('/sellers/:id/review', async (req: AuthRequest, res) => {
  const { approved, rejectionReason } = req.body;

  const profile = await prisma.sellerProfile.update({
    where: { id: req.params.id },
    data: {
      status: approved ? 'APPROVED' : 'REJECTED',
      rejectionReason: approved ? null : rejectionReason,
      reviewedAt: new Date(),
      reviewedBy: req.user!.userId,
    },
    include: { user: true },
  });

  await sendEmail(
    profile.user.email,
    approved ? 'Seller Account Approved!' : 'Seller Application Update',
    sellerApprovalEmail(profile.user.fullName, approved, rejectionReason)
  );

  await createNotification(
    profile.userId,
    'REGISTRATION_APPROVAL',
    approved ? 'Seller Account Approved!' : 'Seller Application Rejected',
    approved
      ? 'Your seller account has been approved. You can now list products.'
      : `Your application was rejected. ${rejectionReason || ''}`,
    '/seller/dashboard',
    false
  );

  res.json(profile);
});

router.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { seller: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

router.delete('/products/:id', async (req, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: 'Product removed' });
});

router.get('/transactions', async (_req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      product: true,
      buyer: { select: { fullName: true, email: true } },
      seller: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(transactions);
});

router.get('/disputes', async (_req, res) => {
  const disputes = await prisma.dispute.findMany({
    include: {
      transaction: { include: { product: true, seller: { select: { fullName: true } } } },
      buyer: { select: { fullName: true, email: true } },
      comments: { include: { user: { select: { fullName: true, role: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(disputes);
});

router.patch('/disputes/:id/resolve', async (req: AuthRequest, res) => {
  const { action, resolution } = req.body;

  const dispute = await prisma.dispute.findUnique({
    where: { id: req.params.id },
    include: { transaction: { include: { product: true } } },
  });

  if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

  if (action === 'refund') {
    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: dispute.id },
        data: { status: 'REFUNDED', resolution, resolvedAt: new Date(), resolvedBy: req.user!.userId },
      });

      await tx.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: 'REFUNDED' },
      });

      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { userId: dispute.transaction.sellerId },
        include: { wallet: true },
      });

      if (sellerProfile?.wallet) {
        await tx.wallet.update({
          where: { id: sellerProfile.wallet.id },
          data: { pendingEscrow: { decrement: dispute.transaction.amount } },
        });
      }
    });

    await createNotification(dispute.buyerId, 'DISPUTE_UPDATE', 'Refund Approved', resolution, `/orders/${dispute.transactionId}`);
  } else if (action === 'release') {
    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: dispute.id },
        data: { status: 'RESOLVED', resolution, resolvedAt: new Date(), resolvedBy: req.user!.userId },
      });

      await tx.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: 'ESCROW_RELEASED', releasedAt: new Date() },
      });

      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { userId: dispute.transaction.sellerId },
        include: { wallet: true },
      });

      if (sellerProfile?.wallet) {
        await tx.wallet.update({
          where: { id: sellerProfile.wallet.id },
          data: {
            pendingEscrow: { decrement: dispute.transaction.amount },
            availableBalance: { increment: dispute.transaction.amount },
          },
        });
      }
    });

    await createNotification(dispute.transaction.sellerId, 'ESCROW_RELEASED', 'Dispute Resolved - Payment Released', resolution, '/seller/wallet');
  }

  const updated = await prisma.dispute.findUnique({ where: { id: dispute.id } });
  res.json(updated);
});

export default router;
