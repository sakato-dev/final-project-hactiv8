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
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What do we <span className="text-indigo-400">offer</span>?
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-2xl font-semibold leading-7 text-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                    <feature.icon
                      className="h-8 w-8 text-indigo-400"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
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
