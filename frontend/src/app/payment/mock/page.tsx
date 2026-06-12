'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function MockPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card max-w-md text-center">
        <h2 className="mb-2 text-xl font-bold">Mock Payment (Dev Mode)</h2>
        <p className="mb-6 text-sm text-gray-500">
          Paystack is not configured. Click below to simulate a successful payment.
        </p>
        <p className="mb-4 text-xs text-gray-400">Reference: {ref}</p>
        <button
          onClick={() => router.push(`/payment/callback?reference=${ref}`)}
          className="btn-primary w-full"
        >
          Simulate Successful Payment
        </button>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center">Loading...</div>}>
      <MockPayment />
    </Suspense>
  );
}
