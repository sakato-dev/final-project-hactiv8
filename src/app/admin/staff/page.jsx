"use client";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";

export default function page() {
  const [cashiers, setCashiers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [cashierEmail, setCashierEmail] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [registeringCashier, setRegisteringCashier] = useState(false);
  const [err, setErr] = useState("");
  const { currentUser } = useAuth();

  const getMerchants = async (uid) => {
    if (!uid) return;
    const merchantsQuery = query(
      collection(db, "merchants"),
      where("ownerId", "==", uid)
    );
    const querySnapshot = await getDocs(merchantsQuery);
    const merchantsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMerchants(merchantsList);
  };

  useEffect(() => {
    getMerchants(currentUser.uid);
  }, []);

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
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="my-4 border p-4 rounded-xl">
        <h2>Staff Member</h2>
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
            <p className="text-gray-500 mt-2">Belum ada kasir terdaftar.</p>

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
                  onChange={(e) => setCashierEmail(e.target.value)}
                  placeholder="Email Kasir"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="password"
                  value={cashierPassword}
                  onChange={(e) => setCashierPassword(e.target.value)}
                  placeholder="Password Kasir"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={registeringCashier}
                  className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {registeringCashier ? "Mendaftarkan..." : "Daftarkan Kasir"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
