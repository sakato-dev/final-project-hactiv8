"use client";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import React from "react";
import { MdMenu } from "react-icons/md";

export default function Navbar({ handleToggleSidebar }) {
  const handleLogout = () => auth.signOut();
  return (
    <nav className="flex justify-between px-6 bg-gray-100">
      <div className="flex gap-4">
        <Image
          src={"/logoblack.png"}
          width={100}
          height={100}
          alt="logo"
          className="w-52 object-contain"
        />
        <button onClick={handleToggleSidebar} className="lg:hidden">
          <MdMenu />
        </button>
      </div>
      <button
        onClick={handleLogout}
        className="border px-4 py-2 my-4 rounded-md text-sm font-medium hover:bg-gray-100"
      >
        Logout
      </button>
    </nav>
  );
}
