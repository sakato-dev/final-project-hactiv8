"use client";
import ProtectedRoute from "@/components/protected-route";

export default function KasirHome() {
  const handleLogout = () => {
    auth.signOut();
  };
  return (
    <ProtectedRoute>
      <div>KasirHome</div>
      <button onClick={handleLogout}>log out</button>
    </ProtectedRoute>
  );
}
