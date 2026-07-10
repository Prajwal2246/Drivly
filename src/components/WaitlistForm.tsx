'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Building, Loader2, AlertCircle } from 'lucide-react';

const SOCIETY_CLUSTERS = [
  { name: "Greenwood Heights Cluster", details: "Phase 1 & 2 • 12 active listings", x: 120, y: 70, id: "greenwood", count: 12, dist: "0.4 km" },
  { name: "Green Park Cooperative Cluster", details: "Green Park Court • 8 active listings", x: 260, y: 110, id: "greenpark", count: 8, dist: "0.8 km" },
  { name: "Orchid Petals Cluster", details: "Orchid Enclave • 15 active listings", x: 180, y: 150, id: "orchid", count: 15, dist: "1.2 km" },
  { name: "Palm Meadows Cluster", details: "Palm Greens • 6 active listings", x: 340, y: 60, id: "palm", count: 6, dist: "1.6 km" }
];

export default function WaitlistForm() {
  const [societyName, setSocietyName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [activeClusterIndex, setActiveClusterIndex] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEnterCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyName.trim()) {
      setError('Please select or enter a society name.');
      return;
    }
    setIsRedirecting(true);
    setError(null);
    router.push(`/login?society=${encodeURIComponent(societyName.trim())}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
      <h3 className="text-xl font-bold text-zinc-955 mb-2 text-center sm:text-left">Enter your Society</h3>
      <p className="text-zinc-650 mb-8 text-xs sm:text-sm text-center sm:text-left leading-relaxed">
        Select or enter your gated community name below to access your local sharing pool.
      </p>

      {error && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl mb-6 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleEnterCommunity} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="societyName" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 text-left">
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
                  value={societyName}
                  onChange={(e) => {
                    setSocietyName(e.target.value);
                    const matchedIdx = SOCIETY_CLUSTERS.findIndex(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                    setActiveClusterIndex(matchedIdx >= 0 ? matchedIdx : null);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-sm transition-all duration-200"
                  onFocus={() => setShowMap(true)}
                  onBlur={() => setTimeout(() => setShowMap(false), 200)}
                />
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showMap && (
                <div className="absolute z-20 w-full bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-2.5 space-y-1 mt-1 text-left">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 pb-1.5 border-b border-zinc-100 select-none">
                    Active Neighbors Nearby
                  </span>
                  {SOCIETY_CLUSTERS.map((cluster, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSocietyName(cluster.name);
                        setActiveClusterIndex(idx);
                        setShowMap(false);
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
                        setSocietyName(cluster.name);
                        setActiveClusterIndex(idx);
                        setShowMap(false);
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

        {/* Submit button */}
        <button
          type="submit"
          disabled={isRedirecting}
          className="w-full mt-4 py-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:ring-offset-2"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              Entering Community...
            </>
          ) : (
            'Enter Community'
          )}
        </button>
      </form>
    </div>
  );
}
