"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { FaClipboardList, FaMoneyBill, FaUsers } from "react-icons/fa";
import formatAngka from "@/utils/FormatAngka";
import formatRupiah from "@/utils/FormatRupiah";
import CreateStoreModal from "@/components/admin/create-store-modal";
import { useModal } from "./layout"; // <-- Impor hook useModal dari layout

export default function AdminHome() {
  const { currentUser, loading } = useAuth();
  const [err, setErr] = useState("");
  const [merchantData, setMerchantData] = useState({
    merchants: [],
    cashiers: [],
    transactions: [],
    customers: [],
  });
  const [saving, setSaving] = useState(false);
  const { openModal, closeModal } = useModal(); // <-- Gunakan context untuk kontrol modal

  const [dataCard, setDataCard] = useState([
    {
      label: "Total Customer",
      value: 0,
      icon: <FaUsers className="w-6 h-6" />,
    },
    {
      label: "Total Product",
      value: 0,
      icon: <FaClipboardList className="w-6 h-6" />,
    },
    {
      label: "Total Omset",
      value: formatRupiah(0),
      icon: <FaMoneyBill className="w-6 h-6" />,
    },
  ]);

  const handleCreateMerchant = async (storeName, logoUrl) => {
    try {
      if (!currentUser) throw new Error("Belum login");
      const cleanName = (storeName || "").trim();
      if (!cleanName) {
        setErr("Nama toko wajib diisi");
        return;
      }

      setSaving(true);
      setErr("");

      const payload = {
        name: cleanName,
        logoUrl: logoUrl || "",
        description: "",
        ownerId: currentUser.uid,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const merchantRef = await addDoc(collection(db, "merchants"), payload);
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, { merchantId: merchantRef.id }, { merge: true });

      closeModal(); // <-- Tutup modal melalui context
    } catch (e) {
      setErr(e?.message ?? "Gagal membuat toko");
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk membuka modal dengan konten yang benar
  const showCreateStoreModal = () => {
    setErr(""); // Reset error setiap kali modal dibuka
    openModal(
      <CreateStoreModal
        isOpen={true}
        onClose={closeModal}
        onSave={handleCreateMerchant}
        saving={saving}
        err={err}
      />
    );
  };

  // ... useEffect Anda yang lain tidak perlu diubah ...
  useEffect(() => {
    if (loading || !currentUser) return;

    const merchantsQuery = query(
      collection(db, "merchants"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(merchantsQuery, async (snapshot) => {
      if (snapshot.empty) {
        setMerchantData({
          merchants: [],
          cashiers: [],
          transactions: [],
          customers: [],
        });
        return;
      }

      const merchants = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const merchantId = merchants[0].id;

      const cashiersQuery = query(
        collection(db, "users"),
        where("merchantId", "==", merchantId),
        where("role", "==", "cashier")
      );
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("merchantId", "==", merchantId),
        orderBy("createdAt", "desc")
      );
      const productsQuery = query(
        collection(db, "merchants", merchantId, "products")
      );

      const unsubProducts = onSnapshot(productsQuery, (productSnapshot) => {
        setDataCard((prev) => [
          prev[0],
          { ...prev[1], value: formatAngka(productSnapshot.size) },
          prev[2],
        ]);
      });

      const unsubCashiers = onSnapshot(cashiersQuery, (cashierSnapshot) => {
        const cashiers = cashierSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMerchantData((prev) => ({ ...prev, cashiers }));
      });

      const unsubTransactions = onSnapshot(
        transactionsQuery,
        async (transSnapshot) => {
          let totalOmset = 0;
          const customerIds = new Set();
          const transactions = transSnapshot.docs.map((d) => {
            const data = { id: d.id, ...d.data() };
            totalOmset += data.amount;
            customerIds.add(data.customerId);
            return data;
          });

          if (customerIds.size > 0) {
            const customerPromises = Array.from(customerIds).map((id) =>
              getDoc(doc(db, "users", id))
            );
            const customerDocs = await Promise.all(customerPromises);
            const customers = customerDocs
              .filter((doc) => doc.exists())
              .map((doc) => ({ id: doc.id, ...doc.data() }));
            setMerchantData((prev) => ({ ...prev, customers }));
            setDataCard((prev) => [
              { ...prev[0], value: formatAngka(customers.length) },
              ...prev.slice(1),
            ]);
          } else {
            setMerchantData((prev) => ({ ...prev, customers: [] }));
            setDataCard((prev) => [{ ...prev[0], value: 0 }, ...prev.slice(1)]);
          }

          setMerchantData((prev) => ({ ...prev, transactions }));
          setDataCard((prev) => [
            prev[0],
            prev[1],
            { ...prev[2], value: formatRupiah(totalOmset) },
          ]);
        }
      );

      setMerchantData((prev) => ({ ...prev, merchants }));

      return () => {
        unsubCashiers();
        unsubTransactions();
        unsubProducts();
      };
    });

    return () => unsubscribe();
  }, [loading, currentUser, saving]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        {loading && <p>Memuat...</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          {dataCard.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow">
              <div className="text-indigo-600 mb-2">{item.icon}</div>
              <h2 className="text-sm text-gray-600">{item.label}</h2>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
        {!loading && (
          <div className="space-y-8">
            {merchantData.merchants.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-lg">Anda belum memiliki toko.</p>
                <button
                  onClick={showCreateStoreModal} // Panggil fungsi ini
                  className="border px-6 py-2 rounded-md mt-4 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Buat Toko Sekarang
                </button>
              </div>
            ) : (
              merchantData.merchants.map((m) => (
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
                        Pelanggan
                      </h3>

                      {merchantData.customers.length > 0 ? (
                        <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded-md">
                          {merchantData.customers.map((c) => (
                            <li key={c.id} className="text-gray-700">
                              {c.email}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <>
                          <p className="text-gray-500 mt-2">
                            Belum ada pelanggan.
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
                    {merchantData.transactions.length > 0 ? (
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
                            {merchantData.transactions.map((tx) => (
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
