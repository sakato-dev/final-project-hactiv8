"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

export default function CustomerHome() {
  const { currentUser, userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const membershipsQuery = query(
          collection(db, "users", currentUser.uid, "memberships"),
          orderBy("points", "desc")
        );
        const membershipsSnapshot = await getDocs(membershipsQuery);
        const memberList = membershipsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemberships(memberList);

        const transactionsQuery = query(
          collection(db, "transactions"),
          where("customerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const transSnapshot = await getDocs(transactionsQuery);
        const history = transSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const transactionsWithMerchantName = await Promise.all(
          history.map(async (tx) => {
            if (!tx.merchantId) return { ...tx, merchantName: "Toko Lama" };
            const merchantDoc = await getDoc(
              doc(db, "merchants", tx.merchantId)
            );
            return {
              ...tx,
              merchantName: merchantDoc.exists()
                ? merchantDoc.data().name
                : "Toko Dihapus",
            };
          })
        );

        setTransactions(transactionsWithMerchantName);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <p>Memuat data Anda...</p>
        </div>
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

          {/* Bagian QR Code */}
          <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Tunjukkan QR Code ke Kasir
            </h2>
            <div className="mt-4 flex justify-center">
              {userProfile?.uid ? (
                <QRCodeSVG
                  value={userProfile.uid}
                  size={200} // Ukuran QR code
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              ) : (
                <p>ID Pelanggan tidak ditemukan.</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">ID: {userProfile?.uid}</p>
          </div>

          {/* Kartu Keanggotaan */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Keanggotaan & Poin Anda
            </h2>
            {memberships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberships.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-lg shadow flex flex-col justify-center items-center"
                  >
                    <h3 className="text-lg font-semibold">
                      {member.merchantName}
                    </h3>
                    <p className="text-5xl font-bold mt-2">
                      {member.points || 0}
                    </p>
                    <p className="opacity-80">Poin</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg shadow">
                Anda belum menjadi anggota di toko manapun.
              </p>
            )}
          </div>

          {/* Riwayat Transaksi */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Riwayat Transaksi
            </h2>
            <div className="flow-root">
              {transactions.length === 0 ? (
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
                          Belanja di {tx.merchantName}
                        </p>
                        <p className="text-gray-700">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {tx.createdAt
                            ? new Date(
                                tx.createdAt.seconds * 1000
                              ).toLocaleString("id-ID")
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
