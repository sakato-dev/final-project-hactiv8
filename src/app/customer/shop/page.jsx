"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

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

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b1222]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <img src="/logo.png" alt="PointJuaro" className="h-8" />
        <button
          className="bg-white w-9 h-9 rounded-full flex items-center justify-center shadow"
          aria-label="Notifications"
          onClick={() => router.push("/customer/notifications")}
        >
          <FaBell className="text-[#0f172a] w-5 h-5" />
        </button>
      </div>
      {/* Search Bar */}
      <div className="px-4">
        <input
          type="text"
          className="w-full bg-[#121a2d] text-white rounded-lg px-4 py-3 mb-4 border border-[#334155] placeholder:text-[#94a3b8] text-base"
          placeholder="Cari toko..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {/* Merchant List */}
      <div className="px-4 pb-24">
        {loading ? (
          <p className="text-center p-10 text-white">Memuat daftar toko...</p>
        ) : filteredMerchants.length === 0 ? (
          <p className="text-center p-10 text-[#94a3b8] italic">
            Toko tidak ditemukan.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMerchants.map((merchant) => (
              <Link key={merchant.id} href={`/customer/shop/${merchant.id}`}>
                <div className="flex items-center gap-4 bg-[#121a2d] rounded-lg px-4 py-3 hover:bg-[#1e293b] transition cursor-pointer">
                  <img
                    src={merchant.logoUrl || "/logo.png"}
                    alt={merchant.name}
                    className="w-12 h-12 rounded-md object-cover bg-white p-1"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">
                      {merchant.name}
                    </h2>
                    <p className="text-sm text-[#94a3b8]">
                      {merchant.description || "Jelajahi produk dari toko ini."}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
