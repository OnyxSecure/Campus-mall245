import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusmall.com' },
    update: {},
    create: {
      fullName: 'Campus Admin',
      email: 'admin@campusmall.com',
      studentId: 'ADMIN001',
      phone: '08000000000',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const sellerPassword = await bcrypt.hash('seller123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@campusmall.com' },
    update: {},
    create: {
      fullName: 'Jane Seller',
      email: 'seller@campusmall.com',
      studentId: 'STU2024001',
      phone: '08011111111',
      password: sellerPassword,
      role: 'SELLER',
      emailVerified: true,
      sellerProfile: {
        create: {
          department: 'Computer Science',
          status: 'APPROVED',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
          wallet: { create: { availableBalance: 25000, pendingEscrow: 15000 } },
        },
      },
    },
  });

  const buyerPassword = await bcrypt.hash('buyer123', 12);
  await prisma.user.upsert({
    where: { email: 'buyer@campusmall.com' },
    update: {},
    create: {
      fullName: 'John Buyer',
      email: 'buyer@campusmall.com',
      studentId: 'STU2024002',
      phone: '08022222222',
      password: buyerPassword,
      role: 'BUYER',
      emailVerified: true,
    },
  });

  const products = [
    {
      name: 'iPhone 13 Pro',
      category: 'PHONES' as const,
      description: '128GB, excellent condition, battery health 92%. Comes with original box and charger.',
      images: ['https://images.unsplash.com/photo-1632661674417-df8c277a984f?w=600'],
      price: 350000,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'MacBook Air M1',
      category: 'LAPTOPS' as const,
      description: '8GB RAM, 256GB SSD. Perfect for coding and design work. Barely used.',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
      price: 650000,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'Engineering Mathematics Textbook',
      category: 'TEXTBOOKS' as const,
      description: 'Latest edition, no markings. Required for ENG 201.',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
      price: 8500,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'Sony WH-1000XM4',
      category: 'ELECTRONICS' as const,
      description: 'Noise-cancelling headphones. Great for studying in noisy environments.',
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'],
      price: 120000,
      condition: 'NEW' as const,
    },
    {
      name: 'Nike Air Force 1',
      category: 'FASHION' as const,
      description: 'Size 42, white colorway. Worn twice only.',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'],
      price: 45000,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'Mini Fridge',
      category: 'HOSTEL_ESSENTIALS' as const,
      description: 'Perfect for hostel room. Energy efficient, works perfectly.',
      images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'],
      price: 55000,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'iPad Air 5th Gen',
      category: 'TABLETS' as const,
      description: '64GB WiFi, with Apple Pencil. Ideal for note-taking.',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
      price: 380000,
      condition: 'FAIRLY_USED' as const,
    },
    {
      name: 'Laptop Stand & USB Hub',
      category: 'ACCESSORIES' as const,
      description: 'Aluminum laptop stand with 7-in-1 USB-C hub combo.',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'],
      price: 18000,
      condition: 'NEW' as const,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: { ...p, sellerId: seller.id },
    });
  }

  console.log('Seed complete:', { admin: admin.email, seller: seller.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
