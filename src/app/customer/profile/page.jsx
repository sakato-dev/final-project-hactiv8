"use client";
import ProtectedRoute from "@/components/protected-route";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <ProtectedRoute>
      <div className="bg-gray-900 min-h-screen text-white max-w-lg mx-auto p-6">
        {/* Header with Back */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/customer")}
            className="mr-3 text-white bg-gray-700 px-3 py-1 rounded-lg"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        {/* Profile info */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="mb-2">👤 Customer</p>
          <p className="text-sm text-gray-400">Your profile info can go here</p>
        </div>

        {/* Logout */}
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
