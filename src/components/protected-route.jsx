"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth/login");
    } else if (userProfile.role === "customer") {
      router.push("/customer");
    } else if (userProfile.role === "cashier") {
      router.push("/cashier");
    } else if (userProfile.role === "admin") {
      router.push("/admin");
    }
  }, [currentUser, router]);

  return <>{currentUser ? children : null}</>;
}
