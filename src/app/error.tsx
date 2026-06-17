'use client';
import { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple global error UI – catches any unhandled error in the app.
const GlobalError: NextPage<{ error?: Error }> = ({ error }) => {
  const router = useRouter();

  // If we want to auto‑redirect after a few seconds, uncomment:
  // useEffect(() => {
  //   const timer = setTimeout(() => router.refresh(), 5000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100 p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-zinc-300">
          An unexpected error occurred. Please try again later or contact support.
        </p>
        {error && (
          <pre className="text-xs bg-zinc-800 p-4 rounded overflow-x-auto text-left whitespace-pre-wrap">
            {error.message}
          </pre>
        )}
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default GlobalError;
