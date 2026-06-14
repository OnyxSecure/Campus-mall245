import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { signToken, generateVerificationToken, generateResetToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import { uploadImage } from '../utils/cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post(
  '/register/buyer',
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('studentId').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').custom((val, { req }) => val === req.body.password),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, studentId, phone, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { studentId }] },
    });
    if (existing) return res.status(409).json({ error: 'Email or Student ID already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        studentId,
        phone,
        password: hashed,
        role: 'BUYER',
        verificationToken,
      },
      select: { id: true, fullName: true, email: true, role: true, studentId: true },
    });

    await sendEmail(
      email,
      'Verify your Campus-Mall account',
      `<p>Hi ${fullName}, welcome to Campus-Mall!</p>
       <p>Click to verify: <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">Verify Email</a></p>`
    );

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  }
);

router.post(
  '/register/seller',
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('studentId').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('department').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('confirmPassword').custom((val, { req }) => val === req.body.password),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, studentId, phone, department, password, profilePhoto, studentIdCard } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { studentId }] },
    });
    if (existing) return res.status(409).json({ error: 'Email or Student ID already registered' });

    const hashed = await bcrypt.hash(password, 12);
    let photoUrl: string | undefined;
    let idCardUrl: string | undefined;

    if (profilePhoto) photoUrl = await uploadImage(profilePhoto, 'profiles');
    if (studentIdCard) idCardUrl = await uploadImage(studentIdCard, 'id-cards');

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        studentId,
        phone,
        password: hashed,
        role: 'SELLER',
        sellerProfile: {
          create: {
            department,
            profilePhoto: photoUrl,
            studentIdCard: idCardUrl,
            status: 'PENDING',
            wallet: { create: {} },
          },
        },
      },
      include: { sellerProfile: true },
    });

    await sendEmail(
      email,
      'Seller Application Submitted - Campus-Mall',
      `<p>Hi ${fullName}, your seller application has been submitted and is under review.</p>
       <p>We'll notify you once an admin reviews your documents.</p>`
    );

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        sellerProfile: user.sellerProfile,
      },
      token,
    });
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { sellerProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        sellerProfile: user.sellerProfile,
      },
      token,
    });
  }
);

router.post('/forgot-password', [body('email').isEmail()], async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });

  const resetToken = generateResetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
  });

  await sendEmail(
    email,
    'Reset your Campus-Mall password',
    `<p>Click to reset: <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>`
  );

  res.json({ message: 'If that email exists, a reset link was sent' });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: 'Password reset successful' });
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const user = await prisma.user.findFirst({ where: { verificationToken: token as string } });
  if (!user) return res.status(400).json({ error: 'Invalid verification token' });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  res.json({ message: 'Email verified successfully' });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      studentId: true,
      phone: true,
      emailVerified: true,
      sellerProfile: { include: { wallet: true } },
    },
  });
  res.json(user);
});

export default router;
