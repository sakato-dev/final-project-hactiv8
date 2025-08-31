import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <blockquote className="rounded-lg bg-white/5 p-8">
            <p className="text-gray-300">
              “Great session! Dani was super helpful. She shared some practical
              advice on how can lorem ipsem we go about refining our service
              offerings.”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/creditcard.png"
                alt=""
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Hadid Khan</div>
                <div className="text-gray-400 text-sm">UX/UI Designer</div>
              </div>
            </footer>
          </blockquote>
          {/* Testimonial 2 */}
          <blockquote className="rounded-lg bg-white/5 p-8">
            <p className="text-gray-300">
              “It is both attractive and highly adaptable. It’s exactly what
              I’ve been looking for. Definitely wo lorem ipsum dolorth the
              investment.”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/creditcard.png"
                alt=""
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Wade Warren</div>
                <div className="text-gray-400 text-sm">Web Designer</div>
              </div>
            </footer>
          </blockquote>
          {/* Testimonial 3 */}
          <blockquote className="rounded-lg bg-white/5 p-8">
            <p className="text-gray-300">
              “I am really satisfied with it. I'm good to go. It really saves me
              time and effort. It’s exactly what our business has been lacking.”
            </p>
            <footer className="mt-6 flex items-center gap-x-4">
              <Image
                className="h-10 w-10 rounded-full bg-gray-50"
                src="/creditcard.png"
                alt=""
                width={40}
                height={40}
              />
              <div>
                <div className="font-semibold text-white">Jenny Wilson</div>
                <div className="text-gray-400 text-sm">Trust Administrator</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
