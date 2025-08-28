"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatRupiah from "@/utils/FormatRupiah";
import { useAuth } from "@/contexts/auth-context";
import Swal from "sweetalert2";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!userProfile || !userProfile.merchantId) {
      Swal.fire({
        title: "Toko belum dibuat",
        text: "Silakan buat toko terlebih dahulu.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Buat Toko",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/admin");
        }
      });
    }
  }, [userProfile, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (userProfile && userProfile.merchantId) {
        setLoading(true);
        const productsCollection = collection(
          db,
          "merchants",
          userProfile.merchantId,
          "products"
        );
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userProfile]);

  const handleEdit = (id) => {
    router.push(`/admin/products-list/edit/${id}`);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Apakah kamu yakin hapus produk ini?",
      text: "Anda tidak dapat mengembalikan produk ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const productDoc = doc(
            db,
            "merchants",
            userProfile.merchantId,
            "products",
            id
          );
          await deleteDoc(productDoc);
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product.id !== id)
          );
          Swal.fire("Deleted!", "Your product has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting product: ", error);
          alert("Gagal menghapus produk.");
        }
      }
    });
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link
          href="/admin/products-list/new"
          className="p-2 bg-blue-500 text-white rounded-lg"
        >
          Add new product
        </Link>
      </div>
      <div className="overflow-x-auto mt-6 rounded-xl border border-black bg-white dark:bg-gray-800">
        <table className="table-auto w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300 uppercase">
            <tr>
              <th className="px-3 py-2 sm:px-6 sm:py-3">No</th>
              <th className="px-3 py-2 sm:px-6 sm:py-3">Image</th>
              <th className="px-3 py-2 sm:px-6 sm:py-3">Name</th>
              <th className="px-3 py-2 sm:px-6 sm:py-3 hidden sm:table-cell">
                Category
              </th>
              <th className="px-3 py-2 sm:px-6 sm:py-3">Price</th>
              <th className="px-3 py-2 sm:px-6 sm:py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  <div className="space-y-4">
                    <div className="loading loading-spinner loading-xl text-primary mx-auto"></div>
                    <p className="text-lg">Loading</p>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            ) : (
              products.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  <td className="px-3 py-2 border-r sm:px-6 sm:py-3">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 border-r sm:px-6 sm:py-3">
                    <img
                      src={item.imgUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md sm:w-24 sm:h-24"
                    />
                  </td>
                  <td className="px-3 py-2 border-r capitalize sm:px-6 sm:py-3">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 border-r capitalize hidden sm:table-cell sm:px-6 sm:py-3">
                    {item.category}
                  </td>
                  <td className="px-3 py-2 border-r sm:px-6 sm:py-3">
                    {item.price ? formatRupiah(item.price) : "0"}
                  </td>

                  <td className="px-3 py-2 space-x-1 sm:px-6 sm:py-3 sm:space-x-2">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
