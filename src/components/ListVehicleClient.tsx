'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle, Plus, Car } from 'lucide-react';

interface ListVehicleClientProps {
  user: {
    userId: string;
    name: string;
    role: string;
    society: string;
  };
}

export default function ListVehicleClient({ user }: ListVehicleClientProps) {
  const isRenterOnly = user.role === 'RENTER';
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    type: 'CAR',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    colorHex: '#3b82f6',
    pricePerHour: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list vehicle.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Blocked View
  if (isRenterOnly) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5 text-zinc-650" />
            <span className="font-bold text-sm text-zinc-700">Back to Dashboard</span>
          </div>
        </header>

        <main className="max-w-md w-full mx-auto px-4 mt-16 flex-grow flex items-center justify-center">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-zinc-950 tracking-tight">Listing Disabled</h2>
              <p className="text-xs text-zinc-500 leading-normal">
                Your account is currently registered as a **Renter / Borrower** only. You do not have permission to list vehicles.
              </p>
            </div>
            <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Go to Profile Settings
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-750 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Listing Form View
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="w-5 h-5 text-zinc-650" />
          <span className="font-bold text-sm text-zinc-700">Back to Dashboard</span>
        </div>
      </header>

      <main className="max-w-xl w-full mx-auto px-4 mt-8 flex-grow">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">List a Vehicle</h1>
            <p className="text-sm text-zinc-400 mt-1">Register a vehicle in the local {user.society} sharing pool.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Vehicle Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike / Scooter</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Brand / Make</label>
                <input 
                  required placeholder="Honda" 
                  value={formData.brand} 
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Model Name</label>
                <input 
                  required placeholder="Civic" 
                  value={formData.model} 
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Manufacture Year</label>
                <input 
                  type="number" required placeholder="2022" 
                  value={formData.year} 
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Price (₹/hr)</label>
                <input 
                  type="number" required placeholder="100" 
                  value={formData.pricePerHour} 
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
                  className="mt-1.5 w-full px-3.5 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Silhouette Color (Hex)</label>
              <div className="flex gap-2.5 mt-1.5">
                <input 
                  type="color" 
                  value={formData.colorHex} 
                  onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
                  className="w-12 h-12 border border-zinc-200 rounded-xl cursor-pointer"
                />
                <input 
                  type="text" 
                  value={formData.colorHex} 
                  onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
                  className="flex-1 px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-450"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Listing Vehicle...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  List Vehicle
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
