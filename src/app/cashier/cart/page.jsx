"use client";
import { useCart } from "@/contexts/CartContext";
import formatRupiah from "@/utils/FormatRupiah";
import Link from "next/link";
import React from "react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
      {cartItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.imgUrl || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-grow">
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="text-sm text-gray-600">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, "decrease")}
                      className="font-bold"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, "increase")}
                      className="font-bold"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold w-24 text-right">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary & Action */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg font-bold">
              <span>Total: </span>
              <span>{formatRupiah(subTotal)}</span>
            </div>
            <Link
              href="/cashier/checkout"
              className="w-full sm:w-auto px-6 py-3 bg-orange-500 rounded-lg text-white font-medium hover:bg-orange-600 transition text-center"
            >
              Lanjutkan ke Pembayaran
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Keranjang Anda masih kosong.</p>
          <Link
            href="/cashier/home"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}
