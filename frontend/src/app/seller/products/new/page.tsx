'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { fileToBase64 } from '@/lib/utils';
import { CATEGORY_LABELS, ProductCategory } from '@/lib/types';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', category: 'OTHERS' as ProductCategory, description: '', price: '', condition: 'FAIRLY_USED',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const encoded = await Promise.all(files.slice(0, 5).map(fileToBase64));
    setImages(encoded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.products.create({ ...form, price: Number(form.price), images });
      router.push('/seller/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout type="seller">
      <h1 className="mb-6 text-2xl font-bold">Create Product Listing</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-error">{error}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-medium">Product Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
              {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Condition</label>
            <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option value="NEW">New</option>
              <option value="FAIRLY_USED">Fairly Used</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Price (₦)</label>
          <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea className="input-field min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Product Images (up to 5)</label>
          <input type="file" accept="image/*" multiple onChange={handleImages} className="input-field" />
          {images.length > 0 && <p className="mt-1 text-xs text-gray-500">{images.length} image(s) selected</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </DashboardLayout>
  );
}
