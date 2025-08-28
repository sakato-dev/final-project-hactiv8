"use client";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/protected-route";
import CustomerNavbar from "@/components/customer/customer-navbar";

export default function CustomerLayout({ children }) {
  return (
    <ProtectedRoute>
      <CartProvider>
        <div className="bg-gray-900 min-h-screen text-white max-w-lg mx-auto pb-20">
          {children}
          <CustomerNavbar />
        </div>
      </CartProvider>
    </ProtectedRoute>
  );
}
