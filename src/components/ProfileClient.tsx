'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Building, Shield, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Car } from 'lucide-react';

interface ProfileClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    societyName: string;
    role: string;
  };
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    city: initialUser.city,
    societyName: initialUser.societyName,
    role: initialUser.role,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccessMsg('Profile updated successfully!');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showListVehicleOption = formData.role === 'OWNER' || formData.role === 'BOTH';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/feed')}>
          <ArrowLeft className="w-5 h-5 text-zinc-650" />
          <span className="font-bold text-sm text-zinc-700">Back to Society Feed</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition cursor-pointer border border-zinc-200 bg-white"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Profile Settings</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage credentials, roles, and community registrations.</p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Full Name</label>
              <div className="mt-1.5 relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input 
                  name="name" required placeholder="John Doe" 
                  value={formData.name} onChange={handleChange} 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" 
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Email Address</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input 
                  type="email" name="email" required placeholder="john@example.com" 
                  value={formData.email} onChange={handleChange} 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" 
                />
              </div>
            </div>

            {/* Phone (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Mobile Number (Login Username)</label>
              <div className="mt-1.5 relative bg-zinc-100 border border-zinc-200 rounded-xl cursor-not-allowed">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-450" />
                <input 
                  type="tel" disabled 
                  value={initialUser.phone} 
                  className="w-full pl-11 pr-4 py-3 text-zinc-500 text-sm focus:outline-none bg-transparent cursor-not-allowed" 
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">City</label>
              <div className="mt-1.5 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input 
                  name="city" required placeholder="Mumbai" 
                  value={formData.city} onChange={handleChange} 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" 
                />
              </div>
            </div>

            {/* Gated Society */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Gated Society</label>
              <div className="mt-1.5 relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input 
                  name="societyName" required placeholder="Greenwood Heights Cluster" 
                  value={formData.societyName} onChange={handleChange} 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" 
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Role / Membership</label>
              <div className="mt-1.5 relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
                <select 
                  name="role" value={formData.role} onChange={handleChange} 
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all cursor-pointer"
                >
                  <option value="RENTER">Renter / Borrower (Borrow only)</option>
                  <option value="OWNER">Owner / Lister (List only)</option>
                  <option value="BOTH">Both (List & Borrow)</option>
                </select>
              </div>
              <p className="text-[10px] text-zinc-450 mt-1">
                Changing your role to **Owner** or **Both** instantly unlocks the ability to list your vehicle in the society pool.
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-zinc-100 pt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-grow py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-450"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>

              {showListVehicleOption && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/list-vehicle')}
                  className="py-3.5 px-6 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Car className="w-4 h-4" />
                  List a Vehicle
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
