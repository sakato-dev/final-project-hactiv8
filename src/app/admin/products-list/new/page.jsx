"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import Swal from "sweetalert2";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    imgUrl: "",
  });
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation check
    if (
      !product.name.trim() ||
      !product.category.trim() ||
      !product.price ||
      !product.description.trim() ||
      !product.imgUrl.trim()
    ) {
      Swal.fire(
        "Error",
        "All fields must be filled in before saving.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      if (userProfile && userProfile.merchantId) {
        const merchantProductsCollection = collection(
          db,
          "merchants",
          userProfile.merchantId,
          "products"
        );
        await addDoc(merchantProductsCollection, {
          ...product,
          price: Number(product.price),
        });
        Swal.fire("Success", "Product successfully added!", "success");
        router.push("/admin/products-list");
      } else {
        throw new Error("Merchant ID not found.");
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      Swal.fire("Error", "Failed to add product.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[1116px] mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FaArrowLeft
          onClick={() => router.back()}
          className="cursor-pointer text-gray-800 dark:text-white"
        />
        <h1 className="text-2xl font-bold text-teal-950">Add New Product</h1>
      </div>

      {/* Layout 2 columns */}
      <form onSubmit={handleSubmit} className="inline-flex gap-4 w-full">
        {/* Left: Basic Details */}
        <div className="w-[611px] bg-white rounded-lg shadow p-6 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-zinc-800">Product Details</h2>

          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-teal-950">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Wireless Headphone"
              value={product.name}
              onChange={handleChange}
              className="h-12 px-3 py-2 bg-neutral-50 rounded-lg border border-gray-200"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-teal-950">
              Product Description
            </label>
            <textarea
              rows={4}
              name="description"
              placeholder="Product description..."
              value={product.description}
              onChange={handleChange}
              className="p-3 bg-neutral-50 rounded-lg border border-gray-200"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-teal-950">
              Product Price
            </label>
            <input
              type="number"
              name="price"
              placeholder="e.g. 150000"
              value={product.price}
              onChange={handleChange}
              className="h-12 px-3 py-2 bg-neutral-50 rounded-lg border border-gray-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Right: Upload Image & Category */}
        <div className="w-[485px] bg-white rounded-lg shadow p-6 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-zinc-800">
            Upload Product Image
          </h2>

          {/* Upload / Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-teal-950">
              Product Image
            </label>
            <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg relative overflow-hidden">
              {product.imgUrl ? (
                <img
                  src={product.imgUrl}
                  alt="Preview"
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 text-sm italic">
                  <FaCloudUploadAlt size={32} />
                  Upload Image
                  {/* Note */}
                  <p className="text-sm text-gray-400 mt-1">
                    Choose a file or drag & drop it here (jpg, png, max 1MB)
                  </p>
                </div>
              )}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-black/5 flex items-center justify-center">
                <FileUploaderRegular
                  pubkey="33563ee22dfa473493de"
                  onFileUploadSuccess={(res) =>
                    setProduct({ ...product, imgUrl: res.cdnUrl })
                  }
                />
              </div>
            </div>

            {/* Manual URL input */}
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              name="imgUrl"
              value={product.imgUrl}
              onChange={handleChange}
              className="mt-3 px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-teal-950">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Electronics"
              value={product.category}
              onChange={handleChange}
              className="h-12 px-3 py-2 bg-neutral-50 rounded-lg border border-gray-200"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
