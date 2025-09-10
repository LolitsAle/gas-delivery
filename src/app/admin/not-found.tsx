import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-10/12 text-center">
      <h1 className="text-3xl font-bold mb-4">Admin Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The admin page you’re trying to reach doesn’t exist.
      </p>
      <Link
        href="/admin"
        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
      >
        Back to Admin Dashboard
      </Link>
    </main>
  );
}
