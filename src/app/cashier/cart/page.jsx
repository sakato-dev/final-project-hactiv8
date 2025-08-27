"use client";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import React from "react";

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 ">
      <table className="w-full bg-neutral-900  rounded-lg">
        <thead>
          <tr className="text-white text-left text-lg font-medium">
            <th className="p-3">Product Detail</th>
            <th className="p-3">Price</th>
            <th className="p-3">Quantity</th>
            <th className="p-3">Subtotal</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id} className="bg-neutral-900 rounded-2xl">
              <td className="p-3 flex items-start gap-4">
                <div className="w-20 h-20 bg-neutral-800 rounded-xl overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-white text-base font-medium">
                    {item.title}
                  </h2>
                  <p className="text-stone-500 text-sm">{item.description}</p>
                </div>
              </td>
              <td className="p-3 text-white font-semibold">
                Rp {item.price.toLocaleString()}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-4 bg-white rounded-lg px-3 py-1 w-fit">
                  <button
                    onClick={() => updateQuantity(item.id, "decrease")}
                    className="text-black font-bold"
                  >
                    -
                  </button>
                  <span className="text-black font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, "increase")}
                    className="text-black font-bold"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-3 text-white font-semibold">
                Rp {(item.price * item.quantity).toLocaleString()}
              </td>
              <td className="p-3">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 flex flex-col items-end gap-6">
        <div className="flex justify-between w-full max-w-sm">
          <span className="text-white text-lg font-medium">Sub Total</span>
          <span className="text-white text-lg font-medium">
            Rp {subTotal.toLocaleString()}
          </span>
        </div>
        <Link
          href="/cashier/checkout"
          className="w-60 py-3 bg-orange-500 rounded-2xl text-white text-lg font-medium hover:bg-orange-600 transition"
        >
          Payment
        </Link>
      </div>
    </div>
  );
}

export default CartPage;
