'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Transaction, STATUS_LABELS } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Truck } from 'lucide-react';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);

  useEffect(() => {
    api.transactions.mySales().then((d) => setOrders(d as Transaction[])).catch(() => {});
  }, []);

  const markDelivered = async (id: string) => {
    await api.transactions.deliver(id);
    setOrders((o) => o.map((x) => x.id === id ? { ...x, status: 'AWAITING_DELIVERY' } : x));
  };

  return (
    <DashboardLayout type="seller">
      <h1 className="mb-6 text-2xl font-bold">Orders & Escrow</h1>

      {orders.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{o.product?.name}</h3>
                  <p className="text-sm text-gray-500">Buyer: {o.buyer?.fullName} · {o.buyer?.phone}</p>
                  <p className="text-sm text-gray-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatPrice(o.amount)}</p>
                  <span className="badge-primary">{STATUS_LABELS[o.status]}</span>
                </div>
              </div>

              {o.status === 'PAYMENT_SECURED' && (
                <div className="mt-4 rounded-lg bg-green-50 p-3">
                  <p className="mb-2 text-sm text-success">Payment secured. Deliver item to buyer.</p>
                  <button onClick={() => markDelivered(o.id)} className="btn-primary !py-2 !text-xs">
                    <Truck className="h-3 w-3" /> Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
