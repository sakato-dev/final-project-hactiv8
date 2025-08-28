import Link from "next/link";
import Hero from "@/components/landing-page/hero";
import Navbar from "@/components/landing-page/navbar";
import Partners from "@/components/landing-page/partners";
import Stats from "@/components/landing-page/stats";

import Testimonials from "@/components/landing-page/testimonials";
import CardDesign from "@/components/landing-page/cardDesign";
import Offers from "@/components/landing-page/offers";
import Faq from "@/components/landing-page/faq";
import Features from "@/components/landing-page/features";

export default function Home() {
  return (
    <main>
      <div className="bg-[url('/bg-blue.png')]">
        <Navbar />
        <Hero />
        <Stats />
        <Partners />
        <Offers />
        <CardDesign />
        <Testimonials />
        <Faq />
        <Features />
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
