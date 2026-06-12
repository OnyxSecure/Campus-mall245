'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Transaction, STATUS_LABELS } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.admin.transactions().then((d) => setTransactions(d as Transaction[])).catch(() => {});
  }, []);

  return (
    <DashboardLayout type="admin">
      <h1 className="mb-6 text-2xl font-bold">Escrow Management</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Product</th>
              <th className="pb-3 pr-4">Buyer</th>
              <th className="pb-3 pr-4">Seller</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{t.product?.name}</td>
                <td className="py-3 pr-4">{t.buyer?.fullName}</td>
                <td className="py-3 pr-4">{t.seller?.fullName}</td>
                <td className="py-3 pr-4 text-primary font-semibold">{formatPrice(t.amount)}</td>
                <td className="py-3 pr-4"><span className="badge-primary">{STATUS_LABELS[t.status]}</span></td>
                <td className="py-3">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
