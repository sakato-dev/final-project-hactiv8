"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import formatRupiah from "@/utils/FormatRupiah";
import { useAuth } from "@/contexts/auth-context";
import Swal from "sweetalert2";
import { FiSearch, FiPlus } from "react-icons/fi";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!userProfile || !userProfile.merchantId) {
      Swal.fire({
        title: "Store not created",
        text: "Please create your store first.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#d33",
        confirmButtonText: "Create Store",
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
      title: "Are you sure you want to delete this product?",
      text: "You won’t be able to recover this product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
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
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting product: ", error);
          alert("Failed to delete product.");
        }
      }
    });
  };

  // Filtered products
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Product List</h1>

        {/* Search, Category, Add Product */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side: search & category */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            {/* Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right side: Add product */}
          <Link
            href="/admin/products-list/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-lg"
          >
            <FiPlus />
            <span>Add new product</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-fixed text-md text-left text-gray-500">
          <thead className="text-md text-gray-800 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="w-4/7 px-12 py-3">
                Product
              </th>
              <th scope="col" className="w-1/7 px-4 py-3">
                Category
              </th>
              <th scope="col" className="w-1/7 px-4 py-3">
                Price
              </th>
              <th scope="col" className="w-1/7 px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="loading loading-spinner loading-lg text-orange-500"></div>
                    <span>Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item.id} className="bg-white border-b border-gray-200">
                  {/* Product Column */}
                  <td className="px-6 py-6 font-medium text-gray-900">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imgUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="min-w-0">
                        <div className="font-bold capitalize truncate">
                          {item.name}
                        </div>
                        <div className="text-sm font-normal text-gray-500 line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td
                    className="px-4 py-4 capitalize truncate"
                    title={item.category}
                  >
                    {item.category}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4">
                    {item.price ? formatRupiah(item.price) : "Rp 0"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
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
