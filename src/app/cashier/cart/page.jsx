"use client";
import { useCart } from "@/contexts/CartContext";
import formatRupiah from "@/utils/FormatRupiah";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useAuth } from "@/contexts/auth-context";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { userProfile } = useAuth();
  const [taxRate, setTaxRate] = useState(0.11);

  // Fetch merchant tax rate
  useEffect(() => {
    if (userProfile?.merchantId) {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      const unsubscribe = onSnapshot(merchantRef, (docSnap) => {
        if (docSnap.exists()) {
          const merchantData = docSnap.data();
          setTaxRate((merchantData.taxRate || 11) / 100);
        }
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  // Calculate subtotal, tax, and total
  const { subTotal, tax, total } = useMemo(() => {
    const subTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subTotal * taxRate;
    return { subTotal, tax, total: subTotal + tax };
  }, [cartItems, taxRate]);

  const handleRemove = (item) => {
    removeFromCart(item.id);
    Swal.fire({
      title: "Removed",
      text: `${item.name} has been removed from your cart.`,
      icon: "info",
      confirmButtonColor: "#f97316",
    });
  };

  // Quantity Stepper
  const QuantityStepper = ({ item }) => (
    <div className="flex items-center bg-orange-500 text-white rounded-lg font-bold">
      <button
        onClick={() => updateQuantity(item.id, "decrease")}
        className="p-2.5 hover:bg-orange-600 transition-colors rounded-l-lg"
        aria-label="Decrease quantity"
      >
        <FaMinus size={12} />
      </button>
      <span className="px-3 text-sm min-w-[40px] text-center">
        {item.quantity}
      </span>
      <button
        onClick={() => updateQuantity(item.id, "increase")}
        className="p-2.5 hover:bg-orange-600 transition-colors rounded-r-lg"
        aria-label="Increase quantity"
      >
        <FaPlus size={12} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-grow">
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-6 px-4 mb-4 pb-3 border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase">
              <div className="col-span-4 pl-4">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  {/* Mobile View */}
                  <div className="flex flex-col gap-4 md:hidden">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.imgUrl || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-grow">
                        <h2 className="font-semibold text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {item.description || "No description"}
                        </p>
                        <p className="text-base text-orange-600 font-bold mt-1">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <QuantityStepper item={item} />
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-900">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-gray-400 hover:text-red-600 p-2"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View Row */}
                  <div className="hidden md:grid md:grid-cols-12 items-center gap-4">
                    {/* Product */}
                    <div className="col-span-4 flex items-center gap-4">
                      <img
                        src={item.imgUrl || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {item.description || "No description"}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center font-semibold text-gray-800">
                      {formatRupiah(item.price)}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3 flex justify-center">
                      <QuantityStepper item={item} />
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right font-bold text-lg text-gray-900">
                      {formatRupiah(item.price * item.quantity)}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-10">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatRupiah(subTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-semibold text-gray-800">
                    {formatRupiah(tax)}
                  </span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
              <Link
                href="/cashier/checkout"
                className="block w-full mt-6 px-6 py-3 bg-orange-500 rounded-lg text-white font-semibold hover:bg-orange-600 transition text-center text-base"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Empty Cart
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-6">
            It looks like you haven’t added any items yet.
          </p>
          <Link
            href="/cashier/home"
            className="mt-4 inline-block bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-semibold transition"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
