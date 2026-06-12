import { Search, CreditCard, Package, CheckCircle, Wallet } from 'lucide-react';

const steps = [
  { icon: Search, title: 'Find Product', description: 'Browse verified listings from fellow students on campus.' },
  { icon: CreditCard, title: 'Pay Securely', description: 'Pay through Paystack. Funds are held in escrow until delivery.' },
  { icon: Package, title: 'Receive Product', description: 'Meet the seller on campus and collect your item.' },
  { icon: CheckCircle, title: 'Confirm Delivery', description: 'Confirm you received the product in good condition.' },
  { icon: Wallet, title: 'Seller Gets Paid', description: 'Payment is released to the seller\'s wallet automatically.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Five simple steps to safe campus transactions. Your money is protected every step of the way.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] bg-primary/20 lg:block" />
              )}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="mb-2 text-xs font-bold text-primary">Step {i + 1}</div>
              <h3 className="mb-2 font-semibold text-secondary">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
