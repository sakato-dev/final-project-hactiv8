import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      {/* Digital Membercard Info Text */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 mb-12 animate-fade-in-up text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          What Our Members Say
        </h3>
        <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
          Discover how our digital membercard has transformed the experience of
          our users—making rewards, payments, and loyalty easier than ever.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <blockquote className="rounded-2xl bg-white/5 p-8 shadow-xl border border-indigo-400/20 h-full flex flex-col justify-between">
            <p className="text-indigo-100 text-lg italic">
              “The digital membercard makes earning and redeeming rewards so
              simple. I love how I can manage everything from my phone!”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/student.jpg"
                alt="Hani Amara"
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Hani Amara</div>
                <div className="text-gray-400 text-sm">Student</div>
              </div>
            </footer>
          </blockquote>
          {/* Testimonial 2 */}
          <blockquote className="rounded-2xl bg-white/5 p-8 shadow-xl border border-indigo-400/20 h-full flex flex-col justify-between">
            <p className="text-indigo-100 text-lg italic">
              “I never worry about losing my card anymore. The digital
              membercard is always with me, and the exclusive offers are a huge
              bonus!”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/traveler.jpg"
                alt="Wade Warren"
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Wade Warren</div>
                <div className="text-gray-400 text-sm">Traveler</div>
              </div>
            </footer>
          </blockquote>
          {/* Testimonial 3 */}
          <blockquote className="rounded-2xl bg-white/5 p-8 shadow-xl border border-indigo-400/20 h-full flex flex-col justify-between">
            <p className="text-indigo-100 text-lg italic">
              “Managing my loyalty points and rewards has never been easier. The
              digital membercard is a game changer for our business!”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/b.jpg"
                alt="Jenny Wilson"
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Jenny Wilson</div>
                <div className="text-gray-400 text-sm">Professional</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
