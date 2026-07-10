'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Phone, User, Building, MapPin, Loader2, AlertCircle, ShieldCheck, Check } from 'lucide-react';

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    societyName: '',
    role: 'RENTER',
    password: '',
  });
  
  const [preVerifyDl, setPreVerifyDl] = useState(false);
  const [dlFileName, setDlFileName] = useState<string | null>(null);
  const [dlUploading, setDlUploading] = useState(false);
  const [dlUploadProgress, setDlUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prepopulate society name if passed in query parameters
  useEffect(() => {
    const societyParam = searchParams.get('society');
    if (societyParam) {
      setFormData(prev => ({ ...prev, societyName: societyParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDlUploading(true);
      setDlUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setDlUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setDlUploading(false);
          setDlFileName(file.name);
        }
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { phone: formData.phone, password: formData.password }
      : { 
          ...formData, 
          preVerifyDl, 
          dlFileName: preVerifyDl ? dlFileName : null 
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (isLogin) {
        router.refresh();
        router.push('/feed');
      } else {
        // Automatically switch to login tab with phone filled
        setIsLogin(true);
        setError(null);
        alert('Account created successfully! Please sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (phone: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, society: 'Greenwood Heights' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed.');
      }

      router.refresh();
      router.push('/feed');
    } catch (err: any) {
      setError(err.message || 'An error occurred during demo login.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans grid-lines">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-4 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-zinc-950" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 18V6H12c3.3 0 6 2.7 6 6s-2.7 6-6 6H6.5z" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-955 tracking-tight">Driv<span className="text-zinc-700 font-medium">ly</span></span>
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-955 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Gated Profile'}</h2>
        <p className="mt-2 text-sm text-zinc-650 font-medium">
          {isLogin ? 'Access your community vehicle sharing feed' : 'Register securely within your society'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-zinc-200 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-100 pb-4 mb-6 gap-4">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 cursor-pointer transition-all ${isLogin ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 cursor-pointer transition-all ${!isLogin ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {!isLogin && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Full Name</label>
                  <div className="mt-1.5 relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Email Address</label>
                  <div className="mt-1.5 relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input type="email" name="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
                  </div>
                </div>
              </>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Mobile Number</label>
              <div className="mt-1.5 relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input type="tel" name="phone" required placeholder="9876543210" value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
              </div>
            </div>

            {!isLogin && (
              <>
                {/* City */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">City</label>
                  <div className="mt-1.5 relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input name="city" required placeholder="Mumbai" value={formData.city} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
                  </div>
                </div>

                {/* Society Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Society Name</label>
                  <div className="mt-1.5 relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input name="societyName" required placeholder="Greenwood Heights, Phase 1" value={formData.societyName} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
                  </div>
                </div>

                {/* Role Choice */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Join as:</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="mt-1.5 w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all">
                    <option value="RENTER">Renter (Borrow Vehicles)</option>
                    <option value="OWNER">Owner (List Vehicles)</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* Driver's License verification */}
                <div className="border-t border-zinc-100 pt-4 mt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={preVerifyDl} onChange={(e) => setPreVerifyDl(e.target.checked)} className="mt-1 w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900">Pre-verify my Driving License (DL)</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Accelerates booking clearance by resident managers.</p>
                    </div>
                  </label>

                  {preVerifyDl && (
                    <div className="mt-3 border border-dashed border-zinc-200 bg-zinc-50/50 rounded-xl p-4 text-center">
                      {dlUploading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                            <span>Uploading document...</span>
                            <span>{dlUploadProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${dlUploadProgress}%` }} />
                          </div>
                        </div>
                      ) : dlFileName ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-xs font-medium border border-emerald-100">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          <span>{dlFileName} (Uploaded)</span>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-2">
                          <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={handleFileMockUpload} />
                          <span className="text-xs font-bold text-zinc-700 hover:text-zinc-900">Upload Front of DL</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">Password</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm transition-all" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please Wait...
                </>
              ) : (
                isLogin ? 'Enter Platform' : 'Create Account'
              )}
            </button>
          </form>

          {/* Visual Divider & Demo Buttons */}
          {isLogin && (
            <div className="mt-6 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  or try the demo
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('5550001111')}
                  className="py-3 px-4 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  Demo as Renter
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('5550002222')}
                  className="py-3 px-4 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  Demo as Owner
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-950" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
