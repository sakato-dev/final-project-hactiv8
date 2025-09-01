import Hero from "@/components/landing-page/hero";
import Navbar from "@/components/landing-page/navbar";
import Stats from "@/components/landing-page/stats";
import Offers from "@/components/landing-page/offers";
import Faq from "@/components/landing-page/faq";
import Features from "@/components/landing-page/features";
import Footer from "@/components/landing-page/footer";
import Testimonials from "@/components/landing-page/testimonials";
import Partners from "@/components/landing-page/partners";
import MyPoints from "@/components/landing-page/myPoints";
import Promotions from "@/components/landing-page/promotion";

export default function Home() {
  return (
    <div className="bg-[url('/bg-blue.png')] bg-cover bg-center">
      <main>
        <Navbar />
        <section id="hero">
          <Hero />
        </section>
        <Stats />
        <section id="partners">
          <Partners />
        </section>
        <Offers />
        <section id="mypoints">
          <MyPoints />
        </section>
        <section id="features">
          <Features />
        </section>
        <Testimonials />
        <section id="faq">
          <Faq />
        </section>
        <Promotions />
        <Footer />
      </main>
    </div>
  );
}
