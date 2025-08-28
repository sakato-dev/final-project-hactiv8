"use client";
import { useCart } from "@/contexts/CartContext";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import formatRupiah from "@/utils/FormatRupiah";

export default function CashierHome() {
  const { addToCart } = useCart();
  const { userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (userProfile && userProfile.merchantId) {
      const productsCollection = collection(
        db,
        "merchants",
        userProfile.merchantId,
        "products"
      );
      const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);

        // Update kategori secara dinamis
        const uniqueCategories = [
          "All",
          ...new Set(productsList.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userProfile]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart(product);
    Swal.fire({
      title: "Berhasil!",
      text: `${product.title} telah ditambahkan ke keranjang.`,
      icon: "success",
      confirmButtonColor: "#f97316",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Memuat produk...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex gap-3 mt-6 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col"
            >
              <img
                src={product.imgUrl || "https://via.placeholder.com/150"} // Fallback image
                alt={product.title}
                className="w-full h-40 sm:h-48 rounded-xl object-cover"
              />

              <div className="mt-4 space-y-2 flex-1">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-xs text-neutral-500">
                  {product.description}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 font-semibold text-sm">
                    {formatRupiah(product.price)}
                  </span>
                  <span className="text-black text-xs">/pcs</span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs mt-3 py-2 rounded-lg w-full transition"
              >
                Shop
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Belum ada produk untuk kategori ini.
        </p>
      )}
    </div>
  );
}
