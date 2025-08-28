"use client";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ScanCustomerCartPage() {
  const { clearCart, addToCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false); // Diubah menjadi false
  const scannerRef = useRef(null);

  useEffect(() => {
    // Hanya jalankan scanner jika isScanning adalah true
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 5, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] },
        false
      );
      scannerRef.current.render(onScanSuccess, onScanError);
    } else {
      // Hentikan scanner jika sedang berjalan
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear().catch(() => {
          console.log("first");
        });
      }
    }

    // Cleanup function untuk memberhentikan scanner saat komponen di-unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    if (!isScanning) return; // Mencegah scan berulang setelah berhasil
    setIsScanning(false); // Matikan status scanning

    const customerId = decodedText;

    Swal.fire({
      title: "QR Terdeteksi!",
      text: "Mengambil data keranjang pelanggan...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const cartCollectionRef = collection(
        db,
        "users",
        customerId,
        "customerCart"
      );
      const cartSnapshot = await getDocs(cartCollectionRef);

      if (cartSnapshot.empty) {
        throw new Error("Pelanggan tidak memiliki item di keranjang.");
      }

      clearCart();
      const batch = writeBatch(db);

      cartSnapshot.forEach((doc) => {
        const item = doc.data();
        addToCart({ ...item, id: doc.id });
        // Tambahkan operasi delete ke batch
        batch.delete(doc.ref);
      });

      // Hapus semua item keranjang pelanggan dalam satu operasi
      await batch.commit();

      Swal.close();
      router.push("/cashier/checkout");
    } catch (err) {
      console.error("Gagal mengambil keranjang pelanggan:", err);
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.message || "Tidak dapat mengambil data keranjang dari pelanggan.",
      });
    }
  };

  const onScanError = () => {
    // Fungsi ini bisa dikosongkan untuk mengabaikan error minor dari scanner
  };

  const handleStartScan = () => {
    setError(""); // Hapus error sebelumnya
    setIsScanning(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen h-auto bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">
            Pindai QR Code Keranjang Pelanggan
          </h1>

          {!isScanning ? (
            <>
              <p className="text-gray-600 mb-6">
                Tekan tombol di bawah untuk memulai kamera dan memindai QR code
                dari aplikasi pelanggan.
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
