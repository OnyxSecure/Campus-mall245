import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            Escrow-Protected Campus Marketplace
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
            Buy and Sell Safely on{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Campus
            </span>
          </h1>

          <p className="mb-10 text-lg text-gray-600 sm:text-xl">
            Secure student-to-student transactions protected by escrow payments.
            No more scams. No more fake payments. Just trusted campus commerce.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/marketplace" className="btn-primary w-full sm:w-auto">
              Start Buying
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register/seller" className="btn-secondary w-full sm:w-auto">
              Become a Seller
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-200 pt-8">
            {[
              { value: '500+', label: 'Verified Sellers' },
              { value: '₦2M+', label: 'Transactions' },
              { value: '99%', label: 'Completion Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-gray-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
