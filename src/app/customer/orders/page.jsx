"use client";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaQrcode } from "react-icons/fa";
import formatRupiah from "@/utils/FormatRupiah";

export default function OrdersPage() {
  const { userProfile } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const ordersQuery = query(
      collection(db, "pendingTransactions"),
      where("customerId", "==", userProfile.uid)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  if (loading) {
    return <p className="p-10 text-center">Memuat pesanan...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Pesanan Aktif (Menunggu Pembayaran)
      </h1>
      {pendingOrders.length > 0 ? (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <Link
              key={order.id}
              href={`/customer/pending-transaction/${order.id}`}
              className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Pesanan #{order.id.substring(0, 6)}...
                  </p>
                  <p className="font-semibold">
                    Pesanan #{order.id.substring(0, 6)}...
                  </p>
                  <p className="text-sm text-gray-400">
                    Total: {formatRupiah(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dibuat pada:{" "}
                    {new Date(order.createdAt?.seconds * 1000).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-center text-blue-400">
                  <FaQrcode className="w-8 h-8" />
                  <span className="text-xs mt-1">Lihat QR</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-10">
          Tidak ada pesanan yang sedang menunggu pembayaran.
        </p>
      )}
    </div>
  );
}
