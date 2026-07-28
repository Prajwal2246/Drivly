'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Key, 
  Star, 
  Calendar, 
  Clock, 
  User, 
  Info, 
  Gauge, 
  Fuel, 
  HeartHandshake
} from 'lucide-react';

interface BookingSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface VehicleDetailsProps {
  user: {
    id: string;
    name: string;
    society: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    type: string;
    year: number;
    colorHex: string;
    pricePerHour: number;
    available: boolean;
    ownerId: string;
    owner: {
      name: string;
      phone: string;
      societyName: string;
    };
    bookings: BookingSlot[];
  };
  reviews: Array<{
    id: string;
    renterName: string;
    rating: number;
    review: string | null;
    createdAt: string;
  }>;
  averageRating: number | null;
}

export default function VehicleDetailsClient({ 
  user, 
  vehicle, 
  reviews, 
  averageRating 
}: VehicleDetailsProps) {
  const router = useRouter();

  // Booking states
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation / status states
  const [priceBreakdown, setPriceBreakdown] = useState<{
    hours: number;
    rentalCost: number;
    deposit: number;
    fee: number;
    total: number;
  } | null>(null);

  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isOwner = user.id === vehicle.ownerId;

  // Determine vehicle category
  const modelLower = vehicle.model.toLowerCase();
  const brandLower = vehicle.brand.toLowerCase();

  const isScooter = vehicle.type === 'BIKE' && (
    modelLower.includes('activa') || 
    brandLower.includes('vespa') || 
    modelLower.includes('scooty')
  );
  
  const isMotorcycle = vehicle.type === 'BIKE' && !isScooter;
  const isCar = vehicle.type === 'CAR' || (!isScooter && !isMotorcycle);
  const isSuv = isCar && (
    modelLower.includes('harrier') || 
    modelLower.includes('creta') || 
    modelLower.includes('suv') || 
    modelLower.includes('safari') || 
    modelLower.includes('punch') || 
    modelLower.includes('nexon')
  );
  const isHatchback = isCar && !isSuv && (
    modelLower.includes('i20') || 
    modelLower.includes('swift') || 
    modelLower.includes('altroz') || 
    modelLower.includes('tiago') || 
    modelLower.includes('hatchback')
  );
  const isSedan = isCar && !isSuv && !isHatchback;

  const imageSrc = isScooter 
    ? '/scooter.png'
    : isMotorcycle 
      ? '/motorcycle.png'
      : isSuv 
        ? '/suv.png'
        : isHatchback 
          ? '/hatchback.png'
          : '/sedan.png';

  // Calculate pricing breakdown and check overlaps dynamically
  useEffect(() => {
    if (!startTimeStr || !endTimeStr) {
      setPriceBreakdown(null);
      setHasConflict(false);
      return;
    }

    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      setPriceBreakdown(null);
      setHasConflict(false);
      return;
    }

    // 1. Calculate duration and costs
    const diffMs = end.getTime() - start.getTime();
    const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));

    const rentalCost = totalHours * vehicle.pricePerHour;
    const deposit = vehicle.type === 'CAR' ? 2000 : 1000;
    const fee = parseFloat((rentalCost * 0.05).toFixed(2)); // 5% platform service fee
    const total = rentalCost + deposit + fee;

    setPriceBreakdown({
      hours: totalHours,
      rentalCost,
      deposit,
      fee,
      total
    });

    // 2. Check overlap conflict with existing bookings
    let overlapFound = false;
    for (const b of vehicle.bookings) {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      if (start < bEnd && end > bStart) {
        overlapFound = true;
        setConflictMessage(
          `Reserved slot conflict: overlaps with an existing booking from ${bStart.toLocaleString()} to ${bEnd.toLocaleString()}`
        );
        break;
      }
    }
    setHasConflict(overlapFound);

  }, [startTimeStr, endTimeStr, vehicle]);

  // Request submit handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) return;
    if (hasConflict || !priceBreakdown) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          startTime: new Date(startTimeStr).toISOString(),
          endTime: new Date(endTimeStr).toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setSuccessMsg(`Booking request submitted successfully! Pending approval from ${vehicle.owner.name}.`);
      setStartTimeStr('');
      setEndTimeStr('');
      setNotes('');
      
      // Refresh the page data after short timeout to fetch the new booking slot
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-16">
      
      {/* 1. Sticky Navigation Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => router.push('/feed')}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-150 rounded-xl text-xs font-black text-zinc-700 transition-colors border border-stone-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="font-bold text-lg text-zinc-955 tracking-tight">{user.society} Hub</span>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow">
        
        {/* Top visual banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Vehicle specifications, reviews, details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Vehicle Card Showcase */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] overflow-hidden shadow-sm p-6 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                    {vehicle.brand} <span className="font-semibold text-zinc-650">{vehicle.model}</span>
                  </h1>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="bg-[#FFF200] text-zinc-950 font-black text-[9px] px-1.5 py-0.5 rounded border border-[#E6B800] tracking-wider uppercase select-none">
                      {vehicle.type === 'BIKE' 
                        ? (isScooter ? 'MOTO / SCOOTER' : 'MOTO / SPORT') 
                        : (isSuv ? 'CAR / SUV' : isHatchback ? 'CAR / HATCHBACK' : 'CAR / SEDAN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                      Model Year {vehicle.year}
                    </span>
                  </div>
                </div>

                <div 
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    vehicle.available 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}
                >
                  {vehicle.available && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <span>{vehicle.available ? 'Available' : 'Borrowed'}</span>
                </div>
              </div>

              {/* Large Studio Render Centerpiece */}
              <div className="w-full h-64 flex items-center justify-center relative overflow-hidden bg-white mt-4 border-b border-stone-100 select-none">
                {/* Dynamic Ambient Glow overlay */}
                <div 
                  style={{ backgroundColor: vehicle.colorHex }}
                  className="absolute w-48 h-48 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
                />

                <img 
                  src={imageSrc}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-contain object-bottom scale-[1.08] translate-y-4 select-none mix-blend-multiply"
                />
              </div>

              {/* Verified Owner Widget */}
              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-150 flex items-center justify-center text-zinc-800 font-extrabold text-sm border border-zinc-200">
                    {vehicle.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block">Listed By Neighbor</span>
                    <span className="text-sm font-black text-zinc-900 leading-tight block">{vehicle.owner.name}</span>
                    <span className="text-[10px] text-zinc-550 leading-tight block">{vehicle.owner.societyName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold bg-zinc-50 border border-zinc-200/50 rounded-xl px-3 py-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>DL Verified host</span>
                </div>
              </div>
            </div>

            {/* Specifications checklist */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 shadow-sm">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Info className="w-4.5 h-4.5 text-zinc-450" />
                Vehicle Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-50/50 border border-stone-100 p-3.5 rounded-2xl">
                  <Gauge className="w-4 h-4 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Transmission</span>
                  <span className="text-xs font-black text-zinc-800 mt-0.5 block">
                    {vehicle.type === 'BIKE' ? 'Geared / Auto' : 'Manual / Auto'}
                  </span>
                </div>
                <div className="bg-zinc-50/50 border border-stone-100 p-3.5 rounded-2xl">
                  <Fuel className="w-4 h-4 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Fuel Type</span>
                  <span className="text-xs font-black text-zinc-800 mt-0.5 block">
                    {vehicle.type === 'BIKE' ? 'Petrol' : 'Petrol / Diesel'}
                  </span>
                </div>
                <div className="bg-zinc-50/50 border border-stone-100 p-3.5 rounded-2xl">
                  <User className="w-4 h-4 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Capacity</span>
                  <span className="text-xs font-black text-zinc-800 mt-0.5 block">
                    {vehicle.type === 'BIKE' ? '2 Seats' : isSuv ? '7 Seats' : '5 Seats'}
                  </span>
                </div>
                <div className="bg-zinc-50/50 border border-stone-100 p-3.5 rounded-2xl">
                  <HeartHandshake className="w-4 h-4 text-zinc-500 mb-1" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Fastag / Toll</span>
                  <span className="text-xs font-black text-zinc-800 mt-0.5 block">
                    {vehicle.type === 'BIKE' ? 'Not Applicable' : 'Auto-Enabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Neighborhood Reviews */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4.5 h-4.5 text-zinc-450 fill-zinc-450" />
                  Reviews from Neighbors
                </h2>
                {averageRating !== null && (
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-800 border border-yellow-100 px-2.5 py-0.5 rounded-full text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-yellow-600 text-yellow-600" />
                    <span>{averageRating} rating</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-zinc-200 rounded-2xl text-zinc-450 text-xs">
                  No renter reviews recorded yet. Be the first to share!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900">{r.renterName}</span>
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      {r.review && (
                        <p className="text-xs text-zinc-650 mt-1.5 italic leading-relaxed">
                          "{r.review}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Booking Selector & Conflicts */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Booking Form Widget */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-zinc-450" />
                Reserve Vehicle
              </h2>

              {isOwner ? (
                <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl text-zinc-550 text-xs leading-relaxed">
                  ℹ️ **Listing Owner Access**: This is your listed vehicle. You can manage bookings or block out maintenance slots in your Owner Dashboard.
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Start Date & Time */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">Start Time</label>
                    <input 
                      type="datetime-local"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                    />
                  </div>

                  {/* End Date & Time */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">End Time</label>
                    <input 
                      type="datetime-local"
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                      required
                      min={startTimeStr || new Date().toISOString().slice(0, 16)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                    />
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider mb-1.5 block">Purpose / Rent Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="E.g., Groceries run, weekend family trip..."
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 resize-none"
                    />
                  </div>

                  {/* Dynamic Pricing Breakdown */}
                  {priceBreakdown && (
                    <div className="bg-zinc-50/50 border border-stone-100 p-4 rounded-2xl space-y-2 text-xs select-none">
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Duration</span>
                        <span className="font-bold text-zinc-800">{priceBreakdown.hours} hours</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Hourly Contribution</span>
                        <span className="font-bold text-zinc-800">₹{priceBreakdown.rentalCost}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Refundable Deposit</span>
                        <span className="font-bold text-zinc-800">₹{priceBreakdown.deposit}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Platform Fee (5%)</span>
                        <span className="font-bold text-zinc-800">₹{priceBreakdown.fee}</span>
                      </div>
                      <hr className="border-stone-100" />
                      <div className="flex justify-between items-center font-black text-sm text-zinc-900 pt-1">
                        <span>Total Payable</span>
                        <span className="font-mono">₹{priceBreakdown.total}</span>
                      </div>
                    </div>
                  )}

                  {/* Overlap Schedule Warning Banner */}
                  {hasConflict && (
                    <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-2xl text-xs font-medium select-none">
                      ⚠️ {conflictMessage}
                    </div>
                  )}

                  {/* Status responses */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-2xl text-xs font-medium select-none">
                      ❌ Error: {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-2xl text-xs font-medium select-none">
                      ✅ {successMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || hasConflict || !priceBreakdown}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all select-none shadow-md ${
                      !priceBreakdown || hasConflict 
                        ? 'bg-zinc-100 border border-zinc-200/50 text-zinc-400 cursor-not-allowed shadow-none'
                        : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg active:scale-98 active:translate-y-[1px]'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    {isSubmitting ? 'Submitting Request...' : 'Send Booking Request'}
                  </button>

                </form>
              )}
            </div>

            {/* Reserved Timelines Visualizer Widget */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-zinc-450" />
                Reserved Schedule Slots
              </h2>

              {vehicle.bookings.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-zinc-200 rounded-2xl text-zinc-450 text-xs">
                  No active reservations yet. All time slots are free!
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicle.bookings.map(b => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);
                    return (
                      <div 
                        key={b.id} 
                        className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-zinc-650"
                      >
                        <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                          b.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <div className="font-black text-zinc-800 uppercase tracking-wider text-[9px] mb-0.5">
                            {b.status} Reservation
                          </div>
                          <div>From: {start.toLocaleString()}</div>
                          <div>To: {end.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
