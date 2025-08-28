"use client";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/sidebar";
import ProtectedRoute from "@/components/protected-route";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar handleToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 h-auto">
          <Sidebar
            isSideBarOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
