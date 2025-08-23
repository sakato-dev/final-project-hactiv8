import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      LoginPage
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
        <Link href="/admin" className="p-2 bg-blue-500 text-white">
          Login Admin
        </Link>
        <Link href="/cashier" className="p-2 bg-blue-500 text-white">
          Login kasir
        </Link>
        <Link href="/customer" className="p-2 bg-blue-500 text-white">
          Login customer
        </Link>
      </div>
    </div>
  );
}
