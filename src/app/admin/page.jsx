"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";

const MERCHANTS_COL = "merchants";

export default function AdminHome() {
  const { currentUser, loading } = useAuth();
  const [err, setErr] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleLogout = () => auth.signOut();

  const loadMerchants = async (uid) => {
    const merchantsCol = collection(db, MERCHANTS_COL);
    const ownedSnap = await getDocs(
      query(merchantsCol, where("ownerId", "==", uid))
    );
    const list = ownedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMerchants(list);
  };

  // === FUNGSI: Tambah Toko ===
  const createMerchant = async ({ name, description = "" }) => {
    if (!currentUser) throw new Error("Belum login");
    const cleanName = (name ?? "").trim();
    if (!cleanName) throw new Error("Nama toko wajib diisi");

    // (opsional) Cek duplikat nama per owner
    const dupSnap = await getDocs(
      query(
        collection(db, MERCHANTS_COL),
        where("ownerId", "==", currentUser.uid),
        where("name", "==", cleanName)
      )
    );
    if (!dupSnap.empty) throw new Error("Nama toko sudah ada di akun ini");

    const payload = {
      name: cleanName,
      description: description.trim(),
      ownerId: currentUser.uid,
      members: [currentUser.uid],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, MERCHANTS_COL), payload);
    return { id: ref.id, ...payload };
  };

  const handleCreateMerchant = async () => {
    try {
      if (!currentUser) throw new Error("Belum login");
      const name = window.prompt("Nama toko?");
      if (!name) return;
      setSaving(true);
      await createMerchant({ name });
      await loadMerchants(currentUser.uid);
      setErr("");
    } catch (e) {
      setErr(e?.message ?? "Gagal membuat toko");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!currentUser) return;
    loadMerchants(currentUser.uid);
  }, [loading, currentUser]);

  return (
    <ProtectedRoute>
      <div>
        <h1>AdminHome CMS PAGE DASHBOARD</h1>

        {loading && <p>Memuat...</p>}
        {err && !loading && <p className="text-red-600">{err}</p>}

        {!loading && !err && (
          <ul className="mt-4 space-y-2">
            {merchants.length === 0 ? (
              <>
                <li>Tidak ada merchant terkait akun ini.</li>
                <li>
                  <button
                    onClick={handleCreateMerchant}
                    disabled={saving}
                    className="border px-3 py-1 rounded"
                  >
                    {saving ? "Menyimpan..." : "Buat Toko"}
                  </button>
                </li>
              </>
            ) : (
              <>
                {merchants.map((m) => (
                  <li key={m.id} className="border p-2 rounded">
                    <div>
                      <b>{m.name ?? "(Tanpa nama)"}</b>
                    </div>
                    <div>ID: {m.id}</div>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 border px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </ProtectedRoute>
  );
}
