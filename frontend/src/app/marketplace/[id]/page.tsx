'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Shield, MapPin, Phone, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Product, CATEGORY_LABELS } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products.get(id as string)
      .then((p) => setProduct(p as Product))
      .catch(() => setError('Product not found'));
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'BUYER') {
      setError('Only buyers can purchase products');
      return;
    }
    setBuying(true);
    setError('');
    try {
      const data = await api.transactions.initiate(product!.id);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setBuying(false);
    }
  };

  if (!product && !error) {
    return <div className="flex min-h-[50vh] items-center justify-center">Loading...</div>;
  }

  if (error && !product) {
    return <div className="flex min-h-[50vh] items-center justify-center text-error">{error}</div>;
  }

  const isVerified = product!.seller?.sellerProfile?.status === 'APPROVED';

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-white">
              <Image
                src={product!.images[selectedImage] || 'https://placehold.co/600x600'}
                alt={product!.name}
                fill
                className="object-cover"
              />
            </div>
            {product!.images.length > 1 && (
              <div className="flex gap-2">
                {product!.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="badge-primary">{CATEGORY_LABELS[product!.category]}</span>
              <span className={product!.condition === 'NEW' ? 'badge-success' : 'badge-warning'}>
                {product!.condition === 'NEW' ? 'New' : 'Fairly Used'}
              </span>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-secondary">{product!.name}</h1>
            <p className="mb-6 text-3xl font-bold text-primary">{formatPrice(product!.price)}</p>

            <p className="mb-8 leading-relaxed text-gray-600">{product!.description}</p>

            <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-success">
              <Shield className="h-5 w-5 shrink-0" />
              Payment protected by escrow. Funds released only after you confirm delivery.
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-error">{error}</div>}

            <button onClick={handleBuy} className="btn-primary mb-4 w-full !py-4 text-base" disabled={buying}>
              {buying ? 'Processing...' : 'Buy Now — Pay Securely'}
            </button>

            <div className="card">
              <h3 className="mb-4 font-semibold">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {product!.seller?.fullName?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Link href={`/sellers/${product!.seller?.id}`} className="font-semibold hover:text-primary">
                      {product!.seller?.fullName}
                    </Link>
                    {isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-sm text-gray-500">{product!.seller?.sellerProfile?.department}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                {product!.seller?.phone && (
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {product!.seller.phone}</div>
                )}
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> On Campus</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Posted {formatDate(product!.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
