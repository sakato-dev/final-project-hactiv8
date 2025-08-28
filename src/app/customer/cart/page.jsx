"use client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatRupiah from "@/utils/FormatRupiah";
import Swal from "sweetalert2";

export default function CustomerCartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { userProfile } = useAuth();
  const router = useRouter();

  const subTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePreparePayment = async () => {
    if (!userProfile || cartItems.length === 0) return;

    Swal.fire({
      title: "Menyiapkan QR...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const pendingTransactionRef = await addDoc(
        collection(db, "pendingTransactions"),
        {
          customerId: userProfile.uid,
          merchantId: cartItems[0].merchantId,
          items: cartItems,
          totalAmount: subTotal,
          createdAt: serverTimestamp(),
          status: "pending",
        }
      );

      clearCart();
      Swal.close();
      router.push(`/customer/pending-transaction/${pendingTransactionRef.id}`);
    } catch (error) {
      console.error("Error preparing payment:", error);
      Swal.fire("Error", "Gagal menyiapkan pembayaran, coba lagi.", "error");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Keranjang Saya</h1>
      {cartItems.length > 0 ? (
        <div>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-gray-800 p-3 rounded-lg items-center"
              >
                <img
                  src={item.imgUrl || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div className="flex-grow">
                  <p>{item.name}</p>
                  <p className="text-sm font-semibold">
                    {formatRupiah(item.price)}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, "decrease")}
                      className="font-bold text-lg w-6 h-6 bg-gray-700 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, "increase")}
                      className="font-bold text-lg w-6 h-6 bg-gray-700 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-xs"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span className="font-bold">{formatRupiah(subTotal)}</span>
            </div>
            <button
              onClick={handlePreparePayment}
              className="w-full bg-green-600 text-white mt-4 py-3 rounded-lg font-semibold"
            >
              Siapkan QR untuk Pembayaran
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-10">
          Keranjang Anda kosong.
        </p>
      )}
    </div>
  );
}
