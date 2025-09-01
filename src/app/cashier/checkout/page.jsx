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

export default function CheckoutPage() {
  const { userProfile } = useAuth();
  const { cartItems, clearCart, scannedCustomerId, scannedTransactionId } =
    useCart();
  const router = useRouter();

  const [customerId, setCustomerId] = useState(scannedCustomerId || "");
  const [merchant, setMerchant] = useState(null);
  const [taxRate, setTaxRate] = useState(0); // State baru untuk pajak
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [stampsAwarded, setStampsAwarded] = useState(0);

  const [customerPay, setCustomerPay] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [inputSource, setInputSource] = useState("numpad");

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subTotal * taxRate;
  const totalOrder = subTotal + tax;

  // Realtime update change amount
  useEffect(() => {
    setChangeAmount(Math.max((Number(customerPay) || 0) - totalOrder, 0));
  }, [customerPay, totalOrder]);

  // Fetch merchant, promotion points, and tax
  useEffect(() => {
    if (userProfile?.merchantId) {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      const unsubscribe = onSnapshot(merchantRef, (docSnap) => {
        if (docSnap.exists()) {
          const merchantData = docSnap.data();
          setMerchant(merchantData);
          setTaxRate(merchantData.taxRate / 100);

          if (merchantData.promotionSettings?.type === "point") {
            const rate = merchantData.promotionSettings.pointsPerAmount || 1;
            const points = Math.floor(totalOrder / rate);
            setPointsAwarded(points);
            setStampsAwarded(0);
          } else if (merchantData.promotionSettings?.type === "stamp") {
            const rate = merchantData.promotionSettings.stampPerAmount || 1;
            const stamps = Math.floor(totalOrder / rate);
            setStampsAwarded(stamps);
            setPointsAwarded(0);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [userProfile, totalOrder]);

  const handleNumpadClick = useCallback(
    (n) => {
      if (isPaid) return;
      if (n === "DELETE") setCustomerPay((prev) => prev.slice(0, -1));
      else if (n === "C") setCustomerPay("");
      else {
        setCustomerPay((prevPay) => {
          const newPay = inputSource === "quick" ? n : prevPay + n;
          return newPay;
        });
      }
      setInputSource("numpad");
    },
    [isPaid, inputSource]
  );

  const handleQuickCash = (amt) => {
    if (isPaid) return;
    setCustomerPay(String(amt));
    setInputSource("quick");
  };

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

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isScanning || isPaid) return;
      const { key } = event;
      if (!isNaN(key)) handleNumpadClick(key);
      if (key === "Backspace") handleNumpadClick("DELETE");
      if (key === "Enter") {
        event.preventDefault();
        if (!isPaid) handleConfirmPayment();
        else if (customerId && cartItems.length > 0)
          document.getElementById("save-transaction-btn")?.click();
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

  // QR Scanner
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
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  // Save Transaction
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
        change: changeAmount,
        items: cartItems.map(({ id, name, price, quantity }) => ({
          id,
          name,
          price,
          quantity,
        })),
        pointsAwarded,
        stampsAwarded,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "transactions"), transactionData);

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

      if (merchant?.promotionSettings?.type === "point") {
        await updateDoc(membershipDocRef, { points: increment(pointsAwarded) });
      } else if (merchant?.promotionSettings?.type === "stamp") {
        const { stampThreshold, stampReward } = merchant.promotionSettings;
        const currentStamps = membershipDoc.data()?.stamps || 0;
        const newStampCount = currentStamps + stampsAwarded;

        if (newStampCount >= stampThreshold) {
          const remainingStamps = newStampCount % stampThreshold;
          await updateDoc(membershipDocRef, { stamps: remainingStamps });
          Swal.fire(
            "Reward!",
            `Customer is eligible for: ${stampReward}`,
            "success"
          );
        } else {
          await updateDoc(membershipDocRef, {
            stamps: increment(stampsAwarded),
          });
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
      <div className="min-h-screen flex flex-col gap-4">
        {/* Row 1: Receipt & Payment */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Receipt */}
          <div className="w-full lg:w-5/12 bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Order Details
            </h2>
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
                    year: "numeric",
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

            <div className="bg-slate-50 p-4 rounded-lg flex-grow mb-4">
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
                    Tax ({(taxRate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-gray-800">{formatRupiah(tax)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed pt-4 space-y-3">
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
                      {formatRupiah(changeAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="w-full lg:w-7/12 bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Payment
            </h3>

            <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center mb-4">
              <span className="text-gray-300 font-medium">TOTAL</span>
              <span className="text-yellow-400 text-2xl sm:text-3xl font-bold tracking-wider">
                {formatRupiah(totalOrder)}
              </span>
            </div>

            <div className="mb-4 space-y-3">
              <div className="w-full p-4 bg-slate-100 rounded-xl flex justify-between items-center">
                <span className="text-lg font-medium text-gray-600">
                  Customer Pay
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-gray-800">
                  {formatRupiah(Number(customerPay) || 0)}
                </span>
              </div>

              <div className="w-full p-4 bg-green-50 rounded-xl flex justify-between items-center">
                <span className="text-lg font-medium text-green-800">
                  Change
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-green-600">
                  {formatRupiah(changeAmount)}
                </span>
              </div>
            </div>

            {/* Quick Cash */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => handleQuickCash(totalOrder)}
                className="py-3 px-2 text-sm font-semibold bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:bg-blue-200 transition-all"
              >
                Exact
              </button>
              {[50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickCash(amt)}
                  className="py-3 px-2 text-sm font-semibold bg-orange-100 text-orange-800 rounded-lg shadow-sm hover:bg-orange-200 transition-all"
                >{`Rp${amt.toLocaleString("id-ID")}`}</button>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2 flex-grow">
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
                  className={`w-full h-20 rounded-lg flex items-center justify-center text-2xl font-semibold transition ${
                    n === "DELETE" || n === "C"
                      ? "bg-slate-200 hover:bg-slate-300"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {n === "DELETE" ? <FaBackspace /> : n}
                </button>
              ))}
            </div>

            {/* Pay Now Button */}
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
        <div className="w-full bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Save Transaction
          </h1>

          {isScanning && (
            <div className="w-full mb-6 flex flex-col items-center">
              <div
                id="qr-reader"
                className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 mx-auto"
              ></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full sm:w-1/2 mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Scan or enter customer ID"
                  className="flex-grow w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                  disabled={isScanning}
                >
                  {isScanning ? "Scanning..." : "Scan QR"}
                </button>
              </div>
            </div>

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
            {stampsAwarded > 0 && (
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-gray-800">
                  Stamps to be awarded:{" "}
                  <span className="font-bold text-green-600">
                    {stampsAwarded}
                  </span>
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              id="save-transaction-btn"
              type="submit"
              className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Save Transaction"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
