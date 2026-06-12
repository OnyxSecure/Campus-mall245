'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Wallet, Clock, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatPrice } from '@/lib/utils';
import { Product, Transaction } from '@/lib/types';

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingEscrow: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SELLER')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'SELLER') {
      api.products.mine().then((d) => setProducts(d as Product[])).catch(() => {});
      api.transactions.mySales().then((d) => setOrders(d as Transaction[])).catch(() => {});
      api.wallet.get().then((d) => {
        const w = d as { availableBalance: number; pendingEscrow: number };
        setWallet(w);
      }).catch(() => {});
    }
  }, [user]);

  const status = user?.sellerProfile?.status;

  if (loading) return null;

  return (
    <DashboardLayout type="seller">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Seller Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.fullName}</p>
        </div>
        {status === 'APPROVED' && (
          <Link href="/seller/products/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        )}
      </div>

      {status === 'PENDING' && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock className="mb-1 inline h-4 w-4" /> Your seller application is under review. You&apos;ll be notified once approved.
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-error">
          Your application was rejected. {user?.sellerProfile?.rejectionReason}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Listings', value: products.filter((p) => p.isActive).length, icon: Package, color: 'text-primary' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'Available Balance', value: formatPrice(wallet.availableBalance), icon: Wallet, color: 'text-success' },
          { label: 'Pending Escrow', value: formatPrice(wallet.pendingEscrow), icon: Clock, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`rounded-xl bg-gray-50 p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-secondary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="font-medium">{o.product?.name}</p>
                  <p className="text-sm text-gray-500">{o.buyer?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatPrice(o.amount)}</p>
                  <span className="badge-primary text-[10px]">{o.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
