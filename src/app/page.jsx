import Link from "next/link";
import Hero from "@/components/landing-page/hero";
import Navbar from "@/components/landing-page/navbar";
import Partners from "@/components/landing-page/partners";
import Stats from "@/components/landing-page/stats";

import Testimonials from "@/components/landing-page/testimonials";
import myPoints from "@/components/landing-page/myPoints";
import Offers from "@/components/landing-page/offers";
import Faq from "@/components/landing-page/faq";
import Features from "@/components/landing-page/features";
import Promotions from "@/components/landing-page/promotion";
import Footer from "@/components/landing-page/footer";
import MyPoints from "@/components/landing-page/myPoints";

export default function Home() {
  return (
    <main>
      <div className="bg-cover bg-[url('/bg-blue.png')]">
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

        <Testimonials />
        <section id="faq">
          <Faq />
        </section>
        <Features />
        <Promotions />
        <Footer />
      </div>

      {/* Nanti kita bisa tambahkan komponen FAQ dan Footer di sini */}
    </main>

    // <div>
    //   Landing Page
    //   <div className="flex gap-4">
    //     <Link href="/auth/login" className="p-2 bg-blue-500 text-white">
    //       Login
    //     </Link>
    //     <Link
    //       href="/auth/register-admin"
    //       className="p-2 bg-blue-500 text-white"
    //     >
    //       register admin
    //     </Link>
    //     <Link href="/auth/register-customer">register customer</Link>
    //   </div>
    // </div>
  );
}
