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
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function CustomerHome() {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  const scrollRef = useRef(null);
  const [openTxIds, setOpenTxIds] = useState(new Set());
  const router = useRouter();

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

  const toggleTx = (id) => {
    setOpenTxIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  const scrollToCard = (index) => {
    if (scrollRef.current) {
      const card = scrollRef.current.children[index];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  };

  const onScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = e.target.children[0]?.offsetWidth || 1;
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentCardIndex(index);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 w-full max-w-full">
        <div className="min-w-0 flex-1 flex items-center">
          <img
            src="/logo.png"
            alt="Point Juaro"
            className="h-8 w-auto max-w-full"
          />
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button
            className="bg-white w-9 h-9 rounded-full flex items-center justify-center shadow cursor-pointer"
            aria-label="Notifications"
            onClick={() => router.push("/customer/notifications")}
          >
            <FaBell className="text-[#0f172a] w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full">
        <CustomerTabs />
      </div>

      <div className="px-4">
        {memberships.length > 0 ? (
          <div className="mb-8">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollBehavior: "smooth" }}
              onScroll={onScroll}
            >
              {memberships.map((membership, idx) => {
                const isStampMode =
                  membership?.promotionSettings?.type === "stamp";
                return (
                  <div
                    key={membership.id}
                    className="min-w-[440px] max-w-[480px] snap-center bg-gradient-to-br from-green-400 to-blue-500 p-0 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between"
                    style={{
                      borderRadius: "20px",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div className="relative z-10 p-8 pb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {membership?.merchantName || "Toko Bangunan"}
                        </h3>
                        <p className="text-sm text-white font-semibold opacity-80 mt-1">
                          {isStampMode ? "Stamps" : "Points"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <div>
                          <span className="text-white font-bold text-5xl leading-none">
                            {isStampMode
                              ? `${membership?.stamps || 0} / ${
                                  membership?.promotionSettings
                                    ?.stampThreshold || 10
                                }`
                              : membership?.points || 0}
                          </span>
                          <div className="text-white text-base font-medium mt-2">
                            {isStampMode ? "Stempel" : "Poin"}
                          </div>
                          <div className="mt-8">
                            <p className="text-sm text-white opacity-80 mb-1">
                              Nama Member
                            </p>
                            <p className="text-white font-semibold">
                              {userProfile?.displayName || "Customer 1"}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center">
                          <div className="bg-white p-3 rounded-lg shadow">
                            {userProfile?.uid && (
                              <QRCodeSVG value={userProfile.uid} size={90} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {memberships.length > 1 && (
              <div className="flex justify-center mt-2 space-x-2">
                {memberships.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCard(index)}
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
            <div>
              {getCurrentCardTransactions().length > 0 ? (
                getCurrentCardTransactions()
                  .slice(0, 5)
                  .map((tx) => {
                    const isOpen = openTxIds.has(tx.id);
                    const items = Array.isArray(tx.items) ? tx.items : [];
                    return (
                      <div
                        key={tx.id}
                        className="bg-[#121a2d] rounded-xl mb-4 overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center px-6 py-4 focus:outline-none"
                          onClick={() => toggleTx(tx.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-white text-base mb-1 text-left">
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
                            <p className="text-gray-400 text-sm text-left">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-base text-green-400">
                              {isStampMode
                                ? `+${tx.stampsAwarded || 1} Stempel`
                                : `+${tx.pointsAwarded} Poin`}
                            </span>
                            <span
                              className={`transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="#94a3b8"
                                viewBox="0 0 24 24"
                              >
                                <path d="M7 10l5 5 5-5" />
                              </svg>
                            </span>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 border-t border-[#1f2937] animate-fadein">
                            {items.length === 0 ? (
                              <p className="text-gray-400 pt-2">
                                Tidak ada detail item.
                              </p>
                            ) : (
                              <>
                                {items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center pt-2"
                                  >
                                    <span className="text-gray-200">
                                      {item.name || item.title || "Item"}
                                    </span>
                                    <span className="text-gray-400">
                                      {item.qty || item.quantity || 1} × Rp{" "}
                                      {(
                                        item.price ||
                                        item.unitPrice ||
                                        0
                                      ).toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                ))}
                                <div className="border-t border-[#1f2937] mt-2 pt-2 flex justify-between items-center font-bold">
                                  <span className="text-gray-100">Total</span>
                                  <span className="text-gray-100">
                                    Rp {tx.amount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-gray-400 text-center py-4 bg-[#121a2d] rounded-xl">
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
