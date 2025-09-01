import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-10 py-16 md:grid-cols-2 md:py-24 lg:px-6 items-center">
        {/* Kolom Kiri: Teks */}
        <div className="relative z-10">
          <h1 className="relative py-6 text-4xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Discover the Perfect
            <br />
            <span className="relative inline-block">
              Digital Membercard
              {/* Anda bisa menggunakan gambar underline dari desain jika ada */}
            </span>
            <br />
            for You
          </h1>

          <p className="mt-6 max-w-xl text-zinc-400 text-lg font-normal leading-normal">
            Discover the power of our secure and rewarding digital membercards.
            Explore our range of cards and take control of your loyalty points
            today.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-8 py-3 text-base font-medium hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-4">
              {/* Placeholder untuk avatar pengguna */}
              <img
                className="w-12 h-12 rounded-full border-2 border-black object-cover"
                src="https://i.pravatar.cc/48?img=1"
                alt="user 1"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-black object-cover"
                src="https://i.pravatar.cc/48?img=2"
                alt="user 2"
              />
              <img
                className="w-12 h-12 rounded-full border-2 border-black object-cover"
                src="https://i.pravatar.cc/48?img=3"
                alt="user 3"
              />
            </div>
            <div className="inline-flex flex-col items-start">
              <p className="font-bold">10.2k+</p>
              <p className="text-zinc-400 text-xs">
                Active users around the world
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Gambar */}
        <div className="relative h-[400px] w-full flex items-center justify-center">
          {/* Efek lingkaran biru di belakang kartu */}
          <div className="absolute w-[492px] h-[492px] bg-blue-700 rounded-full blur-[200px] opacity-60"></div>

          {/* Gambar Kartu */}
          <Image
            src="/card.png"
            alt="Digital Membercard"
            width={550}
            height={320}
            className="relative z-10 drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
