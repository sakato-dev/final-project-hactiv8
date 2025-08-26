"use client";
import React from "react";
import Link from "next/link";
import { CartProvider } from "@/contexts/CartContext";

function Layout({ children }) {
  return (
    <CartProvider>
      <div>
        <nav>
          <div className="flex gap-4 justify-center">
            <Link
              href="/cashier/home/"
              className="bg-orange-500 text-white px-4 py-2 rounded-md mt-3"
            >
              Home
            </Link>
            <Link
              href="/cashier/cart/"
              className="bg-black text-white px-4 py-2 rounded-md mt-3"
            >
              Cart
            </Link>
            <Link
              href="/cashier/scan-qr/"
              className="bg-black text-white px-4 py-2 rounded-md mt-3"
            >
              Scan QR
            </Link>
          </div>
        </nav>
        <div>{children}</div>
      </div>
    </CartProvider>
  );
}

export default Layout;
