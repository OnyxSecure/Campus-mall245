import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/cloudinary';
import { createNotification } from '../services/notification';

const router = Router();

router.post('/', authenticate, authorize('BUYER'), async (req: AuthRequest, res) => {
  const { transactionId, reason, evidence } = req.body;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      buyerId: req.user!.userId,
      status: { in: ['PAYMENT_SECURED', 'AWAITING_DELIVERY', 'DELIVERED'] },
    },
  });

  if (!transaction) return res.status(404).json({ error: 'Transaction not found or cannot be disputed' });

  const evidenceUrls: string[] = [];
  if (evidence?.length) {
    for (const img of evidence) {
      evidenceUrls.push(await uploadImage(img, 'disputes'));
    }
  }

  const dispute = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.create({
      data: {
        transactionId,
        buyerId: req.user!.userId,
        reason,
        evidence: evidenceUrls,
      },
    });

    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'DISPUTED' },
    });

    return d;
  });

  await createNotification(
    transaction.sellerId,
    'DISPUTE_UPDATE',
    'Dispute Opened',
    'A buyer has opened a dispute on a transaction.',
    `/seller/orders`
  );

  res.status(201).json(dispute);
});

router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  const { content } = req.body;
  const dispute = await prisma.dispute.findUnique({
    where: { id: req.params.id },
    include: { transaction: true },
  });

  if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

  const isParty =
    dispute.buyerId === req.user!.userId ||
    dispute.transaction.sellerId === req.user!.userId ||
    req.user!.role === 'ADMIN';

  if (!isParty) return res.status(403).json({ error: 'Access denied' });

  const comment = await prisma.disputeComment.create({
    data: { disputeId: dispute.id, userId: req.user!.userId, content },
    include: { user: { select: { fullName: true, role: true } } },
  });

  res.status(201).json(comment);
});

router.get('/my', authenticate, authorize('BUYER'), async (req: AuthRequest, res) => {
  const disputes = await prisma.dispute.findMany({
    where: { buyerId: req.user!.userId },
    include: { transaction: { include: { product: true } }, comments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(disputes);
});

export default router;
