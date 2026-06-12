'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { api } from '@/lib/api';

function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('error');
      return;
    }

    api.transactions.verify(reference)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Verifying Payment...</h2>
            <p className="mt-2 text-sm text-gray-500">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
            <h2 className="text-xl font-bold text-success">Payment Secured!</h2>
            <p className="mt-2 text-sm text-gray-500">Your payment is held in escrow. The seller has been notified to deliver your item.</p>
            <button onClick={() => router.push('/orders')} className="btn-primary mt-6">View My Orders</button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
            <h2 className="text-xl font-bold text-error">Payment Failed</h2>
            <p className="mt-2 text-sm text-gray-500">Something went wrong. Please try again or contact support.</p>
            <button onClick={() => router.push('/marketplace')} className="btn-primary mt-6">Back to Marketplace</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentCallback />
    </Suspense>
  );
}
