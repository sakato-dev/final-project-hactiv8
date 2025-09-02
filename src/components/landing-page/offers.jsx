import { FaShieldAlt, FaStar, FaLock } from "react-icons/fa";

const features = [
  {
    name: "Security Guarantee",
    description:
      "Your data and transactions are protected with the highest level of security, ensuring your peace of mind.",
    icon: FaShieldAlt,
  },
  {
    name: "Exclusive Rewards",
    description:
      "Unlock special rewards, discounts, and offers available only to our loyal members.",
    icon: FaStar,
  },
  {
    name: "Data Privacy",
    description:
      "We are committed to protecting your privacy. Your personal information is never shared without your consent.",
    icon: FaLock,
  },
];

export default function Offers() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* Section Title */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg mb-4 animate-fade-in-up">
            Discover What We{" "}
            <span className="text-indigo-400 underline decoration-wavy underline-offset-4">
              Offer
            </span>
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto animate-fade-in-delay">
            Experience a new level of security, rewards, and privacy designed
            just for you.
          </p>
        </div>
        {/* Features Cards */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col bg-white/5 rounded-2xl shadow-lg border border-indigo-400/20 p-8 items-center text-center hover:scale-105 transition-transform duration-200"
              >
                <dt className="flex flex-col items-center gap-y-3 text-2xl font-semibold leading-7 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-400/20 border border-indigo-400 mb-2 shadow-md">
                    <feature.icon
                      className="h-8 w-8 text-indigo-400"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-indigo-100">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
