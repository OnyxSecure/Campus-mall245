import Link from 'next/link';
import { ShoppingBag, Shield, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-secondary text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Campus<span className="text-primary">-Mall</span>
              </span>
            </div>
            <p className="mb-4 max-w-md text-sm leading-relaxed">
              The secure student-to-student marketplace. Buy and sell on campus with escrow-protected payments and verified sellers.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Escrow-protected transactions</span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/marketplace" className="hover:text-primary">Marketplace</Link></li>
              <li><Link href="/register/seller" className="hover:text-primary">Become a Seller</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary">How It Works</Link></li>
              <li><Link href="/#faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@campusmall.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Campus-Mall. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
