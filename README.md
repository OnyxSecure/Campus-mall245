# Campus-Mall

A secure student-to-student marketplace with escrow-protected payments, verified sellers, and admin oversight.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + Bcrypt |
| Payments | Paystack |
| File Storage | Cloudinary |

## Project Structure

```
CAMP MALL/
├── backend/          # Express API + Prisma
│   ├── prisma/       # Database schema & seed
│   └── src/          # Routes, middleware, services
└── frontend/         # Next.js app
    └── src/
        ├── app/      # Pages (App Router)
        ├── components/
        ├── context/  # Auth state
        └── lib/      # API client, types, utils
```

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Paystack account (test keys work for development)
- Cloudinary account (optional — uses placeholders without it)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

npx prisma generate
npx prisma db push
npm run db:seed

npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
```

App runs at `http://localhost:3000`

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusmall.com | admin123 |
| Seller | seller@campusmall.com | seller123 |
| Buyer | buyer@campusmall.com | buyer123 |

## Features

### Buyers
- Register & login with email verification
- Browse marketplace with search, filters, and sorting
- Buy products via Paystack (escrow-protected)
- Confirm delivery to release payment
- Open disputes with evidence

### Sellers
- Register with student ID verification
- Dashboard with listings, orders, wallet
- Create/edit/delete product listings
- Mark orders as delivered
- Withdraw earnings from wallet

### Admins
- Analytics dashboard
- Approve/reject seller applications
- User management (suspend accounts)
- Product moderation
- Escrow transaction monitoring
- Dispute resolution (refund or release)

### Landing Page
- Hero, How It Works, Featured Products
- Verified Sellers, Testimonials, FAQ

## Escrow Flow

1. Buyer selects product → clicks "Buy Now"
2. Payment via Paystack → held in escrow
3. Seller notified → delivers item
4. Buyer confirms receipt
5. Funds released to seller wallet
6. Seller withdraws to bank account

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render or Railway |
| Database | Railway PostgreSQL or Supabase |

Set environment variables on each platform matching the `.env.example` files.

## API Endpoints

- `POST /api/auth/register/buyer` — Buyer registration
- `POST /api/auth/register/seller` — Seller registration
- `POST /api/auth/login` — Login
- `GET /api/products` — List products (search, filter, sort)
- `POST /api/transactions/initiate` — Start escrow purchase
- `POST /api/transactions/verify` — Verify Paystack payment
- `PATCH /api/transactions/:id/confirm` — Buyer confirms delivery
- `GET /api/admin/analytics` — Admin dashboard stats

Full API documentation is in the route files under `backend/src/routes/`.
