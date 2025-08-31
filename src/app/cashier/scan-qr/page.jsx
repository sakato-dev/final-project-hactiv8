"use client";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/auth-context";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ScanCustomerCartPage() {
  const { replaceCart, setScannedCustomerId, setScannedTransactionId } =
    useCart();
  const { userProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 5, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] },
        false
      );
      scannerRef.current.render(onScanSuccess, onScanError);
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear().catch(() => {});
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    if (!isScanning) return;
    setIsScanning(false);
    const transactionId = decodedText;

    Swal.fire({
      title: "QR Terdeteksi!",
      text: "Memvalidasi transaksi...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const transRef = doc(db, "pendingTransactions", transactionId);
      const transSnap = await getDoc(transRef);

      if (!transSnap.exists()) {
        throw new Error("Transaksi tidak ditemukan atau sudah diproses.");
      }

      const transactionData = transSnap.data();

      if (transactionData.merchantId !== userProfile?.merchantId) {
        throw new Error("Transaksi ini bukan untuk toko Anda!");
      }

      replaceCart(transactionData.items);
      setScannedCustomerId(transactionData.customerId);
      setScannedTransactionId(transactionId);

      Swal.close();
      router.push("/cashier/checkout");
    } catch (err) {
      console.error("Gagal memproses QR:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message,
      });
      setTimeout(() => setIsScanning(true), 2000);
    }
  };

  const onScanError = () => {};

  const handleStartScan = () => {
    setError("");
    setIsScanning(true);
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Pindai QR Code Transaksi</h1>
          {!isScanning ? (
            <>
              <p className="text-gray-600 mb-6">
                Tekan tombol di bawah untuk memulai kamera.
              </p>
              <button
                onClick={handleStartScan}
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Mulai Pindai
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Arahkan kamera ke QR code pelanggan.
              </p>
              <div id="qr-reader" className="w-full"></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Batal
              </button>
            </>
          )}
          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
