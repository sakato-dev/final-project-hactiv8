import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-10 py-16 md:grid-cols-2 md:py-24 lg:px-6">
        <div className="relative z-10">
          <h1 className="relative text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Discover the Perfect
            <br />
            <span className="relative inline-block">
              Loyalty Program
              <img
                src="/curvedredstroke.png"
                alt=""
                aria-hidden
                width={360}
                height={100}
                className="pointer-events-none absolute left-[-8%] top-[78%] w-[92%] select-none"
              />
            </span>
            <br />
            for You
          </h1>

          <p className="mt-6 max-w-xl text-base/7 text-white/85 md:text-lg/8">
            Discover the power of our secure and rewarding loyalty program.
            Explore digital membercards and enjoy exclusive benefits made just
            for you.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium hover:bg-red-700 transition"
            >
              Get Started
              <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 ring-2 ring-[#160b0b]" />
              <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-pink-300 to-red-500 ring-2 ring-[#160b0b]" />
              <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 ring-2 ring-[#160b0b]" />
            </div>
            <p className="text-sm text-white/90">
              <span className="font-semibold">10.2k+</span> Active users around
              the world
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center justify-end">
          <img
            src="/creditcard.png"
            alt="Credit card"
            className="mr-0 w-[600px] lg:w-[680px] xl:w-[720px] max-w-[60vw] drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
    </section>
  );
}
