"use client";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/contexts/CartContext";
import formatRupiah from "@/utils/FormatRupiah";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";

export default function MerchantProductsPage() {
  const { merchantId } = useParams();
  const { addToCart } = useCart();
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantId) return;

    const merchantRef = doc(db, "merchants", merchantId);
    getDoc(merchantRef).then((docSnap) => {
      if (docSnap.exists()) setMerchant({ id: docSnap.id, ...docSnap.data() });
    });

    const productsRef = collection(db, "merchants", merchantId, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [merchantId]);

  const handleAddToCart = (product) => {
    addToCart(product, merchantId);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${product.name} ditambahkan`,
      showConfirmButton: false,
      timer: 1500,
      background: "#333",
      color: "#fff",
    });
  };

  if (loading) {
    return <p className="text-center p-10">Memuat produk...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">{merchant?.name}</h1>
      <p className="text-gray-400 mb-6">Pilih produk yang ingin Anda beli</p>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-lg p-3 flex flex-col"
          >
            <img
              src={product.imgUrl || "https://via.placeholder.com/150"}
              alt={product.name}
              className="w-full h-32 rounded-md object-cover"
            />
            <h3 className="font-semibold mt-2">{product.name}</h3>
            <p className="text-sm text-gray-300 flex-grow">
              {formatRupiah(product.price)}
            </p>
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-blue-600 text-white mt-3 py-2 rounded-lg text-sm"
            >
              + Keranjang
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
