'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ui/ProductCard';

export default function SellerProfilePage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<{ fullName: string; department?: string } | null>(null);

  useEffect(() => {
    api.products.list({ sellerId: id as string })
      .then((data) => {
        const result = data as { products: Product[] };
        const list = result.products || (data as Product[]);
        setProducts(list);
        if (list[0]?.seller) {
          setSeller({
            fullName: list[0].seller.fullName,
            department: list[0].seller.sellerProfile?.department,
          });
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 card flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {seller?.fullName?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{seller?.fullName || 'Seller'}</h1>
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-gray-500">{seller?.department} · Verified Seller</p>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold">Listings</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
