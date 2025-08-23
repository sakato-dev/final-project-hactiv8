import Link from "next/link";

export default function RegisterCustomer() {
  return (
    <div>
      RegisterCustomer
      <Link href="/auth/login" className="p-2 bg-blue-500 text-white">
        login
      </Link>
      <Link href="/auth/register" className="p-2 bg-blue-500 text-white">
        Home Admin
      </Link>
      <Link href="/auth/register" className="p-2 bg-blue-500 text-white">
        Home kasir
      </Link>
      <Link href="/auth/register" className="p-2 bg-blue-500 text-white">
        Home customer
      </Link>
    </div>
  );
}
