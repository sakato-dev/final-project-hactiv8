"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaShoppingBasket,
  FaShoppingCart,
  FaReceipt,
  FaUser,
} from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/auth-context";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { pendingOrders = [] } = useAuth() || {};

  const navItems = [
    {
      href: "/customer",
      icon: FaHome,
      label: "Home",
    },
    {
      href: "/customer/shop",
      icon: FaShoppingBasket,
      label: "Shop",
    },
    {
      href: "/customer/cart",
      icon: FaShoppingCart,
      label: "Cart",
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      href: "/customer/orders",
      icon: FaReceipt,
      label: "Orders",
      badge: pendingOrders.length > 0 ? pendingOrders.length : null,
    },
    {
      href: "/customer/profile",
      icon: FaUser,
      label: "Profil Saya",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#0b1222] border-t border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive ? "text-[#22c55e]" : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
