'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Product, CATEGORY_LABELS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.admin.products().then((d) => setProducts(d as Product[])).catch(() => {});
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Remove this listing?')) return;
    await api.admin.removeProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <DashboardLayout type="admin">
      <h1 className="mb-6 text-2xl font-bold">Product Management</h1>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-500">
                {CATEGORY_LABELS[p.category]} · {formatPrice(p.price)} · {p.seller?.fullName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={p.isActive ? 'badge-success' : 'badge-error'}>{p.isActive ? 'Active' : 'Removed'}</span>
              {p.isActive && (
                <button onClick={() => remove(p.id)} className="text-error hover:bg-red-50 rounded-lg p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
