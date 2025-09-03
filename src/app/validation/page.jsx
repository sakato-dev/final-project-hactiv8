"use client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Validation() {
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile.role === "admin") {
      router.push("/admin");
    } else if (userProfile.role === "cashier") {
      router.push("/cashier");
    } else if (userProfile.role === "customer") {
      router.push("/customer");
    }
  }, [userProfile.role]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
    </div>
  );
}
