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
    <div className="relative min-h-screen bg-[url('/bg-blue.png')] bg-cover bg-center">
      <div className="absolute top-8 left-8 md:top-10 md:left-20">
        <Image src="/logo.png" width={160} height={100} alt="PointJuaro" />
      </div>

      <div className="container mx-auto flex h-screen items-center px-6">
        <div className="hidden md:flex md:w-1/2 flex-col justify-center pl-20">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Discover the Perfect
            <br />
            Loyalty Program for You
          </h1>
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="bg-black/20 backdrop-blur-lg p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-300 mt-2">
                Please enter your details to sign in.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
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

            <div className="flex items-center my-6">
              <hr className="flex-grow border-white/20" />
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-white/20" />
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition duration-300 text-sm text-white">
              <FaGoogle />
              Login Dengan Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
