"use client";
import { useAuth } from "@/contexts/auth-context";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function MyQrPage() {
  const { userProfile } = useAuth();
  const [hasActiveCart, setHasActiveCart] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const cartCollectionRef = collection(
      db,
      "users",
      userProfile.uid,
      "customerCart"
    );
    const unsubscribe = onSnapshot(cartCollectionRef, (snapshot) => {
      setHasActiveCart(!snapshot.empty);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  if (loading) {
    return <p className="text-center p-10">Memeriksa status QR...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {hasActiveCart ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Tunjukkan ke Kasir</h1>
          <p className="text-gray-300 mb-8 max-w-xs">
            Pindai QR Code ini di kasir untuk menyelesaikan transaksimu. QR ini
            akan aktif sampai transaksi berhasil.
          </p>

          <div className="bg-white p-6 rounded-lg">
            {userProfile?.uid ? (
              <QRCodeSVG value={userProfile.uid} size={256} />
            ) : (
              <p>Memuat QR Code...</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Tidak Ada QR Aktif</h1>
          <p className="text-gray-300 mb-8 max-w-xs">
            Anda tidak memiliki keranjang belanja yang siap untuk dibayar.
            Silakan berbelanja terlebih dahulu.
          </p>
        </div>
      )}

      <Link
        href="/customer"
        className="mt-8 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
