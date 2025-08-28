"use client";
import React, { createContext, useContext, useState } from "react";
import Swal from "sweetalert2";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [scannedCustomerId, setScannedCustomerId] = useState(null);

  const isDifferentMerchant = (merchantId) => {
    return cartItems.length > 0 && cartItems[0].merchantId !== merchantId;
  };

  const addToCart = (product, merchantId) => {
    const finalMerchantId = merchantId || product.merchantId;
    if (isDifferentMerchant(finalMerchantId)) {
      Swal.fire({
        title: "Toko Berbeda",
        text: "Anda hanya dapat membeli dari satu toko dalam satu waktu. Kosongkan keranjang?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, kosongkan!",
      }).then((result) => {
        if (result.isConfirmed) {
          setCartItems([
            { ...product, quantity: 1, merchantId: finalMerchantId },
          ]);
        }
      });
      return;
    }
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          { ...product, quantity: 1, merchantId: finalMerchantId },
        ];
      }
    });
  };

  // --- FUNGSI BARU UNTUK MENGGANTI ISI KERANJANG ---
  const replaceCart = (newItems) => {
    setCartItems(newItems);
  };

  const updateQuantity = (id, type) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                type === "increase"
                  ? item.quantity + 1
                  : item.quantity > 1
                  ? item.quantity - 1
                  : 1,
            }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const clearCart = () => {
    setCartItems([]);
    setScannedCustomerId(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        replaceCart, // <-- Ekspor fungsi baru
        updateQuantity,
        removeFromCart,
        cartCount,
        clearCart,
        scannedCustomerId,
        setScannedCustomerId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
