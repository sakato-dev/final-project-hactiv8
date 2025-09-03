"use client";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0b1222] flex flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 h-14 text-blue-600 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414a2 2 0 00-2.828 0l-1.415 1.414m0 0l-1.414 1.414a2 2 0 000 2.828l1.414 1.414m0 0l1.415 1.414a2 2 0 002.828 0l1.414-1.414m0 0l1.414-1.414a2 2 0 000-2.828l-1.414-1.414m-7.071 7.071l-1.414 1.414a2 2 0 000 2.828l1.414 1.414m0 0l1.415 1.414a2 2 0 002.828 0l1.414-1.414m0 0l1.414-1.414a2 2 0 000-2.828l-1.414-1.414" />
      </svg>
      <h2 className="text-white text-xl font-bold mb-2">Notification</h2>
      <p className="text-gray-400 text-center mb-6">
        Halaman ini sedang dalam pengembangan.
      </p>
      <button
        className="bg-white text-[#2563eb] font-semibold px-6 py-2 rounded-lg shadow"
        onClick={() => router.back()}
      >
        Kembali
      </button>
    </div>
  );
}