"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/protected-route";
import { FaBell, FaUser } from "react-icons/fa";
import CustomerTabs from "@/components/customer/customer-tabs";
import Link from "next/link";

export default function PromotionPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex justify-between items-center p-4">
        <img src="/logo.png" alt="PointJuaro" className="h-8" />
        <div className="flex items-center space-x-4">
          <FaBell className="w-8 h-8 bg-gray-600 rounded-full p-2" />
          <Link
            href="/customer/profile"
            className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
          >
            <FaUser />
          </Link>
        </div>
      </div>
      <CustomerTabs />
      <div className="px-4 space-y-4 pb-10">
        {loading ? (
          <p>Memuat promosi...</p>
        ) : (
          promos.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              <div className="bg-green-600 p-4 flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
                <h3 className="text-white font-semibold">{p.title}</h3>
              </div>
              <div className="p-4 flex justify-between items-center text-gray-900">
                <div>
                  <p className="text-2xl font-bold">{p.discount} Off</p>
                  <p className="text-gray-500 text-sm">
                    Berlaku hingga: {p.date}
                  </p>
                </div>
                <button className="bg-orange-500 text-white px-5 py-2 rounded-full">
                  Redeem
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </ProtectedRoute>
  );
}
