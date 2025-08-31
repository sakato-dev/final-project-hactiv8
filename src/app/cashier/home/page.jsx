"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import formatRupiah from "@/utils/FormatRupiah";

import { IoIosSearch } from "react-icons/io";
import {
  FaSortAmountDown,
  FaSortAmountUp,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import Link from "next/link";

export default function CashierHome() {
  const {
    cart = [],
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const { userProfile } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Redirect jika toko belum dibuat
  useEffect(() => {
    if (!loading && userProfile && !userProfile.merchantId) {
      Swal.fire({
        title: "Toko belum dibuat",
        text: "Silakan buat toko terlebih dahulu.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Buat Toko",
      }).then((result) => {
        if (result.isConfirmed) router.push("/admin");
      });
    }
  }, [userProfile, loading, router]);

  // Fetch produk
  useEffect(() => {
    if (userProfile?.merchantId) {
      const productsCollection = collection(
        db,
        "merchants",
        userProfile.merchantId,
        "products"
      );
      const unsubscribe = onSnapshot(
        productsCollection,
        (snapshot) => {
          const productsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(productsList);

          const uniqueCategories = [
            "All",
            ...new Set(productsList.map((p) => p.category).filter(Boolean)),
          ];
          setCategories(uniqueCategories);

          setLoading(false);
        },
        (error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else if (!loading && !userProfile) setLoading(false);
  }, [userProfile, loading]);

  // Filter, search, sort produk
  const processedProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== "All")
      filtered = filtered.filter((p) => p.category === selectedCategory);
    if (searchTerm)
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      title: "Berhasil!",
      text: `${product.name} telah ditambahkan ke keranjang.`,
      icon: "success",
      confirmButtonColor: "#f97316",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600">Memuat data produk...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-white rounded-lg shadow-sm">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoIosSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="border-l border-gray-300 h-6 self-center mx-2"></div>

          <button
            onClick={() => setSortBy("price-asc")}
            className={`p-2.5 rounded-lg transition ${
              sortBy === "price-asc"
                ? "bg-orange-50 text-orange-500 border border-orange-500 shadow"
                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <FaSortAmountUp size={16} />
          </button>

          <button
            onClick={() => setSortBy("price-desc")}
            className={`p-2.5 rounded-lg transition ${
              sortBy === "price-desc"
                ? "bg-orange-50 text-orange-500 border border-orange-500 shadow"
                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <FaSortAmountDown size={16} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {processedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {processedProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 flex flex-col hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-grow">
                  <img
                    src={product.imgUrl || "https://via.placeholder.com/200"}
                    alt={product.name || "Gambar Produk"}
                    className="w-full h-36 rounded-lg object-cover"
                  />
                  <div className="mt-3 space-y-1">
                    <h3 className="text-md font-semibold text-gray-700">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <span className="text-base font-extrabold text-gray-800">
                    {formatRupiah(product.price)}
                  </span>

                  {cartItem ? (
                    <div className="flex items-center bg-orange-500 text-white rounded-lg font-bold">
                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="p-2 hover:bg-orange-600 rounded-l-lg transition-colors"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-2 text-sm">{cartItem.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(product.id)}
                        className="p-2 hover:bg-orange-600 rounded-r-lg transition-colors"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Produk Belum Tersedia</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Info Admin
          </Link>
        </div>
      )}
    </div>
  );
}
