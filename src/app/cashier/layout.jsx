"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome,
  FaShoppingCart,
  FaQrcode,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="font-bold text-xl">Kasir</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      pathname === item.href
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.href === "/cashier/cart" && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Logout Button (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl text-gray-700"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                    pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.href === "/cashier/cart" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
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
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
