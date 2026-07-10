'use client';

import { useRouter } from 'next/navigation';
import { CarFront, Plus } from 'lucide-react';

interface EmptyStateProps {
  societyName: string;
}

export default function EmptyState({ societyName }: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-5 select-none my-8">
      {/* Subtle large car icon */}
      <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-350 shadow-inner">
        <CarFront className="w-10 h-10 stroke-[1.5]" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-black text-zinc-950 tracking-tight">It's quiet in here...</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          It looks like there are no active vehicles registered in <strong>{societyName}</strong> yet. 
          Be the first to list a car or bike to kickstart your society's sharing pool!
        </p>
      </div>

      <button
        onClick={() => router.push('/dashboard/list-vehicle')}
        className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        List the first vehicle
      </button>
    </div>
  );
}
