'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waitlistSchema, type WaitlistInput } from '@/lib/validations';
import { 
  User, Mail, Phone, MapPin, Building, Car, 
  Tag, Calendar, CircleDollarSign, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, Check
} from 'lucide-react';

const SOCIETY_CLUSTERS = [
  { name: "Greenwood Heights Cluster", details: "Phase 1 & 2 • 12 active listings", x: 120, y: 70, id: "greenwood", count: 12, dist: "0.4 km" },
  { name: "Green Park Cooperative Cluster", details: "Green Park Court • 8 active listings", x: 260, y: 110, id: "greenpark", count: 8, dist: "0.8 km" },
  { name: "Orchid Petals Cluster", details: "Orchid Enclave • 15 active listings", x: 180, y: 150, id: "orchid", count: 15, dist: "1.2 km" },
  { name: "Palm Meadows Cluster", details: "Palm Greens • 6 active listings", x: 340, y: 60, id: "palm", count: 6, dist: "1.6 km" }
];

export default function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeClusterIndex, setActiveClusterIndex] = useState<number | null>(null);
  const [preVerifyDl, setPreVerifyDl] = useState(false);
  const [dlFileName, setDlFileName] = useState<string | null>(null);
  const [dlUploading, setDlUploading] = useState(false);
  const [dlUploadProgress, setDlUploadProgress] = useState(0);

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
      }, 150);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      societyName: '',
      role: 'RENTER',
      vehicleType: null,
      brand: '',
      model: '',
      year: undefined,
      expectedRentalPrice: undefined,
    },
  });

  const selectedRole = watch('role');
  const showOwnerFields = selectedRole === 'OWNER' || selectedRole === 'BOTH';

  // Format phone number dynamically: XXXXX XXXXX
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,5})$/);
    if (match) {
      const part1 = match[1];
      const part2 = match[2];
      if (part2) {
        return `${part1} ${part2}`;
      }
      return part1;
    }
    return cleaned;
  };

  const { onChange: phoneOnChange, ...phoneRegister } = register('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
    phoneOnChange(e);
  };

  const onSubmit = async (data: WaitlistInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          preVerifyDl,
          dlFileName
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit form. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-zinc-200 rounded-3xl shadow-xl animate-fade-in max-w-xl mx-auto">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl animate-ping scale-75" />
          <CheckCircle2 className="w-8 h-8 text-emerald-600 relative z-10" />
        </div>
        
        <h3 className="text-2xl font-black tracking-tight text-zinc-950 mb-2">
          Registration Complete!
        </h3>
        
        <p className="text-sm text-zinc-650 mb-8 max-w-sm leading-relaxed font-medium">
          Thank you for joining. We have successfully registered your interest in Drivly. We will verify your gated community profile and get in touch with you shortly to set up private vehicle sharing.
        </p>

        <button
          onClick={() => setIsSuccess(false)}
          className="w-full sm:w-auto px-8 py-3.5 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-md"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div id="waitlist-form" className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
      <h3 className="text-xl font-bold text-zinc-950 mb-2 text-center sm:text-left">Join the Waitlist</h3>
      <p className="text-zinc-650 mb-8 text-xs sm:text-sm text-center sm:text-left leading-relaxed">
        Be among the first to experience shared community mobility. Enter your details below.
      </p>

      {submitError && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                  errors.name ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                  errors.email ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                  errors.phone ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                {...phoneRegister}
                onChange={handlePhoneChange}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                id="city"
                type="text"
                placeholder="Mumbai"
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                  errors.city ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                {...register('city')}
              />
            </div>
            {errors.city && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.city.message}</span>
              </p>
            )}
          </div>

          {/* Society Name and Cluster Map */}
          <div className="space-y-3 sm:col-span-2">
            <label htmlFor="societyName" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Society / Community Name
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input & Autocomplete Suggestions */}
              <div className="relative space-y-2">
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    id="societyName"
                    type="text"
                    placeholder="Greenwood Heights, Phase 1"
                    className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                      errors.societyName ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                    } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                    {...register('societyName')}
                    onFocus={() => setShowMap(true)}
                  />
                </div>
                {errors.societyName && (
                  <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.societyName.message}</span>
                  </p>
                )}

                {/* Autocomplete Suggestions Dropdown */}
                {showMap && (
                  <div className="absolute z-20 w-full bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-2.5 space-y-1 mt-1">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 pb-1.5 border-b border-zinc-100 select-none">
                      Active Neighbors Nearby
                    </span>
                    {SOCIETY_CLUSTERS.map((cluster, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setValue('societyName', cluster.name);
                          setActiveClusterIndex(idx);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex justify-between items-center transition-all duration-250 cursor-pointer ${
                          activeClusterIndex === idx
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="block">{cluster.name}</span>
                          <span className={`text-[9px] font-normal block ${
                            activeClusterIndex === idx ? 'text-white/60' : 'text-zinc-400'
                          }`}>{cluster.details}</span>
                        </div>
                        <span className={`text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          activeClusterIndex === idx ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {cluster.count} listings
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Localized Cluster map (SVG) */}
              <div className="relative bg-zinc-50 border border-zinc-200/60 rounded-2xl p-3 h-44 overflow-hidden flex flex-col justify-between">
                {/* SVG map visual */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 450 180" preserveAspectRatio="none" aria-hidden="true" role="img">
                  {/* Grid overlay */}
                  <path d="M 0,45 L 450,45 M 0,90 L 450,90 M 0,135 L 450,135" stroke="rgba(9,9,11,0.015)" strokeWidth="1" />
                  <path d="M 112,0 L 112,180 M 225,0 L 225,180 M 337,0 L 337,180" stroke="rgba(9,9,11,0.015)" strokeWidth="1" />
                  
                  {/* User Pin / Central reference point */}
                  <circle cx="225" cy="90" r="5" fill="#ef4444" className="animate-pulse" />
                  <circle cx="225" cy="90" r="10" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                  
                  {/* Gated clusters bubbles */}
                  {SOCIETY_CLUSTERS.map((cluster, idx) => {
                    const isSelected = activeClusterIndex === idx;
                    return (
                      <g 
                        key={idx} 
                        className="cursor-pointer group/pin"
                        onClick={() => {
                          setValue('societyName', cluster.name);
                          setActiveClusterIndex(idx);
                        }}
                      >
                        {/* Connecting line to center */}
                        <line 
                          x1="225" 
                          y1="90" 
                          x2={cluster.x} 
                          y2={cluster.y} 
                          stroke={isSelected ? "#10b981" : "rgba(9,9,11,0.15)"} 
                          strokeWidth={isSelected ? 1.5 : 1}
                          strokeDasharray="4 4"
                          className="transition-all duration-300"
                        />
                        
                        {/* Gated cluster node */}
                        <circle 
                          cx={cluster.x} 
                          cy={cluster.y} 
                          r={isSelected ? 14 : 10} 
                          fill={isSelected ? "#10b981" : "white"} 
                          stroke={isSelected ? "#34d399" : "#e4e4e7"} 
                          strokeWidth="1.5"
                          className="transition-all duration-300 shadow-sm" 
                        />
                        <text 
                          x={cluster.x} 
                          y={cluster.y + 3} 
                          textAnchor="middle" 
                          fontSize="7.5" 
                          fontWeight="bold" 
                          fill={isSelected ? "white" : "#71717a"}
                          className="transition-colors duration-300 font-mono"
                        >
                          {cluster.count}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Labels */}
                <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded border border-zinc-150 select-none">
                  <MapPin className="w-2.5 h-2.5 text-zinc-450" />
                  Neighborhood Clusters
                </div>

                {activeClusterIndex !== null ? (
                  <div className="absolute bottom-2 left-3 right-3 bg-zinc-950 text-white p-2 rounded-xl text-[8.5px] leading-tight text-left shadow-md flex items-center justify-between select-none">
                    <span>
                      <strong>{SOCIETY_CLUSTERS[activeClusterIndex].name}</strong> • {SOCIETY_CLUSTERS[activeClusterIndex].dist} away
                    </span>
                    <span className="text-[7.5px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black">
                      ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="absolute bottom-2 left-3 right-3 bg-white/95 border border-zinc-200 text-zinc-550 p-2 rounded-xl text-[8.5px] leading-tight text-left shadow-sm select-none">
                    👈 Select a suggestion or click a pin to auto-fill.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role Choice */}
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              I want to join as a:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'RENTER', label: 'Renter' },
                { value: 'OWNER', label: 'Owner' },
                { value: 'BOTH', label: 'Both' },
              ].map((roleOption) => (
                <label
                  key={roleOption.value}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-zinc-950/20 focus-within:border-zinc-950 ${
                    selectedRole === roleOption.value
                      ? 'bg-zinc-900 border-zinc-900 text-white font-medium shadow-sm'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={roleOption.value}
                    className="sr-only"
                    {...register('role')}
                  />
                  <span className="text-sm">{roleOption.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Owner Fields (Accordion Reveal) */}
        <div
          className={`grid-rows-transition ${
            showOwnerFields ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-zinc-200 pt-6 mt-6 space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <Car className="w-4.5 h-4.5 text-zinc-650" /> Vehicle Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-1">
                {/* Vehicle Type */}
                <div className="space-y-2">
                  <label htmlFor="vehicleType" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Vehicle Type
                  </label>
                  <select
                    id="vehicleType"
                    className={`w-full px-4 py-3 bg-zinc-50 border ${
                      errors.vehicleType ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                    } rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                    {...register('vehicleType')}
                  >
                    <option value="" className="bg-white">Select Type</option>
                    <option value="CAR" className="bg-white">Car</option>
                    <option value="BIKE" className="bg-white">Bike / Scooter</option>
                    <option value="OTHER" className="bg-white">Other</option>
                  </select>
                  {errors.vehicleType && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.vehicleType.message}</span>
                    </p>
                  )}
                </div>

                {/* Vehicle Brand */}
                <div className="space-y-2">
                  <label htmlFor="brand" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Brand / Make
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      id="brand"
                      type="text"
                      placeholder="Honda, Tesla, Hyundai"
                      className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                        errors.brand ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                      } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                      {...register('brand')}
                    />
                  </div>
                  {errors.brand && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.brand.message}</span>
                    </p>
                  )}
                </div>

                {/* Vehicle Model */}
                <div className="space-y-2">
                  <label htmlFor="model" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Model
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      id="model"
                      type="text"
                      placeholder="Civic, Model 3, Creta"
                      className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                        errors.model ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                      } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                      {...register('model')}
                    />
                  </div>
                  {errors.model && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.model.message}</span>
                    </p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label htmlFor="year" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Year of Manufacture
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      id="year"
                      type="number"
                      placeholder="2022"
                      className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                        errors.year ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                      } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                      {...register('year')}
                    />
                  </div>
                  {errors.year && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.year.message}</span>
                    </p>
                  )}
                </div>

                {/* Expected Rental Price */}
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="expectedRentalPrice" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    Expected Monthly Rental Income (₹ / month)
                  </label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      id="expectedRentalPrice"
                      type="number"
                      placeholder="5000"
                      className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${
                        errors.expectedRentalPrice ? 'border-amber-400' : 'border-zinc-200 focus:bg-white'
                      } rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200`}
                      {...register('expectedRentalPrice')}
                    />
                  </div>
                  {errors.expectedRentalPrice && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.expectedRentalPrice.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Pre-verification Block (Optional, reinforcing selling point) */}
        <div className="border-t border-zinc-200 pt-6 mt-6 space-y-4 text-left">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            Gated Trust Pre-verification (Optional)
          </h4>
          
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4.5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={preVerifyDl}
                onChange={(e) => {
                  setPreVerifyDl(e.target.checked);
                  if (!e.target.checked) {
                    setDlFileName(null);
                    setDlUploadProgress(0);
                    setDlUploading(false);
                  }
                }}
                className="mt-1 w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900 focus:ring-offset-0 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950 transition-colors">
                  Pre-verify my Driving License (DL) for instant booking access on launch
                </span>
                <p className="text-[10.5px] text-zinc-500 leading-normal">
                  Skip the verification queue. Your document is processed securely using end-to-end encrypted resident credentials.
                </p>
              </div>
            </label>

            {/* Simulated file uploader */}
            {preVerifyDl && (
              <div className="border-2 border-dashed border-zinc-200 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 transition-all duration-300">
                {dlUploading ? (
                  /* Loading Progress UI */
                  <div className="w-full max-w-xs space-y-3 py-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      <span>Uploading document...</span>
                      <span className="font-mono text-zinc-800">{dlUploadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${dlUploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-450 block">Processing gated trust credentials...</span>
                  </div>
                ) : dlFileName ? (
                  /* Success/Uploaded UI */
                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-200/85 px-4 py-3 rounded-xl w-full text-left animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        DL PRE-VERIFIED & UPLOADED
                      </span>
                      <span className="text-[10.5px] text-emerald-700 font-medium block">
                        {dlFileName} (Processed successfully)
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Standard Drag-and-drop / selector UI */
                  <label className="cursor-pointer w-full flex flex-col items-center justify-center py-2.5">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="sr-only" 
                      onChange={handleFileMockUpload}
                    />
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-550 flex items-center justify-center shadow-sm mb-2.5">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-zinc-800 hover:text-zinc-950 transition-colors block">
                      Click to upload front of Driving License
                    </span>
                    <span className="text-[9.5px] text-zinc-400 mt-1 block">
                      PDF, JPEG, or PNG up to 5MB
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 py-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              Securing Your Spot...
            </>
          ) : (
            'Join the Waitlist'
          )}
        </button>
      </form>
    </div>
  );
}
