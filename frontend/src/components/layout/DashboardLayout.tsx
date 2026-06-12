'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, Bell, User, Shield,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sellerNav: NavItem[] = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'My Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/seller/wallet', label: 'Wallet', icon: Wallet },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Analytics', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: User },
  { href: '/admin/sellers', label: 'Seller Verification', icon: Shield },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/transactions', label: 'Escrow', icon: Wallet },
  { href: '/admin/disputes', label: 'Disputes', icon: Shield },
];

export default function DashboardLayout({
  children,
  type,
}: {
  children: React.ReactNode;
  type: 'seller' | 'admin';
}) {
  const pathname = usePathname();
  const nav = type === 'admin' ? adminNav : sellerNav;

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
              {type === 'admin' ? 'Admin Panel' : 'Seller Dashboard'}
            </p>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-white hover:text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
