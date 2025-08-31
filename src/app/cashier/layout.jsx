"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import {
  FaHome,
  FaShoppingCart,
  FaQrcode,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { auth } from "@/lib/firebase";

// Helper function to format date and time (moved outside the component)
const formatDateTime = (date) => {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta", // WIB
  };
  const time = new Intl.DateTimeFormat("en-GB", options).format(date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${time} ${day}/${month}/${year}`;
};

// Navigation items constant (moved outside the component)
const navItems = [
  { href: "/cashier/home", icon: FaHome, label: "Home" },
  { href: "/cashier/cart", icon: FaShoppingCart, label: "Cart" },
  { href: "/cashier/scan-qr", icon: FaQrcode, label: "Scan QR" },
];

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef(null);

  // Effect for the real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect to close the dropdown when clicking outside
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
    Swal.fire({
      title: "Are you sure you want to log out?",
      text: "You can log in again at any time.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316", // Orange-600
      cancelButtonColor: "#6b7280", // Gray-500
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        auth.signOut().then(() => {
          router.push("/auth/login");
        });
      }
    });
  };

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Column: Logo */}
          <div className="flex-1 flex justify-start">
            <span className="text-zinc-900 text-xl font-semibold font-['Poppins']">
              Cashier
            </span>
          </div>

          {/* Center Column: Desktop Menu */}
          <div className="hidden md:flex justify-center">
            <div className="flex items-center gap-8">
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
          </div>

          {/* Right Column: Clock & Avatar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-end">
            <div className="flex items-center gap-4">
              <span className="tabular-nums text-zinc-900 text-md leading-tight">
                {formatDateTime(currentTime)}
              </span>

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
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile View: Hamburger Button */}
          <div className="md:hidden flex items-center pr-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-2xl text-gray-700"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
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
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.href === "/cashier/cart" && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}

            <div className="border-t my-2"></div>

            {/* User Info & Logout in Mobile Menu */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full"
                  src={auth.currentUser?.photoURL || "https://i.pravatar.cc/40"}
                  alt="User Profile"
                />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    {auth.currentUser?.displayName || "User"}
                  </p>
                  <p className="text-gray-500">{auth.currentUser?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function CashierLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 text-black">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
