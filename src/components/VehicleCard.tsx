'use client';

import { ShieldCheck, Key } from 'lucide-react';

interface VehicleCardProps {
  brand: string;
  model: string;
  type?: string; // 'CAR' | 'BIKE' | 'OTHER'
  colorHex: string;
  contribution: number;
  isAvailable: boolean;
  onRequest?: () => void;
}

export default function VehicleCard({
  brand,
  model,
  type = 'CAR',
  colorHex,
  contribution,
  isAvailable,
  onRequest,
}: VehicleCardProps) {
  const modelLower = model.toLowerCase();
  const brandLower = brand.toLowerCase();

  // 1. Scooter/Vespa check
  const isScooter = type === 'BIKE' && (
    modelLower.includes('activa') || 
    brandLower.includes('vespa') || 
    modelLower.includes('scooty')
  );
  
  // 2. Motorcycle check
  const isMotorcycle = type === 'BIKE' && !isScooter;

  // 3. Car Class checks (SUV vs Hatchback vs Sedan)
  const isCar = type === 'CAR' || (!isScooter && !isMotorcycle);
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

  return (
    <div className="group bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left h-full">
      {/* Header Area */}
      <div className="p-5 pb-3 flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-tight">
            {brand} <span className="font-semibold text-zinc-700">{model}</span>
          </h3>
          
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Verified Owner</span>
          </div>
        </div>

        {/* Availability Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
            isAvailable 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-stone-50 border-stone-200 text-stone-400'
          }`}
        >
          {isAvailable && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          )}
          <span>{isAvailable ? 'Available' : 'Borrowed'}</span>
        </div>
      </div>

      {/* Centerpiece Area (SVG Silhouette matching the flat illustration style) */}
      <div className="bg-stone-50/50 border-y border-stone-100 p-6 flex items-center justify-center relative overflow-hidden h-40">
        
        {/* Dynamic Ambient Glow overlay */}
        <div 
          style={{ backgroundColor: colorHex }}
          className="absolute w-36 h-12 rounded-full opacity-[0.12] blur-3xl pointer-events-none transition-all duration-300 group-hover:scale-125"
        />

        {/* 1. Vespa / Scooter */}
        {isScooter && (
          <svg 
            viewBox="0 0 120 40" 
            className="w-full max-w-[200px] h-28 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-2.5 z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Shadow */}
            <ellipse cx="60" cy="34" rx="38" ry="1.5" fill="rgba(0, 0, 0, 0.08)" />

            {/* Front Mudguard */}
            <path d="M 35,26 C 35,21 41,21 41,26 Z" fill={colorHex} stroke="#1c1917" strokeWidth="1.8" />

            {/* Vespa Curved Front Leg Shield */}
            <path 
              d="M 46,27 C 44,24 42,19 42,13.5 C 44,13.5 45,21 48,24 Z" 
              fill={colorHex} stroke="#1c1917" strokeWidth="1.8" strokeLinejoin="round"
            />
            <path 
              d="M 48,27 C 50,27 63,27 65,27 L 65,25.5 C 63,25.5 52,25.5 50,25.5 Z" 
              fill={colorHex} stroke="#1c1917" strokeWidth="1.8"
            />
            <path 
              d="M 63,26 C 61,19 67,15.5 77,15.5 C 84,15.5 86,19 85,25.5 C 84,28.5 72,28.5 63,26 Z" 
              fill={colorHex} stroke="#1c1917" strokeWidth="1.8" strokeLinejoin="round"
            />

            {/* Retro Seat */}
            <path 
              d="M 56,17 C 56,17 62,14.5 73,14.5 C 77,14.5 78,16.5 76,18.5 C 72,19.5 60,19.5 56,17 Z" 
              fill="#292524" stroke="#1c1917" strokeWidth="1.8"
            />

            {/* Steering columns & handlebar details */}
            <path d="M 38,30 L 44,10" stroke="#1c1917" strokeWidth="1.8" />
            <path d="M 44,10 L 40,10" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 44,10 L 48,11" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />

            {/* Circular Retro Headlight */}
            <circle cx="44.5" cy="10" r="2.2" fill="#fde047" stroke="#1c1917" strokeWidth="1.8" />

            {/* Retro Round Rearview Mirror */}
            <path d="M 44,10 L 41.5,6" stroke="#1c1917" strokeWidth="0.8" />
            <circle cx="40.5" cy="5" r="1.2" fill="#ffffff" stroke="#1c1917" strokeWidth="0.8" />

            {/* Front Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[38px_30px]">
              <circle cx="38" cy="30" r="5.5" fill="#1c1917" />
              <circle cx="38" cy="30" r="3.2" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.2" />
              <circle cx="38" cy="30" r="1" fill="#ffffff" />
              <line x1="38" y1="27" x2="38" y2="33" stroke="#1c1917" strokeWidth="1" />
            </g>

            {/* Back Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[82px_30px]">
              <circle cx="82" cy="30" r="5.5" fill="#1c1917" />
              <circle cx="82" cy="30" r="3.2" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.2" />
              <circle cx="82" cy="30" r="1" fill="#ffffff" />
              <line x1="82" y1="27" x2="82" y2="33" stroke="#1c1917" strokeWidth="1" />
            </g>
          </svg>
        )}

        {/* 2. Motorcycle */}
        {isMotorcycle && (
          <svg 
            viewBox="0 0 100 40" 
            className="w-full max-w-[200px] h-28 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-2.5 z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Shadow */}
            <ellipse cx="50" cy="34" rx="36" ry="1.5" fill="rgba(0, 0, 0, 0.08)" />

            {/* Rear Mudguard / Fender */}
            <path d="M 21,20 L 18,24" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />

            {/* Front Fork */}
            <path d="M 56,12 L 68,28" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
            <path d="M 56,12 L 68,28" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Main Body (Chunky frame + Cowl + Underbelly) */}
            <path
              d="M 32,28 
                 C 26,28 23,26 22,19 
                 C 24,18 32,21 42,22 
                 C 47,22 49,17 54,15 
                 C 58,14 59,17 59,20 
                 C 59,24 54,29 45,29 
                 C 39,29 36,29 32,28 Z"
              fill={colorHex}
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Seat Padding */}
            <path
              d="M 23.5,19 
                 C 27,20 34,22 43,22 
                 C 42,23 36,24 26,24 
                 C 24,24 23.5,22 23.5,19 Z"
              fill="#292524"
              stroke="#1c1917"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Underbelly Engine Details (White Circle + Vent lines) */}
            <circle cx="47" cy="25" r="2.5" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="51" y1="21" x2="55" y2="21" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="52" y1="23" x2="55" y2="23" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="53" y1="25" x2="55" y2="25" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />

            {/* Handlebars */}
            <path 
              d="M 53,13 
                 C 54,9 57,7 61,9" 
              stroke="#1c1917" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />

            {/* Trapezoidal Headlight with Pale Yellow Glow */}
            <path 
              d="M 60,9 L 64,9 L 63,13 L 59,12 Z" 
              fill="#fde047" 
              stroke="#1c1917" 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />

            {/* Front Wheel Group (Rotates on Hover) */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[68px_28px]">
              <circle cx="68" cy="28" r="6" fill="#1c1917" />
              <circle cx="68" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="68" cy="28" r="1.2" fill="#ffffff" />
              <line x1="68" y1="25" x2="68" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>

            {/* Back Wheel Group (Rotates on Hover) */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[32px_28px]">
              <circle cx="32" cy="28" r="6" fill="#1c1917" />
              <circle cx="32" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="32" cy="28" r="1.2" fill="#ffffff" />
              <line x1="32" y1="25" x2="32" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>
          </svg>
        )}

        {/* 3. SUV (Boxy illustration layout) */}
        {isCar && isSuv && (
          <svg 
            viewBox="0 0 100 40" 
            className="w-full max-w-[200px] h-28 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-2.5 z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse cx="50" cy="34" rx="42" ry="1.8" fill="rgba(0, 0, 0, 0.08)" />

            {/* SUV Body Frame */}
            <path
              d="M 10,28 
                 L 20,28
                 C 21,24.5 24,22 28,22
                 C 32,24.5 35,28 36,28
                 L 66,28
                 C 67,24.5 70,22 74,22
                 C 78,24.5 81,28 82,28
                 L 90,28
                 C 91,28 92,27 92,25
                 L 92,15
                 C 92,14 91,13 90,13
                 L 44,13
                 C 34,13 24,17 18,21
                 L 10,22
                 C 9,22 8,23 8,24
                 C 8,26 9,28 10,28 Z"
              fill={colorHex}
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Bumper highlights */}
            <path d="M 8,24 L 14,24 L 14,28 L 8,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />
            <path d="M 86,24 L 90,24 L 90,28 L 86,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />

            {/* Windows */}
            <path d="M 38,15.5 L 48,15.5 L 48,20 L 32,20 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M 52,15.5 L 68,15.5 L 68,20 L 52,20 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M 72,15.5 L 88,15.5 L 88,20 L 72,20 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />

            {/* Front Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[28px_28px]">
              <circle cx="28" cy="28" r="6" fill="#1c1917" />
              <circle cx="28" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="28" cy="28" r="1.2" fill="#ffffff" />
              <line x1="28" y1="25" x2="28" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>

            {/* Back Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[74px_28px]">
              <circle cx="74" cy="28" r="6" fill="#1c1917" />
              <circle cx="74" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="74" cy="28" r="1.2" fill="#ffffff" />
              <line x1="74" y1="25" x2="74" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>
          </svg>
        )}

        {/* 4. Hatchback (Bubble contour matching 2nd illustration) */}
        {isCar && isHatchback && (
          <svg 
            viewBox="0 0 100 40" 
            className="w-full max-w-[200px] h-28 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-2.5 z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse cx="50" cy="34" rx="40" ry="1.8" fill="rgba(0, 0, 0, 0.08)" />

            {/* Hatchback Body */}
            <path
              d="M 12,28 
                 L 20,28
                 C 21,24.5 24,22 28,22
                 C 32,24.5 35,28 36,28
                 L 64,28
                 C 65,24.5 68,22 72,22
                 C 76,24.5 79,28 80,28
                 L 88,28
                 C 89,28 90,27 90,25
                 C 90,20 82,15 76,14.5
                 C 68,14 54,13 46,13
                 C 34,13 24,17 18,21
                 L 12,23
                 C 11,23 10,24 10,25
                 C 10,27 11,28 12,28 Z"
              fill={colorHex}
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Bumper highlights */}
            <path d="M 10,24 L 15,24 L 15,28 L 10,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />
            <path d="M 85,24 L 90,24 L 90,28 L 85,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />

            {/* Windows */}
            <path d="M 32,18 L 48,18 L 48,15 C 40,15 36,16 32,18 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M 52,18 L 74,18 C 76,18 78,16.5 78,15.5 L 68,15 L 52,15 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />

            {/* Front Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[28px_28px]">
              <circle cx="28" cy="28" r="6" fill="#1c1917" />
              <circle cx="28" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="28" cy="28" r="1.2" fill="#ffffff" />
              <line x1="28" y1="25" x2="28" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>

            {/* Back Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[72px_28px]">
              <circle cx="72" cy="28" r="6" fill="#1c1917" />
              <circle cx="72" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="72" cy="28" r="1.2" fill="#ffffff" />
              <line x1="72" y1="25" x2="72" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>
          </svg>
        )}

        {/* 5. Sedan (Sleek curve matching 4th illustration) */}
        {isCar && isSedan && (
          <svg 
            viewBox="0 0 100 40" 
            className="w-full max-w-[200px] h-28 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-2.5 z-10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse cx="50" cy="34" rx="44" ry="1.8" fill="rgba(0, 0, 0, 0.08)" />

            {/* Sedan Body */}
            <path
              d="M 10,28 
                 L 20,28
                 C 21,24.5 24,22 28,22
                 C 32,24.5 35,28 36,28
                 L 64,28
                 C 65,24.5 68,22 72,22
                 C 76,24.5 79,28 80,28
                 L 90,28
                 C 91,28 92,27 92,25
                 C 92,23 88,22 84,22
                 L 76,22
                 C 74,16 66,13 54,13
                 L 38,13
                 C 28,13 22,17 18,21
                 L 10,23
                 C 9,23 8,24 8,25
                 C 8,27 9,28 10,28 Z"
              fill={colorHex}
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Bumper highlights */}
            <path d="M 8,24 L 14,24 L 14,28 L 8,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />
            <path d="M 86,24 L 92,24 L 92,28 L 86,28 Z" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.8" />

            {/* Windows */}
            <path d="M 39,15.5 L 53,15.5 L 53,20 L 32,20 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />
            <path d="M 56,15.5 L 70,15.5 L 76,20 L 56,20 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.5" />

            {/* Front Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[28px_28px]">
              <circle cx="28" cy="28" r="6" fill="#1c1917" />
              <circle cx="28" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="28" cy="28" r="1.2" fill="#ffffff" />
              <line x1="28" y1="25" x2="28" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>

            {/* Back Wheel */}
            <g className="transition-transform duration-700 ease-out group-hover:rotate-[360deg] origin-[72px_28px]">
              <circle cx="72" cy="28" r="6" fill="#1c1917" />
              <circle cx="72" cy="28" r="3.5" fill="#d6d3d1" stroke="#1c1917" strokeWidth="1.5" />
              <circle cx="72" cy="28" r="1.2" fill="#ffffff" />
              <line x1="72" y1="25" x2="72" y2="31" stroke="#1c1917" strokeWidth="1" />
            </g>
          </svg>
        )}
      </div>

      {/* Footer Area */}
      <div className="p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Contribution</span>
          <span className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
            ₹{contribution}
            <span className="text-xs text-zinc-400 font-medium">/hr</span>
          </span>
        </div>

        <button
          onClick={isAvailable ? onRequest : undefined}
          disabled={!isAvailable}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 select-none ${
            isAvailable
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-md active:scale-95 cursor-pointer'
              : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Request
        </button>
      </div>
    </div>
  );
}
