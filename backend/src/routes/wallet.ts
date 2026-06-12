import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, requireApprovedSeller, AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notification';

const router = Router();

router.get('/', authenticate, authorize('SELLER'), requireApprovedSeller, async (req: AuthRequest, res) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: req.user!.userId },
    include: {
      wallet: {
        include: {
          transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
        },
      },
    },
  });

  res.json(profile?.wallet || { availableBalance: 0, pendingEscrow: 0, transactions: [] });
});

router.post('/withdraw', authenticate, authorize('SELLER'), requireApprovedSeller, async (req: AuthRequest, res) => {
  const { amount, bankDetails } = req.body;

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: req.user!.userId },
    include: { wallet: true },
  });

  if (!profile?.wallet) return res.status(404).json({ error: 'Wallet not found' });
  if (amount > profile.wallet.availableBalance) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  if (amount < 1000) {
    return res.status(400).json({ error: 'Minimum withdrawal is ₦1,000' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: profile.wallet!.id },
      data: { availableBalance: { decrement: amount } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: profile.wallet!.id,
        amount: -amount,
        type: 'WITHDRAWAL',
        description: `Withdrawal to ${bankDetails?.accountNumber || 'bank account'}`,
      },
    });
  });

  await createNotification(
    req.user!.userId,
    'WITHDRAWAL_SUCCESS',
    'Withdrawal Processed',
    `Your withdrawal of ₦${amount.toLocaleString()} is being processed.`,
    '/seller/wallet'
  );

  res.json({ message: 'Withdrawal request submitted', amount });
});

export default router;
