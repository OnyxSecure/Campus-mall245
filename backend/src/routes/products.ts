import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, requireApprovedSeller, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/cloudinary';

const router = Router();

router.get('/', async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = '1',
    limit = '12',
  } = req.query;

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
  }

  const orderBy =
    sort === 'price_asc'
      ? { price: 'asc' as const }
      : sort === 'price_desc'
        ? { price: 'desc' as const }
        : { createdAt: 'desc' as const };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            sellerProfile: { select: { status: true, profilePhoto: true, department: true } },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

router.get('/seller/mine', authenticate, authorize('SELLER'), async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    where: { sellerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

router.get('/featured', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      seller: {
        select: {
          fullName: true,
          sellerProfile: { select: { status: true, profilePhoto: true } },
        },
      },
    },
  });
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          createdAt: true,
          sellerProfile: true,
        },
      },
    },
  });

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post(
  '/',
  authenticate,
  authorize('SELLER'),
  requireApprovedSeller,
  [
    body('name').trim().notEmpty(),
    body('category').notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('condition').isIn(['NEW', 'FAIRLY_USED']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, category, description, price, condition, images } = req.body;
    const imageUrls: string[] = [];

    if (images?.length) {
      for (const img of images.slice(0, 5)) {
        imageUrls.push(await uploadImage(img, 'products'));
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        price: Number(price),
        condition,
        images: imageUrls,
        sellerId: req.user!.userId,
      },
    });

    res.status(201).json(product);
  }
);

router.put('/:id', authenticate, authorize('SELLER'), requireApprovedSeller, async (req: AuthRequest, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, sellerId: req.user!.userId },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { name, category, description, price, condition, images, isActive } = req.body;
  const imageUrls = product.images;

  if (images?.length) {
    imageUrls.length = 0;
    for (const img of images.slice(0, 5)) {
      if (img.startsWith('http')) imageUrls.push(img);
      else imageUrls.push(await uploadImage(img, 'products'));
    }
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { name, category, description, price, condition, images: imageUrls, isActive },
  });

  res.json(updated);
});

router.delete('/:id', authenticate, authorize('SELLER'), requireApprovedSeller, async (req: AuthRequest, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, sellerId: req.user!.userId },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({ message: 'Product removed' });
});

export default router;
