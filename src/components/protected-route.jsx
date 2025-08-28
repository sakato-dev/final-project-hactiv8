"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";

// Halaman yang diizinkan untuk setiap peran (selain halaman utama mereka)
const allowedPaths = {
  admin: ["/admin"],
  cashier: ["/cashier"],
  customer: ["/customer"],
};

export default function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirect = useCallback(() => {
    if (!currentUser) {
      // Jika tidak ada user dan halaman bukan halaman login/register, arahkan ke login
      if (!pathname.startsWith("/auth") && pathname !== "/") {
        router.push("/auth/login");
      }
      return;
    }

    if (userProfile) {
      const { role } = userProfile;
      const basePath = `/${pathname.split("/")[1]}`; // -> /admin, /customer, etc.

      // Jika role tidak cocok dengan path utama, redirect ke halaman utama mereka
      if (allowedPaths[role] && !allowedPaths[role].includes(basePath)) {
        router.push(allowedPaths[role][0]);
      }
    }
  }, [currentUser, userProfile, pathname, router]);

  useEffect(() => {
    // Jangan lakukan apa-apa saat loading
    if (loading) return;

    handleRedirect();
  }, [loading, handleRedirect]);

  // Tampilkan children hanya jika loading selesai dan user ada
  if (loading || !currentUser) {
    // Tampilkan loading spinner atau null agar tidak ada flash konten
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return children;
}
