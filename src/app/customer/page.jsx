"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  collection,
  query,
  where,
  orderBy,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { FaBell, FaUser } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import CustomerTabs from "@/components/customer/customer-tabs";

export default function CustomerHome() {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const membershipsQuery = query(
      collection(db, "users", userProfile.uid, "memberships"),
      orderBy("points", "desc")
    );
    const unsubMemberships = onSnapshot(membershipsQuery, async (snapshot) => {
      const memberListPromises = snapshot.docs.map(async (docSnapshot) => {
        const membershipData = docSnapshot.data();
        const merchantRef = doc(db, "merchants", membershipData.merchantId);
        const merchantSnap = await getDoc(merchantRef);
        return {
          id: docSnapshot.id,
          ...membershipData,
          promotionSettings: merchantSnap.exists()
            ? merchantSnap.data().promotionSettings
            : { type: "point" },
        };
      });
      const memberList = await Promise.all(memberListPromises);
      setMemberships(memberList);
      setLoading(false);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("customerId", "==", userProfile.uid),
      orderBy("createdAt", "desc")
    );
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(history);
    });

    return () => {
      unsubMemberships();
      unsubTransactions();
    };
  }, [userProfile]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && currentCardIndex < memberships.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    if (isRightSwipe && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const getCurrentCardTransactions = () => {
    if (memberships.length === 0) return [];
    const currentMembership = memberships[currentCardIndex];
    return transactions.filter(
      (tx) => tx.merchantId === currentMembership.merchantId
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat data Anda...</p>
      </div>
    );
  }

  const currentMembership = memberships[currentCardIndex];
  const isStampMode = currentMembership?.promotionSettings?.type === "stamp";

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <img src="/logo.png" alt="Point Juaro" />
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

      <div className="w-full">
        <CustomerTabs />
      </div>

      <div className="px-4">
        {memberships.length > 0 ? (
          <div
            className="mb-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="bg-gradient-to-br from-green-400 to-blue-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-medium">
                    {currentMembership?.merchantName || "Toko"}
                  </h3>
                  <p className="opacity-80 text-xl capitalize">
                    {isStampMode ? "Stamps" : "Points"}
                  </p>
                </div>
                <div className="mb-8">
                  <span className="text-white font-bold text-3xl">
                    {isStampMode
                      ? `${currentMembership?.stamps || 0} / ${
                          currentMembership?.promotionSettings
                            ?.stampThreshold || 10
                        }`
                      : currentMembership?.points || 0}
                  </span>
                  <span className="text-white ml-2">
                    {isStampMode ? "Stempel" : "Poin"}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Nama Member</p>
                    <p className="font-semibold">{userProfile?.email}</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    {userProfile?.uid && (
                      <QRCodeSVG value={userProfile.uid} size={80} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {memberships.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {memberships.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCardIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCardIndex ? "bg-white" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 bg-gray-800 p-6 rounded-2xl text-center">
            <p className="text-gray-400">
              Anda belum menjadi anggota di toko manapun.
            </p>
          </div>
        )}

        {currentMembership && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Riwayat Transaksi di {currentMembership.merchantName}
            </h2>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              {getCurrentCardTransactions().length > 0 ? (
                getCurrentCardTransactions()
                  .slice(0, 5)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">
                          {tx.createdAt
                            ? new Date(
                                tx.createdAt.seconds * 1000
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "Baru saja"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div
                        className={`font-semibold ${
                          isStampMode ? "text-blue-400" : "text-green-400"
                        }`}
                      >
                        {isStampMode
                          ? "+1 Stempel"
                          : `+${tx.pointsAwarded} Poin`}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Belum ada transaksi di toko ini.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
