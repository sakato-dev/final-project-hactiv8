import Link from "next/link";

export default function Home() {
  return (
    <div>
      Landing Page
      <div className="flex gap-4">
        <Link href="/auth/login" className="p-2 bg-blue-500 text-white">
          Login
        </Link>
        <Link
          href="/auth/register-admin"
          className="p-2 bg-blue-500 text-white"
        >
          register admin
        </Link>
        <Link
          href="/auth/register-customer"
          className="p-2 bg-blue-500 text-white"
        >
          register customer
        </Link>
      </div>
    </div>
  );
}
