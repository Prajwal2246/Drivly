'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waitlistSchema, type WaitlistInput } from '@/lib/validations';
import { 
  User, Mail, Phone, MapPin, Building, Car, 
  Tag, Calendar, CircleDollarSign, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredSociety, setRegisteredSociety] = useState('');
  const [shareUrl, setShareUrl] = useState('');

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
      // Capture society name before reset
      setRegisteredSociety(data.societyName);

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

  useEffect(() => {
    if (isSuccess && typeof window !== 'undefined') {
      const shareText = `Hey! I just joined the waitlist for Drivly at ${registeredSociety || 'our society'} so we can share cars and bikes privately with verified neighbors. We need 6 more signups to unlock it for our building! Join here: ${window.location.origin}`;
      setShareUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`);
    }
  }, [isSuccess, registeredSociety]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-zinc-200 rounded-3xl shadow-xl animate-fade-in max-w-xl mx-auto">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl animate-ping scale-75" />
          <CheckCircle2 className="w-8 h-8 text-emerald-600 relative z-10" />
        </div>
        
        <h3 className="text-2xl font-black tracking-tight text-zinc-950 mb-2">
          You're Resident #4!
        </h3>
        
        <p className="text-sm text-zinc-600 mb-6 font-medium">
          At <span className="text-zinc-950 font-bold">{registeredSociety}</span>
        </p>

        {/* Progress Box */}
        <div className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2.5">
            <span>Society Milestone</span>
            <span className="text-emerald-700 font-mono">40% Complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 w-[40%]" />
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-600">
            <span>4 verified signups</span>
            <span className="font-semibold text-zinc-700">10 needed to unlock</span>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200/60 text-xs text-zinc-600 leading-relaxed font-medium">
            🚀 We need <strong>6 more verified signups</strong> from your building to unlock private vehicle sharing in your society.
          </div>
        </div>

        {/* WhatsApp Share Button */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-[#25D366]/10 hover:shadow-[#25D366]/20 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true" role="img">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.637-1.03-5.115-2.905-6.99C16.559 1.882 14.084 1.85 11.45 1.85c-5.437 0-9.862 4.42-9.866 9.86-.001 1.839.486 3.635 1.412 5.247l-.992 3.621 3.71-.973zm11.233-7.533c-.3-.149-1.771-.875-2.028-.969-.258-.094-.446-.14-.633.14-.188.281-.727.915-.89 1.102-.163.186-.326.21-.626.06-1.045-.521-1.772-1.054-2.476-2.27-.188-.324-.05-.501.1-.65l.448-.522c.15-.176.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.633-1.523-.867-2.085-.228-.547-.479-.472-.633-.479-.15-.008-.325-.008-.5-.008-.175 0-.46.066-.7.327-.24.263-.915.893-.915 2.178 0 1.285.935 2.529 1.065 2.7.13.172 1.842 2.812 4.462 3.94 2.62 1.127 2.62.752 3.1.702.48-.05 1.548-.633 1.77-1.246.22-.613.22-1.139.15-1.246-.07-.107-.25-.175-.55-.325z" />
          </svg>
          <span>Invite Gated Neighbors</span>
        </a>

        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-xs font-semibold text-zinc-650 hover:text-zinc-800 underline transition-colors cursor-pointer"
        >
          Register another vehicle
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

          {/* Society Name */}
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="societyName" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Society / Community Name
            </label>
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
              />
            </div>
            {errors.societyName && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.societyName.message}</span>
              </p>
            )}
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
