'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid credentials');
      }

      // Refresh and redirect to dashboard
      router.refresh();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans grid-lines">
      {/* Light mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-zinc-950" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
              <path 
                d="M6.5 18V6H12c3.3 0 6 2.7 6 6s-2.7 6-6 6H6.5z" 
                stroke="currentColor" 
                strokeWidth="2.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-950 tracking-tight">
            Driv<span className="text-zinc-700 font-medium">ly</span>
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight font-sans">Admin Portal</h2>
        <p className="mt-2 text-sm text-zinc-655 font-medium">
          Enter password to access the waitlist registrations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-zinc-200 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          {error && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-650">
                Password
              </label>
              <div className="mt-2 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 text-white font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    Authenticating...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
