"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    if (userProfile) {
      const role = userProfile.role;

      if (
        role === "customer" &&
        pathname !== "/customer" &&
        pathname !== "/customer/promotion" &&
        pathname !== "/customer/profile"
      ) {
        router.push("/customer");
      } else if (
        role === "cashier" &&
        pathname !== "/cashier/home" &&
        pathname !== "/cashier/cart" &&
        pathname !== "/cashier/scan-qr" &&
        pathname !== "/cashier/checkout"
      ) {
        router.push("/cashier");
      } else if (
        role === "admin" &&
        pathname !== "/admin" &&
        pathname !== "/cashier/home" &&
        pathname !== "/cashier/cart" &&
        pathname !== "/cashier/scan-qr" &&
        pathname !== "/admin/staff" &&
        pathname !== "/admin/products-list" &&
        pathname !== "/admin/products-list/new"
      ) {
        router.push("/admin");
      }
    }
  }, [currentUser, userProfile]);

  return <>{currentUser ? children : null}</>;
}
