"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#hero", label: "About Us" },
    { href: "#partners", label: "Our Merchants" },
    { href: "#mypoints", label: "My Points" },
    { href: "#faq", label: "FAQs" },
    { href: "#features", label: "Features" },
    { href: "/auth/login", label: "Login" },
  ];

  return (
    // Penambahan kelas untuk membuat navbar fixed
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm text-white">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="PointJuaro Logo"
                width={120}
                height={50}
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Navigasi untuk Desktop */}
          <ul className="hidden md:flex items-center justify-center font-base gap-10">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="opacity-80 hover:opacity-100 transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Tombol Kontak untuk Desktop */}
          <div className="hidden md:block flex-shrink-0">
            <Link
              href="#"
              className="inline-flex rounded-full border-2 border-blue-700 px-8 py-2 text-sm
                         hover:bg-blue-700 hover:text-white transition text-white font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Tombol Hamburger untuk Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-gray-900/80 backdrop-blur-md absolute w-full">
          <ul className="flex flex-col items-center gap-6 py-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-lg opacity-90 hover:opacity-100 transition"
                  onClick={() => setIsOpen(false)} // Menutup menu setelah link diklik
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="#"
                className="mt-4 inline-flex rounded-full border-2 border-blue-700 px-8 py-2 text-base
                           hover:bg-blue-700 hover:text-white transition text-white font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
