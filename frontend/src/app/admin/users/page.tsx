'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  role: string;
  isSuspended: boolean;
  sellerProfile?: { status: string };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.admin.users(filter || undefined).then((d) => setUsers(d as AdminUser[])).catch(() => {});
  }, [filter]);

  const toggleSuspend = async (id: string, suspend: boolean) => {
    await api.admin.suspendUser(id, suspend);
    setUsers((u) => u.map((x) => x.id === id ? { ...x, isSuspended: suspend } : x));
  };

  return (
    <DashboardLayout type="admin">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <select className="input-field w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="BUYER">Buyers</option>
          <option value="SELLER">Sellers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium">{u.fullName}</td>
                <td className="py-3 pr-4">{u.email}</td>
                <td className="py-3 pr-4"><span className="badge-primary">{u.role}</span></td>
                <td className="py-3 pr-4">
                  {u.isSuspended ? <span className="badge-error">Suspended</span> : <span className="badge-success">Active</span>}
                </td>
                <td className="py-3">
                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => toggleSuspend(u.id, !u.isSuspended)}
                      className="text-xs text-primary hover:underline"
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
