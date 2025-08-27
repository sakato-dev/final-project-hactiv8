"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/contexts/auth-context";

export default function AdminHome() {
  const { currentUser, loading } = useAuth();
  const [err, setErr] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);

  const [cashierEmail, setCashierEmail] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [registeringCashier, setRegisteringCashier] = useState(false);

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

    // 1. Buat dokumen merchant
    const merchantRef = await addDoc(collection(db, "merchants"), payload);
    const merchantId = merchantRef.id;

    // 2. Update dokumen user admin dengan merchantId yang baru dibuat
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

  const handleRegisterCashier = async (e) => {
    e.preventDefault();
    if (merchants.length === 0) {
      setErr("Anda harus membuat toko terlebih dahulu.");
      return;
    }
    setRegisteringCashier(true);
    setErr("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cashierEmail,
        cashierPassword
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "cashier",
        uid: user.uid,
        merchantId: merchants[0].id,
      });

      alert(`Kasir ${cashierEmail} berhasil didaftarkan!`);
      await loadCashiers(merchants[0].id);
      setCashierEmail("");
      setCashierPassword("");
    } catch (error) {
      console.error("Error registering cashier:", error);
      setErr(error.message);
    } finally {
      setRegisteringCashier(false);
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

                          <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Daftarkan Kasir Baru
                            </h3>
                            <p className="text-sm text-gray-600">
                              Anda hanya dapat mendaftarkan satu kasir.
                            </p>
                            <form
                              onSubmit={handleRegisterCashier}
                              className="mt-4 space-y-3 max-w-sm"
                            >
                              <input
                                type="email"
                                value={cashierEmail}
                                onChange={(e) =>
                                  setCashierEmail(e.target.value)
                                }
                                placeholder="Email Kasir"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <input
                                type="password"
                                value={cashierPassword}
                                onChange={(e) =>
                                  setCashierPassword(e.target.value)
                                }
                                placeholder="Password Kasir"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <button
                                type="submit"
                                disabled={registeringCashier}
                                className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                              >
                                {registeringCashier
                                  ? "Mendaftarkan..."
                                  : "Daftarkan Kasir"}
                              </button>
                            </form>
                          </div>
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
