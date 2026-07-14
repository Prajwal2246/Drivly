'use client';

import { ShieldCheck, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VehicleCardProps {
  id: string;
  brand: string;
  model: string;
  type?: string; // 'CAR' | 'BIKE' | 'OTHER'
  colorHex: string;
  contribution: number;
  isAvailable: boolean;
  onRequest?: () => void;
}

export default function VehicleCard({
  id,
  brand,
  model,
  type = 'CAR',
  colorHex,
  contribution,
  isAvailable,
  onRequest,
}: VehicleCardProps) {
  const router = useRouter();
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

  const handleCardClick = () => {
    router.push(`/feed/${id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white border border-stone-200/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col justify-between text-left h-64 select-none max-w-[340px] w-full mx-auto cursor-pointer"
    >
      
      {/* Background Vehicle Image (Spans full space inside the card) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center py-2 bg-white transition-colors duration-500">
        {/* Dynamic Ambient Glow overlay */}
        <div 
          style={{ backgroundColor: colorHex }}
          className="absolute w-44 h-44 rounded-full opacity-[0.05] blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-125"
        />

        {/* Vehicle Image */}
        <img 
          src={
            isScooter 
              ? '/scooter.png'
              : isMotorcycle 
                ? '/motorcycle.png'
                : isSuv 
                  ? '/suv.png'
                  : isHatchback 
                    ? '/hatchback.png'
                    : '/sedan.png'
          }
          alt={`${brand} ${model}`}
          className="w-full h-full object-contain object-bottom scale-[1.08] translate-y-4 transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:translate-y-4 select-none mix-blend-multiply"
        />
      </div>

      {/* Header Info Overlay (Top) */}
      <div className="p-5 z-10 flex justify-between items-start bg-gradient-to-b from-white/95 via-white/40 to-transparent w-full pb-8">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-tight group-hover:text-zinc-950 transition-colors">
            {brand} <span className="font-semibold text-zinc-650">{model}</span>
          </h3>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-[#FFF200] text-zinc-950 font-black text-[8px] px-1.5 py-0.5 rounded border border-[#E6B800] tracking-wider uppercase select-none shadow-xs">
              {type === 'BIKE' 
                ? (isScooter ? 'MOTO / SCOOTER' : 'MOTO / SPORT') 
                : (isSuv ? 'CAR / SUV' : isHatchback ? 'CAR / HATCHBACK' : 'CAR / SEDAN')}
            </span>
            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Verified Owner</span>
            </div>
          </div>
        </div>

        {/* Availability Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider border transition-all ${
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

      {/* Footer Info Overlay (Bottom - Contribution & Request Only) */}
      <div className="p-5 z-10 flex items-center justify-between w-full bg-gradient-to-t from-white/95 via-white/50 to-transparent pt-8 mt-auto">
        <div>
          <span className="text-[8.5px] text-zinc-400 font-extrabold uppercase tracking-wider block">Contribution</span>
          <span className="text-lg font-mono font-black text-zinc-900 tracking-tight tabular-nums flex items-baseline">
            ₹{contribution}
            <span className="text-xs text-zinc-400 font-semibold ml-0.5 font-sans">/hr</span>
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) {
              router.push(`/feed/${id}`);
            }
          }}
          disabled={!isAvailable}
          className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-black transition-all duration-300 select-none ${
            isAvailable
              ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-950/20 active:scale-95 active:translate-y-[1px] cursor-pointer'
              : 'bg-zinc-100 text-zinc-400 border border-zinc-200/60 cursor-not-allowed'
          }`}
        >
          <Key className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" />
          Request
        </button>
      </div>

    </div>
  );
}
