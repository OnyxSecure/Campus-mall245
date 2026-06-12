'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Transaction, STATUS_LABELS } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) api.transactions.myPurchases().then((d) => setOrders(d as Transaction[])).catch(() => {});
  }, [user, loading, router]);

  const confirmReceipt = async (id: string) => {
    await api.transactions.confirm(id);
    setOrders((o) => o.map((x) => x.id === id ? { ...x, status: 'ESCROW_RELEASED' } : x));
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-2xl font-bold">My Purchases</h1>

        {orders.length === 0 ? (
          <div className="card py-16 text-center text-gray-500">No purchases yet</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="card">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{o.product?.name}</h3>
                    <p className="text-sm text-gray-500">Seller: {o.seller?.fullName}</p>
                    <p className="text-sm text-gray-500">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(o.amount)}</p>
                    <span className="badge-primary">{STATUS_LABELS[o.status]}</span>
                  </div>
                </div>

                {['PAYMENT_SECURED', 'AWAITING_DELIVERY', 'DELIVERED'].includes(o.status) && (
                  <div className="mt-4 rounded-lg bg-green-50 p-3">
                    <p className="mb-2 text-sm">Received your item? Confirm to release payment to seller.</p>
                    <button onClick={() => confirmReceipt(o.id)} className="btn-primary !py-2 !text-xs">
                      <CheckCircle className="h-3 w-3" /> Confirm Receipt
                    </button>
                  </div>
                )}

                {['PAYMENT_SECURED', 'AWAITING_DELIVERY'].includes(o.status) && (
                  <button
                    onClick={() => router.push(`/orders/${o.id}/dispute`)}
                    className="mt-2 flex items-center gap-1 text-xs text-error hover:underline"
                  >
                    <AlertTriangle className="h-3 w-3" /> Open Dispute
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
