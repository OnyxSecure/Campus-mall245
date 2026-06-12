'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'How does the escrow payment system work?',
    a: 'When you buy an item, your payment is processed through Paystack and held securely in escrow. The seller only receives the funds after you confirm you\'ve received the product in good condition.',
  },
  {
    q: 'How are sellers verified?',
    a: 'Sellers must upload their student ID card and profile photo. Our admin team reviews each application before approving seller accounts. Only approved sellers can list products.',
  },
  {
    q: 'What if I don\'t receive my item?',
    a: 'You can open a dispute with evidence (screenshots, messages, etc.). Our admin team will review the case and can approve a refund or release payment to the seller based on the evidence.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all payment methods supported by Paystack including debit cards, bank transfers, and USSD payments.',
  },
  {
    q: 'How do sellers withdraw their earnings?',
    a: 'Once a buyer confirms delivery, funds are released to the seller\'s wallet. Sellers can then withdraw their available balance to their bank account.',
  },
  {
    q: 'Is Campus-Mall free to use?',
    a: 'Registration is free for both buyers and sellers. A small service fee may apply to transactions to maintain the platform and escrow system.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about Campus-Mall</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white">
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-secondary"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-gray-400 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="border-t border-gray-50 px-6 py-4 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
