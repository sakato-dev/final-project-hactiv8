"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/protected-route";
import { FaBell, FaUser } from "react-icons/fa";
import CustomerTabs from "@/components/customer/customer-tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PromotionPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPromos = async () => {
      const querySnapshot = await getDocs(collection(db, "promotions"));
      const promosList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPromos(promosList);
      setLoading(false);
    };
    fetchPromos();
  }, []);

  return (
     <ProtectedRoute>
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
      <CustomerTabs />
      {/* Centered "under development" content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 text-blue-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414a2 2 0 00-2.828 0l-1.415 1.414m0 0l-1.414 1.414a2 2 0 000 2.828l1.414 1.414m0 0l1.415 1.414a2 2 0 002.828 0l1.414-1.414m0 0l1.414-1.414a2 2 0 000-2.828l-1.414-1.414m-7.071 7.071l-1.414 1.414a2 2 0 000 2.828l1.414 1.414m0 0l1.415 1.414a2 2 0 002.828 0l1.414-1.414m0 0l1.414-1.414a2 2 0 000-2.828l-1.414-1.414" />
        </svg>
        <h2 className="text-white text-xl font-bold mb-2">Promotion</h2>
        <p className="text-gray-400 text-center">
          Halaman ini sedang dalam pengembangan.
        </p>
      </div>
    </ProtectedRoute>
  );
}
