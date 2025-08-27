"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { FaBell, FaUser } from "react-icons/fa";
import CustomerTabs from "@/components/customer/customer-tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerHome() {
  const { currentUser, userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const router = useRouter();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const membershipsQuery = query(
          collection(db, "users", currentUser.uid, "memberships"),
          orderBy("points", "desc")
        );
        const membershipsSnapshot = await getDocs(membershipsQuery);
        const memberList = membershipsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemberships(memberList);

        const transactionsQuery = query(
          collection(db, "transactions"),
          where("customerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const transSnapshot = await getDocs(transactionsQuery);
        const history = transSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const transactionsWithMerchantName = await Promise.all(
          history.map(async (tx) => {
            if (!tx.merchantId) return { ...tx, merchantName: "Toko Lama" };
            const merchantDoc = await getDoc(
              doc(db, "merchants", tx.merchantId)
            );
            return {
              ...tx,
              merchantName: merchantDoc.exists()
                ? merchantDoc.data().name
                : "Toko Dihapus",
            };
          })
        );

        setTransactions(transactionsWithMerchantName);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

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

  const handleLogout = () => {
    auth.signOut();
  };

  // Filter transactions for current card
  const getCurrentCardTransactions = () => {
    if (memberships.length === 0) return [];
    const currentMembership = memberships[currentCardIndex];
    return transactions.filter(
      (tx) => tx.merchantId === currentMembership.merchantId
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
          <p className="text-white">Memuat data Anda...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-900 min-h-screen text-white max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Point Juaro" />
          </div>
          <div className="flex items-center space-x-4">
            <FaBell className="w-8 h-8 bg-gray-600 rounded-full p-2" />
            <Link
              href={"/customer/profile"}
              className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
            >
              <FaUser />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <CustomerTabs />

        <div className="px-4">
          {/* Swipeable Card Section */}
          {memberships.length > 0 ? (
            <div className="mb-8">
              <div
                className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="bg-gradient-to-br from-green-400 to-blue-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-2xl font-medium opacity-90">
                          Card {currentCardIndex + 1}
                        </h3>
                      </div>
                      <p className="opacity-80 text-2xl">Tier level</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex space-x-1 mb-4">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className="text-white opacity-60">
                            ••••{" "}
                          </span>
                        ))}
                        <span className="text-white font-bold text-lg">
                          {memberships[currentCardIndex]?.points || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-80 mb-1">Member Name</p>
                        <p className="font-semibold">Nama Customer</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        {userProfile?.uid && (
                          <QRCodeSVG
                            value={userProfile.uid}
                            size={80}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="L"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Indicators */}
                {memberships.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {memberships.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCardIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentCardIndex
                            ? "bg-white"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-gray-800 p-6 rounded-2xl text-center">
                <p className="text-gray-400">
                  Anda belum menjadi anggota di toko manapun.
                </p>
              </div>
            </div>
          )}

          {/* Transaction History for Current Card */}
          <div>
            <div className="bg-gray-800 rounded-t-2xl p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold"></span>
                </div>
                <div>
                  <p className="font-medium">Nama Customer</p>
                  <p className="text-sm text-gray-400">
                    {memberships[currentCardIndex]?.merchantName || "Toko"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-b-2xl text-gray-900">
              <div className="p-4">
                {getCurrentCardTransactions().length > 0 ? (
                  <div className="space-y-3">
                    {getCurrentCardTransactions()
                      .slice(0, 3)
                      .map((tx) => (
                        <div
                          key={tx.id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tx.createdAt
                                ? new Date(
                                    tx.createdAt.seconds * 1000
                                  ).toLocaleDateString("id-ID")
                                : "Baru saja"}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            +{tx.pointsAwarded} poin
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada transaksi di toko ini
                  </p>
                )}

                <button className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 font-medium">
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
