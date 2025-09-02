import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

const featuresData = [
  {
    title: "Point of Sale Integration",
    description:
      "Our digital membercard is fully integrated with merchant point of sale (POS) systems, allowing you to earn and redeem points instantly at checkout. Enjoy seamless transactions and exclusive rewards every time you shop!",
    points: [
      "Seamless POS and membercard sync",
      "Instant rewards at checkout",
      "Works with top retail partners",
      "No physical card needed",
    ],
    buttonText: "Get Your Digital Membercard",
    imageUrl: "/feature2.png",
    imageSide: "left",
  },
  {
    title: "Mobile App Digital Membercard",
    description:
      "Access your digital membercard anytime, anywhere with our mobile app. Track your points, discover new offers, and manage your membership with ease—all from your smartphone.",
    points: [
      "Real-time point tracking",
      "Personalized offers and notifications",
      "Easy access to your digital membercard",
      "Mobile-first experience",
    ],
    buttonText: "Download the App",
    imageUrl: "/mobileapps.png",
    imageSide: "right",
  },
];

export default function Features() {
  return (
    <section className="pt-6 md:py-6 lg:py-12 space-y-12 bg-transparent">
      {/* Digital Membercard Info Card */}
      <div className="mx-auto max-w-3xl mb-16 animate-fade-in-up px-4 md:px-8 lg:px-12"></div>
      {featuresData.map((feature, index) => (
        <div key={index} className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div
            className={`grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2`}
          >
            {/* Image Column */}
            <div
              className={`relative h-[420px] sm:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-indigo-400/20 bg-white/5 ${
                feature.imageSide === "right" ? "lg:order-last" : ""
              }`}
            >
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                layout="fill"
                objectFit="contain"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
            {/* Text Column */}
            <div className="text-left px-2 sm:px-8">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                {feature.title}
              </h2>
              <p className="mt-4 text-lg leading-8 text-indigo-100">
                {feature.description}
              </p>
              <ul className="mt-8 space-y-4 text-indigo-100">
                {feature.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex gap-x-3 items-center">
                    <FaCheckCircle
                      className="h-5 w-5 flex-none text-indigo-400"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {feature.buttonText && (
                <div className="mt-10">
                  <Link
                    href="#"
                    className="inline-flex rounded-full bg-indigo-500 px-8 py-3 text-base font-semibold shadow-lg hover:bg-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {feature.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
