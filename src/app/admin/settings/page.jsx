"use client";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk form
  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [promoType, setPromoType] = useState("point");
  const [pointsPerAmount, setPointsPerAmount] = useState(1000);
  const [stampThreshold, setStampThreshold] = useState(10);
  const [stampReward, setStampReward] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!userProfile || !userProfile.merchantId) {
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
    }
  }, [userProfile, router]);

  useEffect(() => {
    if (userProfile && userProfile.merchantId) {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      const unsubscribe = onSnapshot(merchantRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMerchant({ id: doc.id, ...data });
          // Set state form dari data merchant
          setStoreName(data.name || "");
          setLogoUrl(data.logoUrl || "");
          setPromoType(data.promotionSettings?.type || "point");
          setPointsPerAmount(data.promotionSettings?.pointsPerAmount || 1000);
          setStampThreshold(data.promotionSettings?.stampThreshold || 10);
          setStampReward(data.promotionSettings?.stampReward || "");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const merchantRef = doc(db, "merchants", userProfile.merchantId);
      await updateDoc(merchantRef, {
        name: storeName,
        logoUrl: logoUrl,
        promotionSettings: {
          type: promoType,
          pointsPerAmount: Number(pointsPerAmount),
          stampThreshold: Number(stampThreshold),
          stampReward: stampReward,
        },
      });
      alert("Pengaturan berhasil disimpan!");
    } catch (error) {
      console.error("Error updating settings: ", error);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen">
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Toko</h1>
      <form
        onSubmit={handleSave}
        className="max-w-2xl bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        {/* Profile Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Profil Toko</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Toko
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL Logo Toko
              </label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  className="mt-2 h-20 w-20 object-cover rounded-md"
                />
              )}
            </div>
          </div>
        </div>

        {/* Promotion Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pengaturan Promosi</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="promoType"
                  value="point"
                  checked={promoType === "point"}
                  onChange={() => setPromoType("point")}
                  className="mr-2"
                />
                Sistem Poin
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="promoType"
                  value="stamp"
                  checked={promoType === "stamp"}
                  onChange={() => setPromoType("stamp")}
                  className="mr-2"
                />
                Sistem Stempel (Stamp)
              </label>
            </div>

            {/* Point System Logic */}
            {promoType === "point" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Poin per (Rp)
                </label>
                <input
                  type="number"
                  value={pointsPerAmount}
                  onChange={(e) => setPointsPerAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  placeholder="Contoh: 1000 (1 poin per Rp 1000)"
                />
              </div>
            )}

            {/* Stamp System Logic */}
            {promoType === "stamp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah stempel untuk hadiah
                  </label>
                  <input
                    type="number"
                    value={stampThreshold}
                    onChange={(e) => setStampThreshold(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Contoh: 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi Hadiah
                  </label>
                  <input
                    type="text"
                    value={stampReward}
                    onChange={(e) => setStampReward(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    placeholder="Contoh: Gratis 1 Es Kopi Susu"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
