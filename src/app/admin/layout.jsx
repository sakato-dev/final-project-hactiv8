"use client";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/sidebar";
import ProtectedRoute from "@/components/protected-route";
import { useState, createContext, useContext } from "react";

// 1. Buat dan ekspor context agar bisa digunakan oleh halaman anak
export const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 2. State untuk mengontrol modal ada di sini, di level layout
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setIsModalOpen(false);
  };

  return (
    <ProtectedRoute>
      <ModalContext.Provider value={{ openModal, closeModal }}>
        <div className="min-h-screen bg-gray-50">
          <Navbar
            handleToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="flex flex-1 h-auto">
            <Sidebar
              isSideBarOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main className="flex-1">{children}</main>
          </div>

          {/* 3. Render modal di sini agar berada di atas semua elemen lain */}
          {isModalOpen && modalContent}
        </div>
      </ModalContext.Provider>
    </ProtectedRoute>
  );
}
