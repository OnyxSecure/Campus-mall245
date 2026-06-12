'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Product, CATEGORY_LABELS } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.products.mine().then((d) => setProducts(d as Product[])).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing?')) return;
    await api.products.delete(id);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <DashboardLayout type="seller">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/seller/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add Product</Link>
      </div>

      {products.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="mb-4 text-gray-500">No products listed yet</p>
          <Link href="/seller/products/new" className="btn-primary">Create First Listing</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="card flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image src={p.images[0] || 'https://placehold.co/64'} alt={p.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">{CATEGORY_LABELS[p.category]} · {formatPrice(p.price)}</p>
              </div>
              <span className={p.isActive ? 'badge-success' : 'badge-error'}>{p.isActive ? 'Active' : 'Removed'}</span>
              <div className="flex gap-2">
                <Link href={`/seller/products/${p.id}/edit`} className="rounded-lg p-2 hover:bg-gray-100"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 hover:bg-red-50 text-error"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
