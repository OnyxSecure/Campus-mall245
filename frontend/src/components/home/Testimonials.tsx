import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Adaeze O.',
    role: 'Buyer · Engineering',
    text: 'I bought a laptop through Campus-Mall and the escrow system gave me peace of mind. Seller delivered same day and I confirmed — smooth experience!',
  },
  {
    name: 'Tunde A.',
    role: 'Seller · Business Admin',
    text: 'As a seller, I love that payments are guaranteed. No more buyers sending fake transfer screenshots. Campus-Mall changed how I sell on campus.',
  },
  {
    name: 'Fatima I.',
    role: 'Buyer · Medicine',
    text: 'Got my textbooks for half the bookstore price. The verified seller badge made me confident I wasn\'t getting scammed.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl">What Students Say</h2>
          <p className="text-gray-600">Real experiences from campus buyers and sellers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card relative">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="mb-6 text-sm leading-relaxed text-gray-600">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-semibold text-secondary">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
