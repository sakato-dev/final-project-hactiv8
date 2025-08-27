"use client";

import Link from "next/link";
import React from "react";
import { BiMenu } from "react-icons/bi";
import { BsCart, BsGear, BsMailbox } from "react-icons/bs";
import { HiHome } from "react-icons/hi";
import { IoAdd } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";

export default function Sidebar({ isSideBarOpen, onClick, onClickNav }) {
  return (
    <aside
      className={`
              fixed lg:static h-full lg:h-auto top-0 left-0 z-40
              ${
                isSideBarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full"
              } lg:${isSideBarOpen ? "w-64" : "w-20"} lg:translate-x-0
              bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
              py-6 px-4 transition-all duration-300 ease-in-out
              flex flex-col flex-shrink-0 shadow-md overflow-hidden lg:overflow-visible`}
    >
      {/* toggle sidebar desktop */}
      <button
        onClick={onClick}
        className="self-end p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-6 hidden lg:block"
      >
        <BiMenu className="h-7 w-7 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Navigation Links */}
      <nav className="space-y-4 flex-1">
        {/* Home Link */}
        <Link
          href="/admin"
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/admin"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <MdDashboard className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Dashboard Admin
          </span>
        </Link>

        {/* all Staff*/}
        <Link
          href={"/admin/staff"}
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/admin/staff"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <IoAdd className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Staff
          </span>
        </Link>

        {/* Order List link */}
        <Link
          href={"/admin/products-list"}
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/admin/products-list"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <BsCart className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Products list
          </span>
        </Link>

        {/* contact us message */}
        <Link
          href={"/cashier/home"}
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/seller/message"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <BsMailbox className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Cashier
          </span>
        </Link>

        <Link
          href={"/admin/settings"}
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/admin/settings"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <BsGear className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Settings
          </span>
        </Link>

        {/* Home Page */}
        <button
          onClick={() => {
            navigate("/");
            if (window.innerWidth < 1024) onClickNav();
          }}
          className={`flex items-center gap-4 w-full p-3 rounded-lg
                  transition-colors duration-200
                  ${
                    location.pathname === "/"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
        >
          <HiHome className="h-6 w-6 flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isSideBarOpen ? "opacity-100" : "lg:opacity-0 lg:hidden"
            }`}
          >
            Home Page
          </span>
        </button>
      </nav>
    </aside>
  );
}
