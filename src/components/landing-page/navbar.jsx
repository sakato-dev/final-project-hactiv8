import Link from "next/link";

export default function Navbar() {
  return (
    <header className="text-white">
      <div className="relative mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="PointJuaro Logo"
              width={100}
              height={100}
            />
          </div>

          <ul className="flex-1 hidden md:flex items-center justify-center gap-10">
            <li>
              <Link
                href="#"
                className="opacity-90 hover:opacity-100 transition"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="opacity-90 hover:opacity-100 transition"
              >
                Our Merchants
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="opacity-90 hover:opacity-100 transition"
              >
                My Points
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="opacity-90 hover:opacity-100 transition"
              >
                Payments
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="opacity-90 hover:opacity-100 transition"
              >
                FAQs
              </Link>
            </li>
          </ul>

          <div className="flex-shrink-0">
            <Link
              href="#"
              className="inline-flex rounded-full border border-red-500/70 px-5 py-2 text-sm
                         hover:border-red-400 hover:text-red-200 transition text-red-500"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
