"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); // Arahkan ke halaman admin setelah login berhasil
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <div className="flex gap-4">
        <Link
          href="/auth/register-admin"
          className="p-2 bg-blue-500 text-white"
        >
          Register Admin
        </Link>
        <Link
          href="/auth/register-customer"
          className="p-2 bg-blue-500 text-white"
        >
          Register customer
        </Link>
      </div>
    </div>
  );
}
