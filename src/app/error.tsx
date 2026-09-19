'use client';
import { useEffect } from 'react';

// Global error boundary. Never render error.message — for server errors Next replaces it anyway, and for
// client errors it's developer text. The digest lets us find the full error in the server logs. See #019.
export default function GlobalError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-100 p-8">
      <div role="alert" className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-zinc-300">
          We couldn&apos;t load this page. Please try again in a moment.
        </p>
        {error.digest && <p className="text-xs text-zinc-500 mb-4">Reference: {error.digest}</p>}
        <button onClick={() => unstable_retry()} className="mt-2 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-white">
          Try again
        </button>
      </div>
    </div>
  );
}
