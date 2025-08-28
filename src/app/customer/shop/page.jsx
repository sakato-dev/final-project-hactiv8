"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function ShopPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      const querySnapshot = await getDocs(collection(db, "merchants"));
      const merchantsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMerchants(merchantsList);
      setLoading(false);
    };
    fetchMerchants();
  }, []);

  if (loading) {
    return <p className="text-center p-10">Memuat daftar toko...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Pilih Toko</h1>
      <div className="space-y-4">
        {merchants.length === 0 && (
          <p className="text-center p-10">Tidak ada toko yang tersedia.</p>
        )}
        {merchants.map((merchant) => (
          <Link key={merchant.id} href={`/customer/shop/${merchant.id}`}>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-700 transition">
              <img
                src={merchant.logoUrl || "/logo.png"}
                alt={merchant.name}
                className="w-16 h-16 rounded-md object-cover bg-white p-1"
              />
              <div>
                <h2 className="text-lg font-semibold">{merchant.name}</h2>
                <p className="text-sm text-gray-400">
                  {merchant.description || "Jelajahi produk dari toko ini."}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
