import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const isVerified = product.seller?.sellerProfile?.status === 'APPROVED';

  return (
    <Link href={`/marketplace/${product.id}`} className="group card !p-0 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images[0] || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 badge-primary">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-secondary line-clamp-1 group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mb-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
            <span>{product.seller?.fullName || 'Seller'}</span>
          </div>
          <span>{formatDate(product.createdAt)}</span>
        </div>
        <span className={`mt-2 inline-block text-xs ${product.condition === 'NEW' ? 'badge-success' : 'badge-warning'}`}>
          {product.condition === 'NEW' ? 'New' : 'Fairly Used'}
        </span>
      </div>
    </Link>
  );
}
