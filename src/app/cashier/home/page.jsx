"use client";
import { useCart } from "@/contexts/CartContext";
import React, { useState } from "react";
import Swal from "sweetalert2";

const products = [
  {
    id: 1,
    title: "Cappuccino",
    description: "Hot Coffee",
    category: "Coffee",
    price: 10000,
    img: "https://i.pinimg.com/736x/36/79/38/367938f9213ae2fc3cd4ec3b3f6e8199.jpg",
  },
  {
    id: 2,
    title: "Latte",
    description: "Hot Coffee",
    category: "Coffee",
    price: 12000,
    img: "https://i.pinimg.com/1200x/f1/4e/70/f14e7007806beed9f34ff9cf733e5e52.jpg",
  },
  {
    id: 3,
    title: "Americano",
    description: "Hot Coffee",
    category: "Coffee",
    price: 25000,
    img: "https://i.pinimg.com/736x/08/2b/b0/082bb0e85e516e50a055fb5fc6a9ede6.jpg",
  },
  {
    id: 4,
    title: "Chocolate Mocha",
    description: "Hot Coffee",
    category: "Coffee",
    price: 20000,
    img: "https://i.pinimg.com/1200x/a0/92/c1/a092c117b6195e6f96ce1906f0dc1888.jpg",
  },
  {
    id: 5,
    title: "Red Velvet Cake",
    description: "Sweety",
    category: "Cake",
    price: 20000,
    img: "https://i.pinimg.com/1200x/ad/9d/17/ad9d179d29a1c33978878e544f5f9b1f.jpg",
  },
  {
    id: 6,
    title: "Peanut Cheese",
    description: "Mini",
    category: "Cake",
    price: 20000,
    img: "https://i.pinimg.com/736x/d8/a6/ed/d8a6ed154ed3484e1373e46f58a45f8e.jpg",
  },
];

function Page() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

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

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex gap-3 mt-6 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col"
          >
            <img
              src={product.img}
              alt={product.title}
              className="w-full h-48 rounded-xl object-cover"
            />

            <div className="mt-4 space-y-2 flex-1">
              <h3 className="text-sm font-medium">{product.title}</h3>
              <p className="text-xs text-neutral-500">{product.description}</p>
              <div className="flex items-center gap-1">
                <span className="text-orange-500 font-semibold text-sm">
                  Rp {product.price.toLocaleString()}
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
    </div>
  );
}

export default Page;
