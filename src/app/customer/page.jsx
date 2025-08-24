"use client";
import ProtectedRoute from "@/components/protected-route";
import { auth } from "@/lib/firebase";

export default function CustomerHome() {
  const handleLogout = () => {
    // Lakukan logika logout di sini dengan fire base
    auth.signOut();
  };
  return (
    <ProtectedRoute>
      <div>CustomerHome</div>
      <button onClick={handleLogout}>Logout</button>
    </ProtectedRoute>
  );
}
