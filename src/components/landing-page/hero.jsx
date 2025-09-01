import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-white bg-transparent">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pt-12 pb-20 md:grid-cols-2 md:pt-18 md:pb-32 lg:px-8 items-center">
        {/* Left Column: Text */}
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="py-4 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-xl">
            Discover the Perfect{" "}
            <span className="text-indigo-400 underline decoration-wavy underline-offset-8">
              Digital Membercard
            </span>
            <span className="block mt-2 text-3xl sm:text-4xl font-bold text-indigo-200">
              for You
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-indigo-100 text-lg sm:text-xl font-normal leading-relaxed animate-fade-in-delay">
            Unlock exclusive rewards, enjoy seamless transactions, and
            experience next-level security with our digital membercard platform.
            Join thousands of happy members today!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-delay">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-3 text-base font-semibold shadow-lg hover:bg-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Get Started
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-400 px-8 py-3 text-base font-semibold text-indigo-200 hover:bg-indigo-400/10 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-4 animate-fade-in-delay">
            <div className="flex -space-x-4">
              <img
                className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shadow-md"
                src="https://i.pravatar.cc/48?img=1"
                alt="user 1"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shadow-md"
                src="https://i.pravatar.cc/48?img=2"
                alt="user 2"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shadow-md"
                src="https://i.pravatar.cc/48?img=3"
                alt="user 3"
              />
            </div>
            <div className="inline-flex flex-col items-start">
              <p className="font-bold text-lg text-indigo-100">10.2k+</p>
              <p className="text-indigo-300 text-xs">Active users worldwide</p>
            </div>
          </div>
        </div>
        {/* Right Column: Card Image with Glow */}
        <div className="relative h-[420px] w-full flex items-center justify-center animate-fade-in-up">
          {/* Blue Glow Effect */}
          <div className="absolute w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[180px] opacity-50"></div>
          {/* Card Image */}
          <Image
            src="/card.png"
            alt="Digital Membercard"
            width={550}
            height={320}
            className="relative z-10 drop-shadow-2xl rounded-3xl border-4 border-indigo-400/30"
          />
        </div>
      </div>
    </section>
  );
}
