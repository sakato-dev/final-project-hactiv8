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

      if (role === "customer" && pathname !== "/customer") {
        router.push("/customer");
      } else if (role === "cashier" && pathname !== "/cashier") {
        router.push("/cashier");
      } else if (
        role === "admin" &&
        pathname !== "/admin" &&
        pathname !== "/cashier" &&
        pathname !== "/admin/staff" &&
        pathname !== "/admin/products-list"
      ) {
        router.push("/admin");
      }
    }
  }, [currentUser, userProfile]);

  return <>{currentUser ? children : null}</>;
}
