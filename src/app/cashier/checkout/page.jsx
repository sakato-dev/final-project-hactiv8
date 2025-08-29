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

const TAX_RATE = 0.11;

export default function CheckoutPage() {
  const { userProfile } = useAuth();
  const { cartItems, clearCart, scannedCustomerId, scannedTransactionId } =
    useCart();
  const router = useRouter();

  const [customerId, setCustomerId] = useState(scannedCustomerId || "");
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [merchant, setMerchant] = useState(null);

  // --- Payment State ---
  const [customerPay, setCustomerPay] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [inputSource, setInputSource] = useState("numpad");

  const scannerRef = useRef(null);

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subTotal * TAX_RATE;
  const totalOrder = subTotal + tax;
  const change = (Number(customerPay) || 0) - totalOrder;

  // --- Quick Cash & Numpad Functions ---
  const handleQuickCash = (amt) => {
    setCustomerPay(String(amt));
    setInputSource("quick");
  };

  // --- FUNGSI BARU UNTUK UANG PAS ---
  const handleExactMoney = () => {
    setCustomerPay(String(totalOrder));
    setInputSource("quick");
  };

  const handleNumpadClick = useCallback(
    (n) => {
      if (n === "DELETE") {
        setCustomerPay((prev) => prev.slice(0, -1));
      } else {
        setCustomerPay((prevPay) => {
          const newPay = inputSource === "quick" ? n : prevPay + n;
          return newPay;
        });
      }
      setInputSource("numpad");
    },
    [inputSource]
  );

  const handleConfirmPayment = useCallback(() => {
    if (Number(customerPay) >= totalOrder) {
      setIsPaid(true);
      Swal.fire("Pembayaran Berhasil", "Transaksi dapat disimpan", "success");
    } else {
      Swal.fire("Gagal", "Nominal pembayaran kurang", "error");
    }
  }, [customerPay, totalOrder]);

  // --- Firestore Hooks ---
  useEffect(() => {
    if (userProfile && userProfile.merchantId) {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      const unsubscribe = onSnapshot(merchantRef, (doc) => {
        if (doc.exists()) {
          setMerchant(doc.data());
        }
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  // --- KEYBOARD EVENT LISTENER ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (!isNaN(key) || key === ".") {
        handleNumpadClick(key);
      }
      if (key === "Backspace") {
        handleNumpadClick("DELETE");
      }
      if (key === "Enter") {
        event.preventDefault();
        if (!isPaid) {
          handleConfirmPayment();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaid, handleNumpadClick, handleConfirmPayment]);

  useEffect(() => {
    if (merchant?.promotionSettings?.type === "point") {
      const rate = merchant.promotionSettings.pointsPerAmount || 1;
      const points = Math.floor(totalOrder / rate);
      setPointsAwarded(points);
    } else {
      setPointsAwarded(0);
    }
  }, [totalOrder, merchant]);

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
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  // --- Transaction ---
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!customerId || cartItems.length === 0) {
      setError("ID Pelanggan dan Keranjang tidak boleh kosong.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const merchantId = userProfile.merchantId;
      const transactionData = {
        cashierId: auth.currentUser.uid,
        customerId: customerId.trim(),
        merchantId: merchantId,
        amount: totalOrder,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        pointsAwarded,
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
          merchantName: merchant.name || "Toko",
          points: 0,
          stamps: 0,
          joinedAt: serverTimestamp(),
        });
      }
      if (merchant?.promotionSettings?.type === "point") {
        await updateDoc(membershipDocRef, {
          points: increment(pointsAwarded),
        });
      } else if (merchant?.promotionSettings?.type === "stamp") {
        const currentStamps = membershipDoc.data()?.stamps || 0;
        const newStampCount = currentStamps + 1;
        const threshold = merchant.promotionSettings.stampThreshold;
        if (newStampCount >= threshold) {
          await updateDoc(membershipDocRef, { stamps: 0 });
          Swal.fire(
            "Hadiah!",
            `Pelanggan berhak mendapatkan: ${merchant.promotionSettings.stampReward}`,
            "success"
          );
        } else {
          await updateDoc(membershipDocRef, { stamps: increment(1) });
        }
      }

      if (scannedTransactionId) {
        const transRef = doc(db, "pendingTransactions", scannedTransactionId);
        await deleteDoc(transRef);
      }

      Swal.fire("Berhasil!", "Transaksi berhasil disimpan.", "success");
      clearCart();
      router.push("/cashier/home");
    } catch (err) {
      console.error("Error processing transaction:", err);
      setError(err.message || "Gagal memproses transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col gap-2 p-4">
        {/* Baris Pertama: Receipt & Payment */}
        <div className="w-full flex flex-col lg:flex-row gap-2">
          {/* Receipt */}
          <div className="w-full lg:w-3/7 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center mb-6">Your Order</h2>
            {/* ... rest of the receipt JSX ... */}
            <div className="border-t border-gray-300 mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-black">
                  {new Date().toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Receipt ID</span>
                <span className="text-black">
                  #{Math.floor(Math.random() * 1000000)}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-300 mb-4"></div>
            <div className="space-y-2 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-black">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">{formatRupiah(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (11%)</span>
                <span className="text-black">{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total</span>
                <span>{formatRupiah(totalOrder)}</span>
              </div>
            </div>
            <div className="border-t border-gray-300 mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-black">Cash</span>
              </div>
            </div>
            {isPaid && (
              <p className="text-center text-lg font-medium mt-6">
                Thank you for your purchase!
              </p>
            )}
          </div>

          {/* Payment */}
          <div className="w-full lg:w-4/7 bg-white p-6 rounded-lg shadow">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Payment</h2>

              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Total to Pay:</span>
                  <span className="font-semibold">
                    Rp {totalOrder.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer Pay:</span>
                  <span className="font-semibold">
                    Rp {(Number(customerPay) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Change:</span>
                  <span className="font-semibold text-green-600">
                    Rp {change > 0 ? change.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <div className="w-full flex gap-2 bg-gray-50 p-2 rounded-lg">
                {/* Quick Cash */}
                <div className="flex-1 grid grid-cols-1 gap-1 content-start">
                  {/* --- TOMBOL UANG PAS BARU --- */}
                  <button
                    onClick={handleExactMoney}
                    className="w-full h-18 rounded-lg flex items-center justify-center text-2xl border border-orange-200 font-semibold bg-yellow-100"
                  >
                    Uang Pas
                  </button>

                  {[5000, 10000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickCash(amt)}
                      className="w-full h-18 rounded-lg flex items-center justify-center text-2xl border border-orange-200 font-bold"
                    >
                      Rp {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Numpad */}
                <div className="flex-[2] grid grid-cols-3 gap-1 ">
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
                    "000",
                    "0",
                    "DELETE",
                  ].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleNumpadClick(n)}
                      className={`w-full h-22 rounded-lg flex items-center justify-center text-2xl border border-orange-200 font-bold
                      ${
                        n === "DELETE"
                          ? "bg-rose-500 text-white"
                          : "bg-neutral-100 text-gray-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className={`w-full p-3 rounded-lg text-white ${
                    isPaid ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
                  }`}
                  disabled={isPaid}
                >
                  {isPaid ? "Done" : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Baris Kedua: Form Transaksi + Scan */}
        <div className="w-full bg-white p-6 rounded-lg shadow">
          {/* ... sisa komponen form ... */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Proses Transaksi
          </h1>

          {isScanning && (
            <div className="w-full mb-6">
              <div id="qr-reader" className="w-full"></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Batal
              </button>
            </div>
          )}

          <form onSubmit={handleTransaction} className="w-full space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Pelanggan
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Pindai atau masukkan ID"
                  className="flex-grow px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setIsScanning(true)}
                  className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  disabled={isScanning}
                >
                  Scan QR
                </button>
              </div>
            </div>

            {merchant?.promotionSettings?.type === "point" && (
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-gray-800">
                  Poin yang akan didapat:{" "}
                  <span className="font-bold text-blue-600">
                    {pointsAwarded}
                  </span>
                </p>
              </div>
            )}
            {merchant?.promotionSettings?.type === "stamp" && (
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-gray-800">Sistem promosi stempel aktif.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || cartItems.length === 0 || !isPaid}
              className="w-full py-3 px-4 border rounded-xl text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isLoading ? "Memproses..." : "Simpan Transaksi"}
            </button>
          </form>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
