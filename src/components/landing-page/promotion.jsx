import Image from "next/image";

// Data untuk kartu promosi, bisa Anda tambahkan lagi nanti
const promotions = [
  {
    brand: "Starbucks",
    tagline1: "It's not just Coffee",
    tagline2: "It's Starbucks",
    logoUrl: "/sbuxlogo.png", // Ganti dengan URL logo
    productImageUrl: "/sbuxproduct.jpg", // Ganti dengan URL gambar produk
    backgroundClass: "from-green-900 to-gray-800", // Gradasi untuk Starbucks
  },
  {
    brand: "Kopi Kenangan",
    tagline1: "Kenangan di Setiap",
    tagline2: "Tetesnya",
    logoUrl: "/kopikenanganlogo.png",
    productImageUrl: "/kopkenproduct.jpg",
    backgroundClass: "from-yellow-900 to-red-900", // Gradasi untuk Kopi Kenangan
  },
  {
    brand: "McDonald's",
    tagline1: "I'm Lovin' It",
    tagline2: "",
    logoUrl: "/mcdlogo.png",
    productImageUrl: "/mcdproduct.png",
    backgroundClass: "from-red-700 to-yellow-500", // Gradasi untuk McDonald's
  },
];

export default function Promotions() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
          Merchant Promotion
        </h2>

        <div className="flex space-x-8 overflow-x-auto pb-6 -mx-6 px-6">
          {promotions.map((promo, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-[450px] h-64 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${promo.backgroundClass} opacity-80`}
              ></div>

              {/* Konten Kartu */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                <Image
                  src={promo.logoUrl}
                  alt={`${promo.brand} logo`}
                  width={80}
                  height={80}
                  className="absolute top-4 left-4 opacity-50"
                />

                <h3 className="text-4xl font-extrabold uppercase tracking-wider">
                  {promo.tagline1}
                  <br />
                  <span className="text-green-300">{promo.tagline2}</span>
                </h3>
              </div>

              {/* Gambar Produk */}
              <Image
                src={promo.productImageUrl}
                alt={`${promo.brand} product`}
                width={120}
                height={200}
                className="absolute z-20 -bottom-4 right-4 transform rotate-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
