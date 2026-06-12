'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardLink =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'SELLER'
        ? '/seller/dashboard'
        : '/marketplace';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-secondary">
            Campus<span className="text-primary">-Mall</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-primary">
            Marketplace
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary">
            How It Works
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-primary">
            FAQ
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">
                Log In
              </Link>
              <Link href="/register" className="btn-primary !py-2.5 !px-5 !text-sm">
                Get Started
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/notifications" className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-primary">
                <Bell className="h-5 w-5" />
              </Link>
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-primary/5"
              >
                <User className="h-4 w-4 text-primary" />
                {user.fullName.split(' ')[0]}
              </Link>
              <button onClick={logout} className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-error">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="py-2 font-medium">
              Marketplace
            </Link>
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-2 font-medium">
              How It Works
            </Link>
            {!user ? (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="py-2 font-medium">
                  Log In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link href={dashboardLink} onClick={() => setMobileOpen(false)} className="py-2 font-medium">
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="py-2 text-left font-medium text-error">
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
