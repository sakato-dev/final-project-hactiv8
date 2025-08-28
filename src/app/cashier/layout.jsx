"use client";
import React from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaShoppingCart, FaQrcode } from "react-icons/fa";

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

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
          <div className="flex items-center">
            <span className="font-bold text-xl">Kasir</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`relative px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.label}
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
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
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
