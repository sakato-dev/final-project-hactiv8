import Image from "next/image";
import Link from "next/link";

export default function MyPoints() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your Point...
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
              vulputate libero et velit interdum, ac aliquet odio mattis. Class
              aptent taciti sociosqu ad litora torquent per conubia nostra, per
              inceptos himenaeos. Curabitur tempus urna at turpis condimentum
              lobortis. Ut commodo efficitur neque.
            </p>
            <div className="mt-8">
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium hover:bg-indigo-700 transition"
              >
                Learn More →
              </Link>
            </div>
          </div>
          <div className="relative h-96">
            <Image
              src="/cardDesign.png"
              alt="Card 1"
              width={400}
              height={250}
              className="absolute top-0 right-0 transform rotate-6 transition-transform duration-500 hover:rotate-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
