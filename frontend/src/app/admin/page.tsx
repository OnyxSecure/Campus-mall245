'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Store, ShoppingBag, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatPrice } from '@/lib/utils';

interface Analytics {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalTransactions: number;
  totalProducts: number;
  pendingSellers: number;
  openDisputes: number;
  totalVolume: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Analytics | null>(null);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') router.push('/login');
    if (user?.role === 'ADMIN') {
      api.admin.analytics().then((d) => setStats(d as Analytics)).catch(() => {});
    }
  }, [user, loading, router]);

  if (loading || !stats) return null;

  return (
    <DashboardLayout type="admin">
      <h1 className="mb-6 text-2xl font-bold">Admin Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
          { label: 'Verified Sellers', value: stats.totalSellers, icon: Store, color: 'text-blue-500' },
          { label: 'Buyers', value: stats.totalBuyers, icon: Users, color: 'text-green-500' },
          { label: 'Transactions', value: stats.totalTransactions, icon: ShoppingBag, color: 'text-purple-500' },
          { label: 'Marketplace Volume', value: formatPrice(stats.totalVolume), icon: DollarSign, color: 'text-success' },
          { label: 'Active Listings', value: stats.totalProducts, icon: ShoppingBag, color: 'text-amber-500' },
          { label: 'Pending Sellers', value: stats.pendingSellers, icon: Clock, color: 'text-amber-600' },
          { label: 'Open Disputes', value: stats.openDisputes, icon: AlertTriangle, color: 'text-error' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`rounded-xl bg-gray-50 p-3 ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
