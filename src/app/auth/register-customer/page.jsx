"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import Image from "next/image";

export default function RegisterAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "customer",
        uid: user.uid,
      });

      router.push("/admin");
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[url('/bg-landingpage.png')]">
      {/* Sisi Kiri - Informasi Landing Page */}
      <div className="absolute top-10 left-20">
        <Image src="/logo.png" width={100} height={100} alt="PointJuaro" />
      </div>
      <div className="w-1/2 flex-col justify-center items-start p-20 relative hidden md:flex">
        <h1 className="text-5xl font-bold text-white mb-20">
          Discover the Perfect
          <br />
          Loyalty Program for You
        </h1>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="bg-[url('/bg-blue.png')] p-10 rounded-2xl shadow-lg w-full max-w-md relative">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Image
                src="/logo.png"
                width={100}
                height={100}
                alt="PointJuaro"
              />
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6  text-white">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E293B] text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition duration-300"
            >
              Register as Customer
            </button>
          </form>

          <p className="text-center text-sm text-white mt-6">
            <Link href="/auth/login" className="p-2 text-white">
              Sudah Punya Account? Login di sini!
            </Link>
          </p>

          <p className="text-center text-sm text-white mt-6">
            <Link href="/auth/register-admin" className="p-2 text-white">
              Daftar sebagai Admin? Register di sini!
            </Link>
          </p>

          <div className="flex items-center justify-center my-6 gap-2 text-sm text-white">
            {" "}
            Login Dengan
            <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition duration-300 text-xl">
              <FaGoogle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
