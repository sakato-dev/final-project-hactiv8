"use client";
import { useAuth } from "@/contexts/auth-context";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, use } from "react";
import Swal from "sweetalert2";

export default function StaffPage() {
  const [cashiers, setCashiers] = useState([]);
  const [merchantId, setMerchantId] = useState(null);
  const [cashierEmail, setCashierEmail] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [err, setErr] = useState("");
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile && userProfile.merchantId) {
      setMerchantId(userProfile.merchantId);
    }
  }, [userProfile]);

  console.log(userProfile, "userProfile");

  useEffect(() => {
    if (!userProfile?.merchantId) {
      Swal.fire({
        title: "Toko belum dibuat",
        text: "Silakan buat toko terlebih dahulu.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Buat Toko",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/admin");
        }
      });
      return;
    }

    const cashiersQuery = query(
      collection(db, "users"),
      where("merchantId", "==", merchantId),
      where("role", "==", "cashier")
    );

    const unsubscribe = onSnapshot(cashiersQuery, (querySnapshot) => {
      const cashiersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCashiers(cashiersList);
    });

    return () => unsubscribe();
  }, [merchantId]);

  const handleRegisterCashier = useCallback(
    async (e) => {
      e.preventDefault();
      if (!merchantId) {
        setErr("Anda harus membuat toko terlebih dahulu.");
        return;
      }
      setRegistering(true);
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
          merchantId: merchantId,
        });

        alert(`Kasir ${cashierEmail} berhasil didaftarkan!`);
        setCashierEmail("");
        setCashierPassword("");
      } catch (error) {
        console.error("Error registering cashier:", error);
        setErr(error.message);
      } finally {
        setRegistering(false);
      }
    },
    [cashierEmail, cashierPassword, merchantId]
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Manajemen Staff</h1>

      <div className="my-4 border p-4 rounded-xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold">Anggota Staff</h2>
        {cashiers.length > 0 ? (
          <ul className="mt-2 list-disc list-inside bg-gray-50 p-3 rounded-md">
            {cashiers.map((c) => (
              <li key={c.id} className="text-gray-700">
                {c.email}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p className="text-gray-500 mt-2">Belum ada kasir terdaftar.</p>
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Daftarkan Kasir Baru
              </h3>
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
                  disabled={registering}
                  className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {registering ? "Mendaftarkan..." : "Daftarkan Kasir"}
                </button>
                {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
