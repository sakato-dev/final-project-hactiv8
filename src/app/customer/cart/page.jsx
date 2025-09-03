"use client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatRupiah from "@/utils/FormatRupiah";
import Swal from "sweetalert2";
import { FaTrash, FaMinusCircle, FaPlusCircle } from "react-icons/fa";

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
    <div className="min-h-screen bg-[#0b1222] flex flex-col pb-24">
      <h1 className="text-2xl font-bold text-white text-center mt-6 mb-6">
        Cart
      </h1>
      <div className="flex-1 px-4">
        {cartItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-[#1e293b] rounded-lg p-3 mb-2"
              >
                <img
                  src={item.imgUrl || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-lg object-cover mr-4"
                  style={{ width: 60, height: 60 }}
                />
                <div className="flex-1">
                  <p className="text-white font-semibold text-base">
                    {item.name}
                  </p>
                  <p className="text-[#94a3b8] mt-1">
                    {formatRupiah(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, "decrease")}
                      className="text-white"
                      aria-label="Kurangi"
                    >
                      <FaMinusCircle size={22} />
                    </button>
                    <span className="text-white font-semibold mx-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, "increase")}
                      className="text-white"
                      aria-label="Tambah"
                    >
                      <FaPlusCircle size={22} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 text-[#fca5a5]"
                  aria-label="Hapus"
                >
                  <FaTrash size={22} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#94a3b8] py-10">
            Keranjang Anda kosong.
          </p>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4">
          <div className="bg-[#0b1222] border-t border-[#334155] pt-4 pb-2 flex flex-col gap-3">
            <div className="flex justify-between items-center text-lg mb-3 px-2">
              <span className="text-white font-semibold">Total:</span>
              <span className="text-white font-bold text-xl">
                {formatRupiah(subTotal)}
              </span>
            </div>
            <button
              onClick={handlePreparePayment}
              className="w-full bg-[#22c55e] text-white py-4 rounded-lg font-bold text-lg shadow mb-2"
            >
              Siapkan QR untuk Pembayaran
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
