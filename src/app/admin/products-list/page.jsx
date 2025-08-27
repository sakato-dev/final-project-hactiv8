"use client";
import React, { useState } from "react";

export default function page() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
              <th className="px-3 py-2 sm:px-6 sm:py-3">Stock</th>
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
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 dark:text-gray-400"
                >
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item, index) => (
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
                  <td className="px-3 py-2 border-r sm:px-6 sm:py-3">
                    {item.stock ? formatAngka(item.stock) : "0"}
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
