"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { FaBoxOpen, FaClipboardList, FaMoneyBill } from "react-icons/fa";
import formatAngka from "@/utils/FormatAngka";
import formatRupiah from "@/utils/FormatRupiah";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const { currentUser, loading } = useAuth();
  const [err, setErr] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const dataCard = [
    {
      label: "Total Customer",
      value: formatAngka(10),
      icon: <FaBoxOpen className="w-6 h-6" />,
    },
    {
      label: "Total Product",
      value: formatAngka(100032),
      icon: <FaClipboardList className="w-6 h-6" />,
    },
    {
      label: "Total Omset",
      value: formatRupiah(123123),
      icon: <FaMoneyBill className="w-6 h-6" />,
    },
  ];

  const loadCashiers = async (merchantId) => {
    if (!merchantId) return;
    const cashiersQuery = query(
      collection(db, "users"),
      where("merchantId", "==", merchantId),
      where("role", "==", "cashier")
    );
    const querySnapshot = await getDocs(cashiersQuery);
    const cashiersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCashiers(cashiersList);
  };

  const loadTransactions = async (merchantId) => {
    if (!merchantId) return;
    const transQuery = query(
      collection(db, "transactions"),
      where("merchantId", "==", merchantId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(transQuery);
    const transList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTransactions(transList);
  };

  const loadMerchants = async (uid) => {
    const merchantsCol = collection(db, "merchants");
    const ownedSnap = await getDocs(
      query(merchantsCol, where("ownerId", "==", uid))
    );
    const list = ownedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMerchants(list);

    if (list.length > 0) {
      const merchantId = list[0].id;
      await loadCashiers(merchantId);
      await loadTransactions(merchantId);
    }
  };

  const createMerchant = async ({ name }) => {
    if (!currentUser) throw new Error("Belum login");
    const cleanName = (name ?? "").trim();
    if (!cleanName) throw new Error("Nama toko wajib diisi");

    const dupSnap = await getDocs(
      query(
        collection(db, "merchants"),
        where("ownerId", "==", currentUser.uid)
      )
    );
    if (!dupSnap.empty) throw new Error("Anda hanya dapat membuat satu toko.");

    const payload = {
      name: cleanName,
      description: "",
      ownerId: currentUser.uid,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const merchantRef = await addDoc(collection(db, "merchants"), payload);
    const merchantId = merchantRef.id;

    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, { merchantId: merchantId }, { merge: true });

    return { id: merchantId, ...payload };
  };

  const handleCreateMerchant = async () => {
    try {
      if (!currentUser) throw new Error("Belum login");
      const name = window.prompt("Masukkan nama toko Anda:");
      if (!name) return;
      setSaving(true);
      await createMerchant({ name });
      await loadMerchants(currentUser.uid);
      setErr("");
    } catch (e) {
      setErr(e?.message ?? "Gagal membuat toko");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || !currentUser) return;
    loadMerchants(currentUser.uid);
  }, [loading, currentUser]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

        {loading && <p>Memuat...</p>}
        {err && !loading && (
          <p className="text-red-600 bg-red-100 p-3 rounded-md">{err}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          {dataCard.map((item, i) => (
            <div
              key={i}
              className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md flex flex-col items-center transition-all duration-300 ease-in-out ${
                item.path ? "cursor-pointer" : ""
              }`}
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                {item.icon}
              </div>
              <h2 className="text-sm text-gray-600 dark:text-gray-300">
                {item.label}
              </h2>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {!loading && !err && (
          <div className="space-y-8">
            {merchants.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p>Anda belum memiliki toko.</p>
                <button
                  onClick={handleCreateMerchant}
                  disabled={saving}
                  className="border px-4 py-2 rounded-md mt-4 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? "Menyimpan..." : "Buat Toko Sekarang"}
                </button>
              </div>
            ) : (
              merchants.map((m) => (
                <div key={m.id} className="space-y-8">
                  {/* Informasi Toko & Kasir */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {m.name ?? "(Tanpa nama)"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        ID Toko: {m.id}
                      </p>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Kasir Terdaftar
                      </h3>

                      {cashiers.length > 0 ? (
                        <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded-md">
                          {cashiers.map((c) => (
                            <li key={c.id} className="text-gray-700">
                              {c.email}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <>
                          <p className="text-gray-500 mt-2">
                            Belum ada kasir terdaftar.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Riwayat Transaksi */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      Riwayat Transaksi
                    </h2>
                    {transactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Tanggal
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                ID Pelanggan
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Jumlah (Rp)
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Poin
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((tx) => (
                              <tr key={tx.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {tx.createdAt
                                    ? new Date(
                                        tx.createdAt.seconds * 1000
                                      ).toLocaleString("id-ID", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono ">
                                  {tx.customerId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {tx.amount.toLocaleString("id-ID")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                  +{tx.pointsAwarded}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-4">
                        Belum ada transaksi yang tercatat.
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
