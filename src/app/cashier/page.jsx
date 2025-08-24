"use client";
import { useState } from "react";
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

const POINTS_CONVERSION_RATE = 1000;

export default function KasirHome() {
  const { userProfile } = useAuth();
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      // 1. Buat data transaksi
      const transactionData = {
        cashierId: auth.currentUser.uid,
        customerId: customerId.trim(),
        merchantId: merchantId,
        amount: Number(amount),
        pointsAwarded: points,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "transactions"), transactionData);

      // 2. Perbarui poin di sub-koleksi 'memberships' pelanggan
      const membershipDocRef = doc(
        db,
        "users",
        customerId.trim(),
        "memberships",
        merchantId
      );
      const membershipDoc = await getDoc(membershipDocRef);

      if (membershipDoc.exists()) {
        // Jika sudah jadi member, update poinnya
        await updateDoc(membershipDocRef, {
          points: increment(points),
        });
      } else {
        // Jika belum jadi member, buat dokumen keanggotaan baru
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
      <div className="p-8 max-w-lg mx-auto">
        {/* ... JSX lainnya tetap sama ... */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Halaman Kasir</h1>
          <button
            onClick={handleLogout}
            className="border px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Buat Transaksi Baru</h2>
          <form onSubmit={handleTransaction} className="space-y-4">
            {/* ... Form input tetap sama ... */}
            <div>
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-gray-700"
              >
                ID Pelanggan (dari QR Scan)
              </label>
              <input
                id="customerId"
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Scan atau masukkan ID pelanggan"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Nominal Pembelanjaan (Rp)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Contoh: 50000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800">
                Poin yang akan didapat:{" "}
                <span className="font-bold text-lg">{points}</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? "Memproses..." : "Simpan Transaksi"}
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
