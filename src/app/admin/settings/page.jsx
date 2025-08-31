"use client";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [taxRate, setTaxRate] = useState(null);
  const [promoType, setPromoType] = useState("point");
  const [pointsPerAmount, setPointsPerAmount] = useState(1000);
  const [stampThreshold, setStampThreshold] = useState(10);
  const [stampReward, setStampReward] = useState("");
  const [stampPerAmount, setStampPerAmount] = useState(50000);
  const [isPromoSettingDisabled, setIsPromoSettingDisabled] = useState(false);

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
          setStoreName(data.name || "");
          setLogoUrl(data.logoUrl || "");
          setTaxRate(data.taxRate);
          if (data.promotionSettings && data.promotionSettings.type) {
            setPromoType(data.promotionSettings.type);
            setPointsPerAmount(data.promotionSettings.pointsPerAmount || 1000);
            setStampThreshold(data.promotionSettings.stampThreshold || 10);
            setStampReward(data.promotionSettings.stampReward || "");
            setStampPerAmount(data.promotionSettings.stampPerAmount || 50000);
            setIsPromoSettingDisabled(true);
          }
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
      const updateData = {
        name: storeName,
        logoUrl: logoUrl,
        taxRate: Number(taxRate),
      };

      if (!isPromoSettingDisabled) {
        updateData.promotionSettings = {
          type: promoType,
          pointsPerAmount: Number(pointsPerAmount),
          stampThreshold: Number(stampThreshold),
          stampReward: stampReward,
          stampPerAmount: Number(stampPerAmount),
        };
      }

      await updateDoc(merchantRef, updateData);
      Swal.fire("Berhasil", "Pengaturan berhasil disimpan", "success");
      if (!isPromoSettingDisabled) {
        setIsPromoSettingDisabled(true);
      }
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
        className="max-w-2xl bg-white p-6 rounded-lg shadow-md space-y-8"
      >
        {/* Profile Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
            Profil Toko
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Toko
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo Toko
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaCloudUploadAlt size={32} className="text-gray-400" />
                )}
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Paste URL logo di sini..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>atau</span>
                  <div className="relative">
                    <FileUploaderRegular
                      pubkey="33563ee22dfa473493de"
                      onFileUploadSuccess={(res) => setLogoUrl(res.cdnUrl)}
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pajak (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contoh: 11"
            />
          </div>
        </div>

        {/* Promotion Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
            Pengaturan Promosi
          </h2>
          {isPromoSettingDisabled && (
            <p className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md">
              Pengaturan promosi hanya dapat diatur sekali dan tidak dapat
              diubah.
            </p>
          )}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="promoType"
                  value="point"
                  checked={promoType === "point"}
                  onChange={() => setPromoType("point")}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isPromoSettingDisabled}
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
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isPromoSettingDisabled}
                />
                Sistem Stempel (Stamp)
              </label>
            </div>

            {promoType === "point" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Poin per (Rp)
                </label>
                <input
                  type="number"
                  value={pointsPerAmount}
                  onChange={(e) => setPointsPerAmount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder="Contoh: 1000 (1 poin per Rp 1000)"
                  disabled={isPromoSettingDisabled}
                />
              </div>
            )}

            {promoType === "stamp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stempel per (Rp)
                  </label>
                  <input
                    type="number"
                    value={stampPerAmount}
                    onChange={(e) => setStampPerAmount(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    placeholder="Contoh: 50000 (1 stempel per Rp 50000)"
                    disabled={isPromoSettingDisabled}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah stempel untuk hadiah
                  </label>
                  <input
                    type="number"
                    value={stampThreshold}
                    onChange={(e) => setStampThreshold(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    placeholder="Contoh: 10"
                    disabled={isPromoSettingDisabled}
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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    placeholder="Contoh: Gratis 1 Es Kopi Susu"
                    disabled={isPromoSettingDisabled}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
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
