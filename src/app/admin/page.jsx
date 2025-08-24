"use client";
import ProtectedRoute from "@/components/protected-route";
import { auth } from "@/lib/firebase";

export default function AdminHome() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <ProtectedRoute>
      <div>AdminHome CMS PAGE DASHBOARD</div>;
      <button onClick={handleLogout}>logout</button>
    </ProtectedRoute>
  );
}
