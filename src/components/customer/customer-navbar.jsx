"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaStore, FaShoppingCart, FaQrcode } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { href: "/customer", icon: FaHome, label: "Home" },
    { href: "/customer/shop", icon: FaStore, label: "Shop" },
    { href: "/customer/cart", icon: FaShoppingCart, label: "Cart" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-gray-800 border-t border-gray-700">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive
                    ? "text-orange-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.href === "/customer/cart" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
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
