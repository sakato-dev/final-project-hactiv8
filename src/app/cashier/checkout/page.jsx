"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useCart } from "@/contexts/CartContext";
import formatRupiah from "@/utils/FormatRupiah";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaBackspace } from "react-icons/fa";

const TAX_RATE = 0.11; // 11% PPN

export default function CheckoutPage() {
  // --- Global State & Router ---
  const { userProfile } = useAuth();
  const { cartItems, clearCart, scannedCustomerId, scannedTransactionId } =
    useCart();
  const router = useRouter();

  // --- Component State ---
  const [customerId, setCustomerId] = useState(scannedCustomerId || "");
  const [merchant, setMerchant] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const [customerPay, setCustomerPay] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  // --- Calculated Values ---
  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subTotal * TAX_RATE;
  const totalOrder = subTotal + tax;
  const change = (Number(customerPay) || 0) - totalOrder;

  // --- Handlers ---

  /** Handles numpad clicks to update the customer's payment amount. */
  const handleNumpadClick = useCallback(
    (n) => {
      if (isPaid) return; // Block input after payment is confirmed

      if (n === "DELETE") {
        setCustomerPay((prev) => prev.slice(0, -1));
      } else if (n === "C") {
        setCustomerPay("");
      } else {
        // If a quick cash button was just pressed, this new number replaces the value.
        setCustomerPay((prevPay) => prevPay + n);
      }
    },
    [isPaid]
  );

  /** Handles quick cash button clicks. */
  const handleQuickCash = (amt) => {
    if (isPaid) return;
    setCustomerPay(String(amt));
  };

  /** Confirms the payment if the amount is sufficient. */
  const handleConfirmPayment = useCallback(() => {
    if (Number(customerPay) >= totalOrder) {
      setIsPaid(true);
      Swal.fire(
        "Payment Confirmed",
        "You can now save the transaction.",
        "success"
      );
    } else {
      Swal.fire("Failed", "Payment amount is insufficient.", "error");
    }
  }, [customerPay, totalOrder]);

  // --- Effects ---

  /** Fetch merchant info and calculate points based on promotion settings. */
  useEffect(() => {
    if (userProfile?.merchantId) {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      const unsubscribe = onSnapshot(merchantRef, (doc) => {
        if (doc.exists()) {
          const merchantData = doc.data();
          setMerchant(merchantData);

          // Calculate points if promotion is active
          if (merchantData.promotionSettings?.type === "point") {
            const rate = merchantData.promotionSettings.pointsPerAmount || 1;
            const points = Math.floor(totalOrder / rate);
            setPointsAwarded(points);
          } else {
            setPointsAwarded(0);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userProfile, totalOrder]);

  /** Set up keyboard listener for numpad input and shortcuts. */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isScanning || isPaid) return;
      const { key } = event;

      if (!isNaN(key)) handleNumpadClick(key);
      if (key === "Backspace") handleNumpadClick("DELETE");
      if (key === "Enter") {
        event.preventDefault();
        if (!isPaid) {
          handleConfirmPayment();
        } else if (customerId && cartItems.length > 0) {
          document.getElementById("save-transaction-btn")?.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isScanning,
    isPaid,
    customerId,
    cartItems,
    handleNumpadClick,
    handleConfirmPayment,
  ]);

  /** Initialize or clear the QR code scanner. */
  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 5, qrbox: { width: 250, height: 250 } },
        false
      );
      const onScanSuccess = (decodedText) => {
        setCustomerId(decodedText);
        setIsScanning(false);
        scannerRef.current.clear();
      };
      scannerRef.current.render(onScanSuccess, () => {});
    }
    return () => {
      if (scannerRef.current?.getState() === 2) {
        // 2 = SCANNING
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  /** Main function to save the transaction to Firestore. */
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!isPaid) {
      Swal.fire(
        "Not Paid",
        "Confirm payment before saving the transaction.",
        "warning"
      );
      return;
    }
    if (!customerId || cartItems.length === 0) {
      setError("Customer ID and cart cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const merchantId = userProfile.merchantId;
      const transactionData = {
        cashierId: auth.currentUser.uid,
        customerId: customerId.trim(),
        merchantId,
        amount: totalOrder,
        customerPay: Number(customerPay),
        change,
        items: cartItems.map(({ id, name, price, quantity }) => ({
          id,
          name,
          price,
          quantity,
        })),
        pointsAwarded,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "transactions"), transactionData);

      // Update or create membership record
      const membershipDocRef = doc(
        db,
        "users",
        customerId.trim(),
        "memberships",
        merchantId
      );
      const membershipDoc = await getDoc(membershipDocRef);

      if (!membershipDoc.exists()) {
        await setDoc(membershipDocRef, {
          merchantId,
          merchantName: merchant?.name || "Store",
          points: 0,
          stamps: 0,
          joinedAt: serverTimestamp(),
        });
      }

      // Handle promotions
      if (merchant?.promotionSettings?.type === "point") {
        await updateDoc(membershipDocRef, { points: increment(pointsAwarded) });
      } else if (merchant?.promotionSettings?.type === "stamp") {
        const { stampThreshold, stampReward } = merchant.promotionSettings;
        const newStampCount = (membershipDoc.data()?.stamps || 0) + 1;

        if (newStampCount >= stampThreshold) {
          await updateDoc(membershipDocRef, { stamps: 0 });
          Swal.fire(
            "Reward!",
            `Customer is eligible for: ${stampReward}`,
            "success"
          );
        } else {
          await updateDoc(membershipDocRef, { stamps: increment(1) });
        }
      }

      if (scannedTransactionId) {
        await deleteDoc(doc(db, "pendingTransactions", scannedTransactionId));
      }

      Swal.fire("Success!", "Transaction saved successfully.", "success");
      clearCart();
      router.push("/cashier/home");
    } catch (err) {
      console.error("Error processing transaction:", err);
      setError(err.message || "Failed to process transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col gap-2">
        {/* Row 1: Receipt & Payment */}
        <div className="w-full flex flex-col lg:flex-row gap-2">
          {/* ----- Receipt (Left Column) ----- */}
          <div className="w-full lg:w-5/12 bg-white p-6 rounded-xl shadow-sm flex flex-col">
            {/* Header */}
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="flex items-center gap-4 border-b pb-4 mb-2">
              <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-lg font-bold text-lg">
                A4
              </div>
              <div>
                <p className="font-semibold text-gray-800">Cashier 1</p>
                <p className="text-sm text-gray-500">Order #925</p>
              </div>
              <div className="ml-auto text-right text-sm text-gray-500">
                <p>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-slate-50 p-4 rounded-lg flex-grow">
              <h3 className="font-semibold mb-2 text-gray-700">
                Transaction Details
              </h3>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name}{" "}
                      <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="text-gray-800 font-medium">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Items ({cartItems.length})
                  </span>
                  <span className="text-gray-800">
                    {formatRupiah(subTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Tax ({(TAX_RATE * 100).toFixed(0)}%)
                  </span>
                  <span className="text-gray-800">{formatRupiah(tax)}</span>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-dashed mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatRupiah(totalOrder)}</span>
              </div>
              {isPaid && (
                <>
                  <div className="flex justify-between text-md">
                    <span className="text-gray-600">Customer Pay</span>
                    <span className="font-medium">
                      {formatRupiah(Number(customerPay))}
                    </span>
                  </div>
                  <div className="flex justify-between text-md text-green-600">
                    <span className="font-semibold">Change</span>
                    <span className="font-bold">
                      {change > 0 ? formatRupiah(change) : formatRupiah(0)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ----- Payment (Right Column) ----- */}
          <div className="w-full lg:w-7/12 bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment</h3>

            {/* Total Display */}
            <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center mb-4">
              <span className="text-gray-300 font-medium">TOTAL</span>
              <span className="text-yellow-400 text-3xl font-bold tracking-wider">
                {formatRupiah(totalOrder)}
              </span>
            </div>

            {/* Payment Input */}
            <div className="w-full p-4 border-2 border-gray-200 rounded-xl text-right mb-4">
              <span className="text-4xl font-mono font-bold text-gray-700">
                {formatRupiah(Number(customerPay) || 0)}
              </span>
            </div>

            {/* --- QUICK CASH UI DIPERBAIKI --- */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => handleQuickCash(totalOrder)}
                className="py-3 px-2 text-sm font-semibold bg-teal-50 text-teal-800 rounded-lg shadow-sm hover:bg-teal-100 transition-all"
              >
                Exact
              </button>
              <button
                onClick={() => handleQuickCash(50000)}
                className="py-3 px-2 text-sm font-semibold bg-orange-50 text-orange-800 rounded-lg shadow-sm hover:bg-orange-100 transition-all"
              >
                Rp50rb
              </button>
              <button
                onClick={() => handleQuickCash(100000)}
                className="py-3 px-2 text-sm font-semibold bg-orange-50 text-orange-800 rounded-lg shadow-sm hover:bg-orange-100 transition-all"
              >
                Rp100rb
              </button>
              <button
                onClick={() => handleQuickCash(200000)}
                className="py-3 px-2 text-sm font-semibold bg-orange-50 text-orange-800 rounded-lg shadow-sm hover:bg-orange-100 transition-all"
              >
                Rp200rb
              </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2 flex-grow">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "C",
                "0",
                "DELETE",
              ].map((n) => (
                <button
                  key={n}
                  onClick={() => handleNumpadClick(n)}
                  className={`w-full h-full min-h-[70px] rounded-lg flex items-center justify-center text-2xl font-semibold transition ${
                    n === "DELETE" || n === "C"
                      ? "bg-slate-200 hover:bg-slate-300"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {n === "DELETE" ? <FaBackspace /> : n}
                </button>
              ))}
            </div>

            {/* Confirm Payment */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className={`w-full p-4 rounded-lg text-white text-lg font-bold transition ${
                  isPaid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                disabled={
                  isPaid || !customerPay || Number(customerPay) < totalOrder
                }
              >
                {isPaid ? "Paid" : "Pay Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Transaction Form & QR Scan */}
        <div className="w-full bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            Save Transaction
          </h1>

          {isScanning && (
            <div className="w-full mb-6 flex flex-col items-center">
              <div id="qr-reader" className="w-full md:w-1/2"></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full md:w-1/2 mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancel Scan
              </button>
            </div>
          )}

          <form onSubmit={handleTransaction} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Scan or enter customer ID"
                  className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  disabled={isScanning}
                >
                  {isScanning ? "Scanning..." : "Scan QR"}
                </button>
              </div>
            </div>

            {/* Promotion Info */}
            {pointsAwarded > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-800">
                  Points to be awarded:{" "}
                  <span className="font-bold text-blue-600">
                    {pointsAwarded}
                  </span>
                </p>
              </div>
            )}
            {merchant?.promotionSettings?.type === "stamp" && (
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-gray-800">
                  Stamp promotion system is active.
                </p>
              </div>
            )}

            <button
              id="save-transaction-btn"
              type="submit"
              disabled={isLoading || cartItems.length === 0 || !isPaid}
              className="w-full py-3 px-4 border rounded-xl text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Processing..." : "Save Transaction"}
            </button>
          </form>

          {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
