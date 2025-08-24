"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function CustomerHome() {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userProfile?.uid) return;

      try {
        const transactionsCol = collection(db, "transactions");
        const q = query(
          transactionsCol,
          where("customerId", "==", userProfile.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(history);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchTransactions();
  }, [userProfile]);

  const handleLogout = () => {
    auth.signOut();
  };

  if (!userProfile) {
    return (
      <ProtectedRoute>
        <p>Memuat data pengguna...</p>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Dasbor Pelanggan
            </h1>
            <button
              onClick={handleLogout}
              className="border px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>

          {/* Kartu Informasi Pengguna */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">
                Informasi Akun
              </h2>
              <p className="text-gray-600 mt-2">
                Selamat datang,{" "}
                <span className="font-medium">{userProfile.email}</span>
              </p>
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-500">ID Pelanggan Anda:</p>
                <p className="text-sm font-mono text-gray-800 break-words">
                  {userProfile.uid}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Tunjukkan ID ini kepada kasir untuk mendapatkan poin.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-lg shadow flex flex-col justify-center items-center">
              <h2 className="text-lg font-semibold">Total Poin Anda</h2>
              <p className="text-5xl font-bold mt-2">
                {userProfile.points || 0}
              </p>
            </div>
          </div>

          {/* Riwayat Transaksi */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Riwayat Transaksi
            </h2>
            <div className="flow-root">
              {loadingHistory ? (
                <p>Memuat riwayat...</p>
              ) : transactions.length === 0 ? (
                <p>Belum ada riwayat transaksi.</p>
              ) : (
                <ul role="list" className="-my-4 divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center py-4 space-x-4"
                    >
                      <div className="flex-auto">
                        <p className="text-sm font-medium text-gray-900">
                          Pembelanjaan Sebesar Rp{" "}
                          {tx.amount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tx.createdAt
                            ? new Date(
                                tx.createdAt.seconds * 1000
                              ).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Baru saja"}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        + {tx.pointsAwarded} Poin
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
