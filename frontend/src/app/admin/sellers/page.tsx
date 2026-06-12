'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface PendingSeller {
  id: string;
  department: string;
  profilePhoto?: string;
  studentIdCard?: string;
  user: { fullName: string; email: string; studentId: string; phone: string };
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<PendingSeller[]>([]);

  useEffect(() => {
    api.admin.pendingSellers().then((d) => setSellers(d as PendingSeller[])).catch(() => {});
  }, []);

  const review = async (id: string, approved: boolean, reason?: string) => {
    await api.admin.reviewSeller(id, approved, reason);
    setSellers((s) => s.filter((x) => x.id !== id));
  };

  return (
    <DashboardLayout type="admin">
      <h1 className="mb-6 text-2xl font-bold">Seller Verification</h1>

      {sellers.length === 0 ? (
        <div className="card py-16 text-center text-gray-500">No pending applications</div>
      ) : (
        <div className="space-y-4">
          {sellers.map((s) => (
            <div key={s.id} className="card">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold">{s.user.fullName}</h3>
                  <p className="text-sm text-gray-500">{s.user.email} · {s.user.studentId}</p>
                  <p className="text-sm text-gray-500">{s.department} · {s.user.phone}</p>
                </div>
                <div className="flex gap-4">
                  {s.profilePhoto && (
                    <div>
                      <p className="mb-1 text-xs text-gray-500">Profile</p>
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image src={s.profilePhoto} alt="Profile" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                  {s.studentIdCard && (
                    <div>
                      <p className="mb-1 text-xs text-gray-500">Student ID</p>
                      <div className="relative h-20 w-32 overflow-hidden rounded-lg">
                        <Image src={s.studentIdCard} alt="ID Card" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => review(s.id, true)} className="btn-primary !py-2 !text-xs">
                  <Check className="h-3 w-3" /> Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason:');
                    if (reason) review(s.id, false, reason);
                  }}
                  className="rounded-xl border border-error px-4 py-2 text-xs font-semibold text-error hover:bg-red-50"
                >
                  <X className="inline h-3 w-3" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
