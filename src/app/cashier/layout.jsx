"use client";
import React from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

function Navbar() {
  const router = useRouter();
  const { cartCount } = useCart();

  const handleLogout = () => {
    auth.signOut();
    router.push("/auth/login");
  };

  return (
    <nav>
      <div className="flex gap-4 justify-center relative">
        <Link
          href="/cashier/home/"
          className="bg-orange-500 text-white px-4 py-2 rounded-md mt-3"
        >
          Home
        </Link>

        <Link
          href="/cashier/cart/"
          className="relative bg-black text-white px-4 py-2 rounded-md mt-3"
        >
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cartCount}
            </span>
          )}
        </Link>

        <Link
          href="/cashier/scan-qr/"
          className="bg-black text-white px-4 py-2 rounded-md mt-3"
        >
          Scan QR
        </Link>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-md mt-3"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <CartProvider>
      <div>
        <Navbar />
        <div>{children}</div>
      </div>
    </CartProvider>
  );
}

export default Layout;
