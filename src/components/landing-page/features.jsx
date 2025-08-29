import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

const featuresData = [
  {
    title: "Gorem ipsum dolor sit amet consectetur",
    description:
      "Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent.",
    points: [
      "Rorem ipsum dolor sit amet, consectetur.",
      "Nunc vulputate libero et velit interdum.",
      "Class aptent taciti sociosqu ad litora.",
    ],
    buttonText: "Get Started Now",
    imageUrl: "/feature2.png",
    imageSide: "left",
  },
  {
    title: "Yorem ipsum dolor & sit amet consectetur",
    description:
      "Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    points: [
      "Morem ipsum dolor sit amet, consectetur.",
      "Nunc vulputate libero et velit interdum.",
      "Morem ipsum dolor sit amet.",
      "Ac aliquet odio mattis.",
    ],
    buttonText: null,
    imageUrl: "/mobileapps.png",
    imageSide: "right",
  },
];

export default function Features() {
  return (
    <section className="py-20 sm:py-24 space-y-24">
      {featuresData.map((feature, index) => (
        <div key={index} className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2`}
          >
            {/* Kolom Gambar (Dengan Perbaikan) */}
            <div
              className={`relative h-[550px] rounded-3xl overflow-hidden ${
                // <-- Tambahkan rounded-3xl & overflow-hidden di sini
                feature.imageSide === "right" ? "lg:order-last" : ""
              }`}
            >
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                layout="fill"
                objectFit="contain" // <-- Ganti menjadi "cover"
              />
            </div>

            {/* Kolom Teks */}
            <div className="text-left">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {feature.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                {feature.description}
              </p>
              <ul className="mt-8 space-y-4 text-gray-300">
                {feature.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex gap-x-3">
                    <FaCheckCircle
                      className="mt-1 h-5 w-5 flex-none text-indigo-400"
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
                    className="inline-flex rounded-lg bg-gray-800 px-6 py-3 text-sm font-medium hover:bg-gray-700 transition"
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
