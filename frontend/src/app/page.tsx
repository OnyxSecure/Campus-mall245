import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import VerifiedSellers from '@/components/home/VerifiedSellers';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedProducts />
      <VerifiedSellers />
      <Testimonials />
      <FAQ />
    </>
  );
}
