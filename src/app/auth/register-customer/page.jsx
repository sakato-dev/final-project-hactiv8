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
    <div className="flex h-screen bg-[url('/bg-landingpage.png')] bg-cover bg-center relative">
      {/* Sisi Kiri - Informasi Landing Page */}
      <div className="w-1/2 flex flex-col justify-center items-start p-20 relative hidden md:flex">
        <Image
          src="/logo.png"
          width={100}
          height={100}
          alt="PointJuaro"
          className="w-34 drop-shadow-lg mb-8"
        />
        <h1 className="text-5xl font-extrabold text-white mb-16 drop-shadow-xl leading-tight">
          Discover the Perfect
          <br />
          <span className="text-indigo-300">Loyalty Program</span> for You
        </h1>
        <p className="text-lg text-indigo-100 max-w-md">
          Unlock exclusive rewards and seamless transactions with our digital
          membercard platform.
        </p>
      </div>

      {/* Sisi Kanan - Form Register */}
      <div className="w-full md:w-1/2 flex justify-center items-center min-h-screen">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md relative border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <Image
                src="/logo.png"
                width={80}
                height={80}
                alt="PointJuaro"
                className="w-32 drop-shadow-md"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Register as Customer
            </h2>
            <p className="text-indigo-100 text-sm">
              Create your account to get started.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-300 bg-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-indigo-200"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-300 bg-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-indigo-200"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200"
            >
              Register as Customer
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <Link
              href="/auth/login"
              className="text-indigo-200 hover:underline text-sm"
            >
              Sudah punya akun? Login di sini
            </Link>
            <Link
              href="/auth/register-admin"
              className="text-indigo-200 hover:underline text-sm"
            >
              Daftar sebagai Admin
            </Link>
          </div>

          <div className="flex items-center justify-center my-6 gap-2 text-sm text-indigo-100">
            <span className="mr-2">Atau daftar dengan</span>
            <button className="p-2 border border-indigo-300 rounded-full bg-white/10 hover:bg-indigo-100 hover:text-indigo-700 transition duration-200 text-xl">
              <FaGoogle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
