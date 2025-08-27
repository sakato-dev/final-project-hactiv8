"use client";
import { useEffect, useRef, useState } from "react";
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
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Html5QrcodeScanner } from "html5-qrcode";

const POINTS_CONVERSION_RATE = 1000;

export default function KasirHome() {
  const { userProfile } = useAuth();
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      const onScanSuccess = (decodedText, decodedResult) => {
        setCustomerId(decodedText);
        setIsScanning(false);
        scannerRef.current.clear();
      };

      const onScanError = (errorMessage) => {};

      scannerRef.current.render(onScanSuccess, onScanError);
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear();
      }
    }

    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    const calculatedPoints = Math.floor(Number(value) / POINTS_CONVERSION_RATE);
    setPoints(calculatedPoints);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!customerId || !amount || Number(amount) <= 0) {
      setError("ID Pelanggan dan Nominal harus diisi dengan benar.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!userProfile || !userProfile.merchantId) {
        throw new Error("ID Toko untuk kasir ini tidak ditemukan.");
      }

      const merchantId = userProfile.merchantId;

      const transactionData = {
        cashierId: auth.currentUser.uid,
        customerId: customerId.trim(),
        merchantId: merchantId,
        amount: Number(amount),
        pointsAwarded: points,
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

      if (membershipDoc.exists()) {
        await updateDoc(membershipDocRef, {
          points: increment(points),
        });
      } else {
        const merchantDocRef = doc(db, "merchants", merchantId);
        const merchantDoc = await getDoc(merchantDocRef);
        const merchantName = merchantDoc.exists()
          ? merchantDoc.data().name
          : "Toko";

        await setDoc(membershipDocRef, {
          merchantId: merchantId,
          merchantName: merchantName,
          points: points,
          joinedAt: serverTimestamp(),
        });
      }

      setSuccess(
        `Transaksi berhasil! ${points} poin ditambahkan ke pelanggan.`
      );
      setCustomerId("");
      setAmount("");
      setPoints(0);
    } catch (err) {
      console.error("Error processing transaction:", err);
      setError(
        err.message || "Gagal memproses transaksi. Pastikan ID Pelanggan benar."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="w-full max-w-[1440px] h-full bg-white flex flex-col lg:flex-row rounded-lg shadow-lg overflow-hidden">
          {/* Sisi Kiri - Detail Order */}
          <div className="w-full lg:w-1/3 p-6 flex flex-col justify-between bg-gray-50 border-r border-gray-200">
            <div>
              <div className="mb-8 text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {userProfile?.merchantName || "SakatoDev"}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <p> Wednesday, Aug 30 2025 - 9:27:23</p>
                </div>
                <div className="text-sm font-medium mt-4 text-gray-700">
                  Order008
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600">Sub Total</div>
                  <div className="font-semibold text-gray-900">Rp. 50.000</div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600">Discount</div>
                  <div className="font-semibold text-gray-900">Rp. 0</div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600">Tax (12%)</div>
                  <div className="font-semibold text-gray-900">Rp. 6.000</div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <div className="text-gray-800">Total Order</div>
                    <div className="text-indigo-600">Rp. 56.000</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Sisi Kanan - Form Transaksi */}
          <div className="w-full lg:w-2/3 p-8 flex flex-col justify-start items-center">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">
              Detail Transaksi Baru
            </h1>

            {isScanning && (
              <div className="w-full mb-6">
                <div id="qr-reader" className="w-full"></div>
                <button
                  onClick={() => setIsScanning(false)}
                  className="w-full mt-4 p-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Batal Scan
                </button>
              </div>
            )}

            <form onSubmit={handleTransaction} className="w-full space-y-6">
              <div>
                <label
                  htmlFor="customerId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID Pelanggan (dari QR Scan)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="customerId"
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="ID pelanggan..."
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={isScanning}
                  >
                    Scan QR
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nominal Pembelanjaan (Rp)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Contoh: 50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-800 text-lg">
                  Poin yang akan didapat:{" "}
                  <span className="font-bold text-xl text-indigo-600">
                    {points}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Memproses..." : "Simpan Transaksi"}
              </button>
            </form>
            {error && (
              <p className="mt-6 text-base text-red-600 font-medium">{error}</p>
            )}
            {success && (
              <p className="mt-6 text-base text-green-600 font-medium">
                {success}
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
