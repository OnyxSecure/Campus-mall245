import { BadgeCheck, Shield, Star } from 'lucide-react';

const features = [
  { icon: BadgeCheck, title: 'ID Verification', description: 'Every seller submits their student ID card for admin review before listing.' },
  { icon: Shield, title: 'Escrow Protection', description: 'Payments are held securely until buyers confirm they received their items.' },
  { icon: Star, title: 'Trusted Community', description: 'Buy from verified students on your campus with full accountability.' },
];

export default function VerifiedSellers() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl">
              Verified Sellers You Can Trust
            </h2>
            <p className="mb-8 text-gray-600">
              Every seller on Campus-Mall goes through a verification process. We review student ID cards,
              profile information, and department details before approving any seller account.
            </p>
            <div className="space-y-6">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-8 text-white">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20" />
                <div>
                  <p className="font-semibold">Jane Seller</p>
                  <p className="text-sm text-white/70">Computer Science · Verified</p>
                </div>
                <BadgeCheck className="ml-auto h-8 w-8 text-green-300" />
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-white/10 p-4 text-center">
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-white/70">Listings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-xs text-white/70">Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5.0</p>
                  <p className="text-xs text-white/70">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
