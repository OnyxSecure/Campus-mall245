'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ui/ProductCard';

const DEMO_PRODUCTS: Product[] = [
  {
    id: '1', name: 'iPhone 13 Pro', category: 'PHONES', description: '', images: ['https://images.unsplash.com/photo-1632661674417-df8c277a984f?w=600'],
    price: 350000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(),
    seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } },
  },
  {
    id: '2', name: 'MacBook Air M1', category: 'LAPTOPS', description: '', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
    price: 650000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(),
    seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } },
  },
  {
    id: '3', name: 'Engineering Math Textbook', category: 'TEXTBOOKS', description: '', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    price: 8500, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(),
    seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } },
  },
  {
    id: '4', name: 'Sony WH-1000XM4', category: 'ELECTRONICS', description: '', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'],
    price: 120000, condition: 'NEW', sellerId: '1', isActive: true, createdAt: new Date().toISOString(),
    seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } },
  },
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);

  useEffect(() => {
    api.products.featured()
      .then((data) => setProducts(data as Product[]))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-secondary sm:text-4xl">Featured Products</h2>
            <p className="text-gray-600">Top listings from verified campus sellers</p>
          </div>
          <Link href="/marketplace" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/marketplace" className="btn-outline">View All Products</Link>
        </div>
      </div>
    </section>
  );
}
