"use client";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import Swal from "sweetalert2";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

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
  const { id } = useParams();
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (id && userProfile && userProfile.merchantId) {
        const docRef = doc(
          db,
          "merchants",
          userProfile.merchantId,
          "products",
          id
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    };
    fetchProduct();
  }, [id, userProfile]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(
        db,
        "merchants",
        userProfile.merchantId,
        "products",
        id
      );
      await updateDoc(docRef, {
        ...product,
        price: Number(product.price),
      });
      Swal.fire("Produk berhasil diperbarui!");
      router.push("/admin/products-list");
    } catch (error) {
      console.error("Error updating product: ", error);
      alert("Gagal memperbarui produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            onClick={() => router.back()}
            className="cursor-pointer text-gray-800 dark:text-white"
          />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Edit Product
          </h1>
        </div>

        <form className="space-y-4 text-black" onSubmit={handleSubmit}>
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Produk
            </label>
            <input
              type="text"
              placeholder="Contoh: Headphone Wireless"
              className="mt-1 w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deskripsi
            </label>
            <textarea
              rows={4}
              placeholder="Deskripsi produk..."
              className="mt-1 w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              value={product.description}
              onChange={handleChange}
              name="description"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategori
            </label>
            <input
              type="text"
              placeholder="Contoh: Elektronik"
              className="mt-1 w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              name="category"
              value={product.category}
              onChange={handleChange}
            />
          </div>

          {/* Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Harga (Rp)
              </label>
              <input
                type="number"
                className="mt-1 w-full px-4 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder="contoh: 150000"
                value={product.price}
                onChange={handleChange}
                name="price"
              />
            </div>
          </div>

          {/* Upload Gambar / Input URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gambar Produk
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Masukkan URL manual atau upload file. Upload otomatis mengisi URL.
            </p>

            {/* Input URL Manual */}
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 mb-3 border rounded-md text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
              name="imgUrl"
              value={product.imgUrl}
              onChange={handleChange}
            />

            {/* File Uploader */}
            <div className="flex-1 h-52 bg-neutral-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative cursor-pointer overflow-hidden">
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
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/5 transition">
                <FileUploaderRegular
                  pubkey="33563ee22dfa473493de"
                  onFileUploadSuccess={(result) => {
                    console.log("Upload success:", result);
                    setProduct({ ...product, imgUrl: result.cdnUrl });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => router.back()}
              type="button"
              className="px-4 py-2 rounded-md border text-sm dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
