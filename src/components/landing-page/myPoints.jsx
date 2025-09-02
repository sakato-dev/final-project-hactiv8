import Image from "next/image";
import Link from "next/link";

export default function MyPoints() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2 bg-white/5 rounded-3xl shadow-xl border border-indigo-400/20 p-10">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
              My Points
            </h2>
            <p className="mt-4 text-lg leading-8 text-indigo-100">
              Track your loyalty points in real time and unlock exclusive
              rewards with your digital membercard. Every transaction brings you
              closer to special offers and benefits. Manage your points easily
              and never miss out on a reward again!
            </p>
            <div className="mt-8">
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-3 text-base font-semibold shadow-lg hover:bg-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Learn More →
              </Link>
            </div>
          </div>
          <div className="relative h-80 flex items-center justify-center">
            <Image
              src="/cardDesign.png"
              alt="Digital Membercard"
              width={400}
              height={250}
              className="rounded-2xl shadow-2xl border-4 border-indigo-400/20 transform rotate-6 transition-transform duration-500 hover:rotate-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
