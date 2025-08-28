"use client";
import { useAuth } from "@/contexts/auth-context";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function ShowQrPage() {
  const { userProfile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Tunjukkan ke Kasir</h1>
      <p className="text-gray-300 mb-8">
        Pindai QR Code ini di kasir untuk menyelesaikan transaksimu.
      </p>

      <div className="bg-white p-6 rounded-lg">
        {userProfile?.uid ? (
          <QRCodeSVG value={userProfile.uid} size={256} />
        ) : (
          <p>Memuat QR Code...</p>
        )}
      </div>

      <Link href="/customer" className="mt-8 bg-blue-600 px-6 py-3 rounded-lg">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
