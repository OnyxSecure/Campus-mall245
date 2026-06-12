'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatPrice } from '@/lib/utils';

interface Dispute {
  id: string;
  reason: string;
  status: string;
  evidence: string[];
  buyer: { fullName: string; email: string };
  transaction: { amount: number; product: { name: string }; seller: { fullName: string } };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    api.admin.disputes().then((d) => setDisputes(d as Dispute[])).catch(() => {});
  }, []);

  const resolve = async (id: string, action: 'refund' | 'release') => {
    const resolution = prompt(`Resolution notes for ${action}:`);
    if (!resolution) return;
    await api.admin.resolveDispute(id, action, resolution);
    setDisputes((d) => d.filter((x) => x.id !== id));
  };

  return (
    <DashboardLayout type="admin">
      <h1 className="mb-6 text-2xl font-bold">Dispute Management</h1>

      {disputes.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">No disputes</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="card">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{d.transaction.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    Buyer: {d.buyer.fullName} · Seller: {d.transaction.seller.fullName}
                  </p>
                  <p className="text-sm text-gray-500">Amount: {formatPrice(d.transaction.amount)}</p>
                </div>
                <span className="badge-warning">{d.status}</span>
              </div>
              <p className="mt-3 text-sm"><strong>Reason:</strong> {d.reason}</p>
              {d.evidence.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{d.evidence.length} evidence file(s) attached</p>
              )}
              {['OPEN', 'UNDER_REVIEW'].includes(d.status) && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => resolve(d.id, 'refund')} className="rounded-xl border border-error px-4 py-2 text-xs font-semibold text-error hover:bg-red-50">
                    Approve Refund
                  </button>
                  <button onClick={() => resolve(d.id, 'release')} className="btn-primary !py-2 !text-xs">
                    Release Payment
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
