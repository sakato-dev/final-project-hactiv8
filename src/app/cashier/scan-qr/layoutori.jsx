"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { auth } from "@/lib/firebase";
import {
  FaHome,
  FaShoppingCart,
  FaQrcode,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

// Helper function untuk memformat tanggal dan waktu
const formatDateTime = (date) => {
  // Opsi untuk format waktu Indonesia (WIB)
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Gunakan format 24 jam
    timeZone: "Asia/Jakarta",
  };

  const time = new Intl.DateTimeFormat("en-GB", options).format(date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${time} ${day}/${month}/${year}`;
};

// Komponen Navbar dengan UI yang sudah diperbarui
function Navbara() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef(null);

  // Effect untuk jam real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect untuk menutup dropdown saat klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    auth.signOut();
    router.push("/auth/login");
  };

  const navItems = [
    { href: "/cashier/home", icon: FaHome, label: "Home" },
    { href: "/cashier/cart", icon: FaShoppingCart, label: "Cart" },
    { href: "/cashier/scan-qr", icon: FaQrcode, label: "Scan QR" },
  ];

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <span className="text-zinc-900 text-xl font-semibold font-['Poppins']">
            Kasir
          </span>

          {/* Desktop Menu (Center) */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="relative flex items-center gap-2 cursor-pointer group">
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-orange-600"
                        : "text-zinc-500 group-hover:text-orange-500"
                    }`}
                  />
                  <span
                    className={`text-base font-['Poppins'] transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-orange-600 font-medium"
                        : "text-zinc-500 font-normal group-hover:text-orange-500"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.href === "/cashier/cart" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Right side elements (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="w-[180px] px-5 py-2 bg-slate-50 rounded-[40px] shadow-sm">
              <span className="text-zinc-900 text-sm font-normal font-['Poppins'] leading-tight">
                {formatDateTime(currentTime)}
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              <img
                className="w-11 h-11 rounded-full cursor-pointer"
                src={auth.currentUser?.photoURL || "https://i.pravatar.cc/44"}
                alt="User Profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Side (Avatar and Menu Button) */}
          <div className="md:hidden flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src={auth.currentUser?.photoURL || "https://i.pravatar.cc/40"}
                alt="User Profile"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-2xl text-gray-700"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-md font-medium cursor-pointer ${
                    pathname === item.href
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.href === "/cashier/cart" && cartCount > 0 && (
                    <span className="absolute top-1.5 left-8 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// Komponen Layout Utama yang membungkus halaman dengan CartProvider
export default function CashierLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbara />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
