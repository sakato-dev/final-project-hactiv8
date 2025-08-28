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
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useCart } from "@/contexts/CartContext";
import formatRupiah from "@/utils/FormatRupiah";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const TAX_RATE = 0.11; // PPN 11%

export default function CheckoutPage() {
  const { userProfile } = useAuth();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [merchant, setMerchant] = useState(null);

  const scannerRef = useRef(null);

  // Hitung total dari keranjang
  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subTotal * TAX_RATE;
  const totalOrder = subTotal + tax;

  // Ambil data merchant dan pengaturannya
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

  // Hitung poin jika sistem poin aktif
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
        { fps: 10, qrbox: { width: 250, height: 250 } },
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

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setError("Silakan pindai QR Code pelanggan terlebih dahulu.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Keranjang belanja kosong.");
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
          merchantId: merchantId,
          merchantName: merchant.name || "Toko",
          points: 0,
          stamps: 0,
          joinedAt: serverTimestamp(),
        });
      }

      // Logika Poin & Stempel
      if (merchant?.promotionSettings?.type === "point") {
        await updateDoc(membershipDocRef, { points: increment(pointsAwarded) });
      } else if (merchant?.promotionSettings?.type === "stamp") {
        const currentStamps = membershipDoc.data()?.stamps || 0;
        const newStampCount = currentStamps + 1;
        const threshold = merchant.promotionSettings.stampThreshold;

        if (newStampCount >= threshold) {
          await updateDoc(membershipDocRef, { stamps: 0 }); // Reset stempel
          Swal.fire(
            "Hadiah!",
            `Pelanggan berhak mendapatkan: ${merchant.promotionSettings.stampReward}`,
            "success"
          );
        } else {
          await updateDoc(membershipDocRef, { stamps: increment(1) });
        }
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
      <div className="min-h-screen bg-gray-100 flex justify-center items-start p-4">
        <div className="w-full max-w-4xl bg-white flex flex-col lg:flex-row rounded-lg shadow-lg overflow-hidden">
          {/* Sisi Kiri - Detail Order */}
          <div className="w-full lg:w-2/5 p-6 flex flex-col bg-gray-50 border-b lg:border-r lg:border-b-0">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 flex-grow">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatRupiah(totalOrder)}</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan - Form Transaksi */}
          <div className="w-full lg:w-3/5 p-6 sm:p-8">
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
                disabled={isLoading || cartItems.length === 0}
                className="w-full py-3 px-4 border rounded-xl text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? "Memproses..." : "Simpan Transaksi"}
              </button>
            </form>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
