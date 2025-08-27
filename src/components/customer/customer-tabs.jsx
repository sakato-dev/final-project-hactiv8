"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerTabs() {
  const pathname = usePathname();
  const isPromotion = pathname?.startsWith("/customer/promotion");

  const active = "bg-blue-700 px-19 py-3 rounded-2xl font-medium text-2xl text-white";
  const inactive = "px-19 py-3 text-gray-400 text-2xl";

  return (
    <div className="flex justify-center px-4 mb-6">
      <div className="bg-gray-800 p-1 rounded-2xl flex">
        <Link href="/customer" className={`${!isPromotion ? active : inactive}`}>
          Home
        </Link>
        <Link href="/customer/promotion" className={`${isPromotion ? active : inactive}`}>
          Promotion
        </Link>
      </div>
    </div>
  );
}
