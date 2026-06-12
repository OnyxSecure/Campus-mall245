'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { Product, ProductCategory, CATEGORY_LABELS } from '@/lib/types';
import ProductCard from '@/components/ui/ProductCard';

const DEMO: Product[] = [
  { id: '1', name: 'iPhone 13 Pro', category: 'PHONES', description: '', images: ['https://images.unsplash.com/photo-1632661674417-df8c277a984f?w=600'], price: 350000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
  { id: '2', name: 'MacBook Air M1', category: 'LAPTOPS', description: '', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], price: 650000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
  { id: '3', name: 'Engineering Math Textbook', category: 'TEXTBOOKS', description: '', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'], price: 8500, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
  { id: '4', name: 'Sony WH-1000XM4', category: 'ELECTRONICS', description: '', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'], price: 120000, condition: 'NEW', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
  { id: '5', name: 'Nike Air Force 1', category: 'FASHION', description: '', images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'], price: 45000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
  { id: '6', name: 'Mini Fridge', category: 'HOSTEL_ESSENTIALS', description: '', images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'], price: 55000, condition: 'FAIRLY_USED', sellerId: '1', isActive: true, createdAt: new Date().toISOString(), seller: { id: '1', fullName: 'Jane Seller', sellerProfile: { id: '1', department: 'CS', status: 'APPROVED' } } },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>(DEMO);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = () => {
    const params: Record<string, string> = { sort };
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api.products.list(params)
      .then((data) => setProducts((data as { products: Product[] }).products || (data as Product[])))
      .catch(() => {});
  };

  useEffect(() => { fetchProducts(); }, [category, sort]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Marketplace</h1>
          <p className="text-gray-500">Browse verified listings from campus sellers</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-10"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline sm:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select className="input-field w-full sm:w-40" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex gap-8">
          <aside className={`w-56 shrink-0 space-y-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
            <div className="card !p-4">
              <h3 className="mb-3 font-semibold">Category</h3>
              <div className="space-y-2">
                <button
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${!category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => setCategory('')}
                >
                  All Categories
                </button>
                {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
                  <button
                    key={cat}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${category === cat ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-50'}`}
                    onClick={() => setCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="card !p-4">
              <h3 className="mb-3 font-semibold">Price Range</h3>
              <div className="space-y-2">
                <input className="input-field" placeholder="Min (₦)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <input className="input-field" placeholder="Max (₦)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                <button onClick={fetchProducts} className="btn-primary w-full !py-2 !text-xs">Apply</button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="card py-16 text-center text-gray-500">No products found</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
