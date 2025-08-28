"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { QRCodeSVG } from "qrcode.react";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.name || userProfile.email);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleSaveName = async () => {
    if (!userProfile || !displayName.trim()) return;

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", userProfile.uid);
      await updateDoc(userDocRef, {
        name: displayName.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal memperbarui nama:", error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-gray-900 min-h-screen text-white max-w-lg mx-auto p-6">
        {/* Header dengan tombol Kembali */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-3 text-white bg-gray-700 px-3 py-1 rounded-lg"
          >
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
        </div>

        {/* Bagian QR Code */}
        {userProfile?.uid && (
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={userProfile.uid} size={160} />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Tunjukkan QR ini pada kasir
            </p>
          </div>
        )}

        {/* Info Profil dan Edit Nama */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          {isEditing ? (
            // Tampilan saat mode edit aktif
            <div className="space-y-3">
              <label className="text-sm font-medium">Ubah Nama Tampilan</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600 rounded-lg text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-sm disabled:bg-gray-500"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          ) : (
            // Tampilan normal
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{displayName}</p>
                <p className="text-sm text-gray-400">{userProfile?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-400 text-sm font-semibold"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 py-3 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}
