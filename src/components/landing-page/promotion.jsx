import Image from "next/image";

const promotions = [
  {
    brand: "Starbucks",
    tagline1: "Discount Voucher",
    tagline2: "20%",
    logoUrl: "/sbuxlogo.png", // Ganti dengan URL logo
    productImageUrl: "/sbuxproduct.jpg", // Ganti dengan URL gambar produk
    backgroundClass: "from-green-900 to-gray-800", // Gradasi untuk Starbucks
  },
  {
    brand: "Kopi Kenangan",
    tagline1: "Free Product",
    tagline2: "Iced Oat Latte",
    logoUrl: "/kopikenanganlogo.png",
    productImageUrl: "/kopkenproduct.jpg",
    backgroundClass: "from-yellow-900 to-red-900", // Gradasi untuk Kopi Kenangan
  },
  {
    brand: "McDonald's",
    tagline1: "Discount Voucher",
    tagline2: "15%",
    logoUrl: "/mcdlogo.png",
    productImageUrl: "/mcdproduct.png",
    backgroundClass: "from-red-700 to-yellow-500", // Gradasi untuk McDonald's
  },
];

export default function Promotions() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-14 drop-shadow-lg animate-fade-in-up">
          Merchant Promotion
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo, index) => (
            <div
              key={index}
              className="relative w-full h-72 rounded-3xl overflow-hidden shadow-xl border border-indigo-400/20 bg-white/5 hover:scale-105 transition-transform duration-200"
            >
              {/* Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${promo.backgroundClass} opacity-80`}
              ></div>
              {/* Card Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
                <Image
                  src={promo.logoUrl}
                  alt={`${promo.brand} logo`}
                  width={64}
                  height={64}
                  className="absolute top-6 left-6 opacity-60"
                />
                <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wider mb-2">
                  {promo.tagline1}
                  <br />
                  <span className="text-green-300 text-4xl">
                    {promo.tagline2}
                  </span>
                </h3>
                <span className="text-indigo-100 text-lg font-semibold mt-2 block">
                  {promo.brand}
                </span>
              </div>
              {/* Product Image */}
              <Image
                src={promo.productImageUrl}
                alt={`${promo.brand} product`}
                width={110}
                height={180}
                className="absolute z-10 top-6 right-6 transform rotate-12 drop-shadow-xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
