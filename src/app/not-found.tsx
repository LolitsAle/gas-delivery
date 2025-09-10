import Link from 'next/link';
import React from 'react'

// catch all 404 routes
export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </main>
  );
}
