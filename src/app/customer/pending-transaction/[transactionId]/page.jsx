"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

export default function PendingTransactionPage() {
  const { transactionId } = useParams();
  const router = useRouter();
  const [transactionExists, setTransactionExists] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;

    const transRef = doc(db, "pendingTransactions", transactionId);
    const unsubscribe = onSnapshot(transRef, (doc) => {
      // Jika dokumen tidak ada lagi, berarti kasir sudah memprosesnya
      if (!doc.exists()) {
        setTransactionExists(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [transactionId]);

  if (loading) {
    return <p className="text-center p-10">Memuat Transaksi...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {transactionExists ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Tunjukkan ke Kasir</h1>
          <p className="text-gray-300 mb-8 max-w-xs">
            Pindai QR Code ini untuk menyelesaikan pembayaran.
          </p>
          <div className="bg-white p-6 rounded-lg">
            <QRCodeSVG value={transactionId} size={256} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <FaCheckCircle className="w-20 h-20 text-green-400 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Berhasil!</h1>
          <p className="text-gray-300 mb-8">
            Transaksi Anda sedang diproses oleh kasir.
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
