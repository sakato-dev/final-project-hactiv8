"use client";
import { useCart } from "@/contexts/CartContext";
import React, { useState } from "react";

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [showPayment, setShowPayment] = useState(false);
  const [customerPay, setCustomerPay] = useState("");
  const [showScanPopup, setShowScanPopup] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subTotal * 0.12;
  const total = subTotal + tax;
  const change = Number(customerPay) - total;

  const handleNumpadClick = (val) => {
    if (val === "DELETE") {
      setCustomerPay((prev) => prev.slice(0, -1));
    } else {
      setCustomerPay((prev) => prev + val);
    }
  };

  const handleQuickCash = (amount) => {
    setCustomerPay((prev) => String(Number(prev || 0) + amount));
  };

  const handleConfirmPayment = () => {
    setOrderSummary({
      items: [...cartItems],
      subTotal,
      tax,
      total,
      customerPay,
      change,
    });
    setIsPaid(true);
    clearCart();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div className="bg-neutral-900 rounded-lg p-4">
        <table className="w-full">
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
              <tr key={item.id} className="border-t border-neutral-700">
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

        <div className="mt-6 flex flex-col items-end gap-4">
          <div className="flex justify-between w-60 text-white text-lg font-semibold">
            <span>Total:</span>
            <span>Rp {subTotal.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            className="w-60 py-3 bg-orange-500 rounded-2xl text-white text-lg font-medium hover:bg-orange-600 transition"
          >
            Continue To Pay
          </button>
        </div>
      </div>

      {showPayment && (
        <div className="grid grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Point Juaro</h2>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleString()}
              </p>
              <p className="text-sm font-medium">
                Order#{Math.floor(Math.random() * 1000)}
              </p>
            </div>

            <hr />

            <div className="text-sm space-y-1">
              {orderSummary?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b py-1"
                >
                  <span>
                    {item.title} x{item.quantity}
                  </span>
                  <span>
                    Rp {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <hr />

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {orderSummary?.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (12%)</span>
                <span>Rp {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rp {orderSummary?.total.toLocaleString()}</span>
              </div>
            </div>

            {isPaid && orderSummary && (
              <>
                <hr />
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-medium">Cash</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Pay</span>
                    <span>
                      Rp {Number(orderSummary.customerPay).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>
                      Rp{" "}
                      {orderSummary.change > 0
                        ? orderSummary.change.toLocaleString()
                        : 0}
                    </span>
                  </div>
                </div>
              </>
            )}

            <p className="text-center text-gray-600 text-sm mt-4">
              Thank you for your purchase!
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Payment</h2>

            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span className="font-medium">Total to Pay:</span>
                <span className="font-semibold">
                  Rp {total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Customer Pay:</span>
                <span className="font-semibold">
                  Rp {Number(customerPay) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Change:</span>
                <span className="font-semibold text-green-600">
                  Rp {change > 0 ? change.toLocaleString() : 0}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickCash(amt)}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium"
                >
                  + Rp {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "DELETE"].map((n) => (
                <button
                  key={n}
                  onClick={() => handleNumpadClick(n.toString())}
                  className={`w-24 h-20 rounded-2xl ${
                    n === "DELETE" ? "bg-rose-400" : "bg-neutral-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowScanPopup(true)}
                className="p-3 bg-neutral-900 rounded-lg text-white"
              >
                Scan Member Card
              </button>
              <button
                onClick={handleConfirmPayment}
                className={`p-3 rounded-lg text-white ${
                  isPaid ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
                }`}
                disabled={isPaid}
              >
                {isPaid ? "Done" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanPopup && (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-xl font-semibold">Scan Member QR</h2>
            <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">[ QR SCAN AREA ]</span>
            </div>
            <button
              onClick={() => setShowScanPopup(false)}
              className="w-full py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
