"use client";
import { useEffect, useState } from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { Toaster } from "react-hot-toast";
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
import Image from "next/image";

function CreateStoreForm({ onSave, onCancel, saving, err }) {
  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(storeName, logoUrl);
  };

  return (
    <div className="mt-6 border-t pt-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-800">Detail Toko Baru</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama Toko
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Contoh: Kopi Senja"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL Logo Toko (Opsional)
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="mt-2">
            <FileUploaderRegular
              pubkey="33563ee22dfa473493de"
              onFileUploadSuccess={(res) => setLogoUrl(res.cdnUrl)}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            />
          </div>
        </div>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Menyimpan..." : "Simpan Toko"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminHome() {
  const { currentUser, loading } = useAuth();
  const [err, setErr] = useState("");
  const [merchantData, setMerchantData] = useState({
    merchants: [],
    cashiers: [],
    transactions: [],
    customers: [],
  });
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

      setShowCreateForm(false);
    } catch (e) {
      setErr(e?.message ?? "Gagal membuat toko");
    } finally {
      setSaving(false);
    }
  };

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
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("merchantId", "==", merchantId),
        orderBy("createdAt", "desc")
      );
      const unsubTransactions = onSnapshot(
        transactionsQuery,
        async (transSnapshot) => {
          let totalOmset = 0;
          const customerIds = new Set();
          transSnapshot.forEach((d) => {
            const data = d.data();
            totalOmset += data.amount;
            customerIds.add(data.customerId);
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
          }
          setMerchantData((prev) => ({
            ...prev,
            transactions: transSnapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })),
          }));
          setDataCard((prev) => [
            prev[0],
            prev[1],
            { ...prev[2], value: formatRupiah(totalOmset) },
          ]);
        }
      );
      setMerchantData((prev) => ({ ...prev, merchants }));
      return () => {
        unsubProducts();
        unsubTransactions();
      };
    });
    return () => unsubscribe();
  }, [loading, currentUser]);

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
                  onClick={() => setShowCreateForm(true)}
                  className="border px-6 py-2 rounded-md mt-4 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Buat Toko Sekarang
                </button>

                {showCreateForm && (
                  <CreateStoreForm
                    onSave={handleCreateMerchant}
                    onCancel={() => setShowCreateForm(false)}
                    saving={saving}
                    err={err}
                  />
                )}
              </div>
            ) : (
              merchantData.merchants.map((m) => (
                <div key={m.id} className="space-y-8">
                  {/* Informasi Toko & Kasir */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <Image
                        src={m.logoUrl}
                        width={100}
                        height={100}
                        alt={m.name}
                      />
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {m.name ?? "(Tanpa nama)"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          ID Toko: {m.id}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Pelanggan
                      </h3>

                      {merchantData.customers.length > 0 ? (
                        <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded-md">
                          {merchantData.customers.map((c) => (
                            <li key={c.id} className="text-gray-700">
                              {c.name || c.email}
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
                                  +
                                  {tx.pointsAwarded > 0
                                    ? tx.pointsAwarded
                                    : tx.stampsAwarded}
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

export default AdminHome;
