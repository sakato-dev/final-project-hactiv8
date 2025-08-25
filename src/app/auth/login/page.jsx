"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tambahkan logika handle login di sini
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5]">
      {/* Sisi Kiri - Informasi Landing Page */}
      <div className="w-1/2 flex flex-col justify-center items-start p-20 relative">
        <div className="absolute top-10 left-20">{/* <PointJuroLogo /> */}</div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Discover the Perfect
          <br />
          Loyalty Program for You
        </h1>
        <p className="text-gray-600 max-w-md">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        {/* Elemen dekoratif gelombang */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
          <svg
            viewBox="0 0 500 150"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-full"
          >
            <path
              d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
              style={{ stroke: "none", fill: "#e2e8f0" }}
            ></path>
          </svg>
        </div>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="w-1/2 flex justify-center items-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md relative">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>

          <div className="text-center mb-8">
            <div className="inline-block mb-4">{/* <PointJuroLogo /> */}</div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Point Juaro
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* <div className="mb-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E293B] text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition duration-300"
            >
              Log In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum Punya Account? register di sini!
          </p>

          <p className="text-center text-sm text-gray-500 mt-6">
            Lupa kata sandi Anda?
          </p>

          <div className="flex items-center justify-center my-6 gap-2">
            <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition duration-300 text-xl">
              <FaGoogle />
            </button>
            <Link
              href="/admin"
              className="p-2 bg-blue-500 text-white rounded-2xl"
            >
              Login Admin
            </Link>
            <Link
              href="/cashier"
              className="p-2 bg-blue-500 text-white rounded-2xl"
            >
              Login kasir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
