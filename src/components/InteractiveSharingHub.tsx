"use client";

import React, { useState } from "react";
import {
  Car,
  ShieldCheck,
  Check,
  ChevronRight,
  Info,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Clock
} from "lucide-react";

interface Vehicle {
  name: string;
  owner: string;
  tower: string;
  rate: number;
  type: "car" | "bike";
  savings: number;
  renterName: string;
  renterTower: string;
  routePath: string;
  ownerNode: { x: number; y: number };
  renterNode: { x: number; y: number };
}

const VEHICLES: Vehicle[] = [
  {
    name: "Honda City",
    owner: "Amit",
    tower: "Tower A",
    rate: 150,
    type: "car",
    savings: 1800,
    renterName: "Divya S.",
    renterTower: "Tower C",
    routePath: "M 100,70 C 250,70 250,110 400,110",
    ownerNode: { x: 100, y: 70 },
    renterNode: { x: 400, y: 110 }
  },
  {
    name: "Ather 450X",
    owner: "Rohan",
    tower: "Tower B",
    rate: 50,
    type: "bike",
    savings: 600,
    renterName: "Arjun K.",
    renterTower: "Tower A",
    routePath: "M 100,110 C 250,110 250,70 400,70",
    ownerNode: { x: 400, y: 70 },
    renterNode: { x: 100, y: 110 }
  },
  {
    name: "Hyundai Creta",
    owner: "Priya",
    tower: "Tower C",
    rate: 180,
    type: "car",
    savings: 2200,
    renterName: "Sanjay M.",
    renterTower: "Tower B",
    routePath: "M 100,110 C 250,110 400,110",
    ownerNode: { x: 100, y: 110 },
    renterNode: { x: 400, y: 110 }
  }
];

export default function InteractiveSharingHub() {
  const [activeMode, setActiveMode] = useState<"owner" | "renter">("owner");
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const [calendarAvailability, setCalendarAvailability] = useState<number[]>([25, 26, 27, 28]);

  const activeCar = VEHICLES[selectedCarIndex];

  const toggleDate = (date: number) => {
    if (calendarAvailability.includes(date)) {
      setCalendarAvailability(calendarAvailability.filter((d) => d !== date));
    } else {
      setCalendarAvailability([...calendarAvailability, date].sort((a, b) => a - b));
    }
  };

  const currentDailyRate = activeMode === "owner" ? 150 * 8 : activeCar.rate * 8; // Assumes 8-hour rentals
  const estimatedEarnings = calendarAvailability.length * currentDailyRate;

  return (
    <div className="relative bg-zinc-50/70 backdrop-blur-md border border-zinc-200/80 rounded-[32px] shadow-2xl p-6 sm:p-8 md:p-10 overflow-hidden w-full transition-all duration-500">
      {/* Grid Canvas Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(9,9,11,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(9,9,11,0.015)_1px,transparent_1px)] bg-[size:2rem_2rem] z-0" />

      {/* Mode Switcher Tabs */}
      <div className="relative z-10 flex justify-center mb-10">
        <div className="inline-flex p-1.5 bg-zinc-100 rounded-full border border-zinc-200/60 shadow-inner select-none">
          <button
            onClick={() => setActiveMode("owner")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeMode === "owner"
                ? "bg-white text-emerald-700 shadow-md border border-emerald-100/50 scale-[1.01]"
                : "text-zinc-550 hover:text-zinc-900"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${activeMode === "owner" && "animate-pulse"}`} />
            Share as Owner
          </button>
          <button
            onClick={() => setActiveMode("renter")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeMode === "renter"
                ? "bg-white text-blue-700 shadow-md border border-blue-100/50 scale-[1.01]"
                : "text-zinc-550 hover:text-zinc-900"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${activeMode === "renter" && "animate-pulse"}`} />
            Rent as Neighbor
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {activeMode === "owner" ? (
            /* OWNER CONTROLS */
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  Availability Calendar
                </h3>
                <p className="text-xs text-zinc-500">
                  Select dates to list your idle vehicle in the community pool.
                </p>
              </div>

              {/* Double-Bezel Calendar Container */}
              <div className="bg-zinc-100/40 border border-zinc-200/50 p-2 rounded-[24px]">
                <div className="bg-white rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-zinc-100 space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest select-none">
                    <span>Availability (June)</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                      {calendarAvailability.length} Days Selected
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 text-[9px] text-center text-zinc-400 font-bold select-none">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
                    <span className="text-zinc-950">S</span><span className="text-zinc-950">S</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 text-center font-medium">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const date = i + 15;
                      const isSelected = calendarAvailability.includes(date);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleDate(date)}
                          className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[10px] transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/20 scale-105"
                              : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 border border-zinc-100"
                          }`}
                        >
                          {date}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Earnings Output */}
              <div className="bg-zinc-100/40 border border-zinc-200/50 p-2 rounded-[24px]">
                <div className="bg-white rounded-[18px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-zinc-100 flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">ESTIMATED EARNINGS</span>
                    <span className="text-2xl font-black text-emerald-600 block font-mono leading-none mt-1">
                      +₹{estimatedEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-700">
                    <CircleDollarSign className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* RENTER CONTROLS */
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                  Available Vehicles
                </h3>
                <p className="text-xs text-zinc-500">
                  Select a neighbor's car or bike parked inside your society.
                </p>
              </div>

              {/* Vehicle List */}
              <div className="space-y-2.5">
                {VEHICLES.map((vehicle, idx) => {
                  const isSelected = selectedCarIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedCarIndex(idx)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 border-zinc-950 text-white font-bold shadow-lg scale-[1.01]"
                          : "bg-white border-zinc-200/70 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-950 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-white/10" : "bg-zinc-100"}`}>
                          <Car
                            className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-zinc-600"}`}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs block leading-tight">{vehicle.name}</span>
                          <span className={`text-[9px] font-normal block ${
                            isSelected ? "text-white/60" : "text-zinc-400"
                          }`}>
                            Owned by {vehicle.owner} ({vehicle.tower})
                          </span>
                        </div>
                      </div>
                      <span className={`font-bold font-mono text-xs ${isSelected ? "text-emerald-400" : "text-emerald-600"}`}>
                        ₹{vehicle.rate}/hr
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Renter Savings Info */}
              <div className="bg-zinc-100/40 border border-zinc-200/50 p-2 rounded-[24px]">
                <div className="bg-white rounded-[18px] p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-zinc-100 flex items-center gap-3 text-left">
                  <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                    <Info className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-zinc-900 uppercase tracking-wide">
                      Neighbor Sharing Rate Benefit
                    </span>
                    <p className="text-[9.5px] text-zinc-500 leading-normal">
                      Saves ₹{activeCar.savings.toLocaleString()} compared to commercial vendors. No deposits, surge rates, or distant pick-ups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Gated Society Map & Active Match Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Double-Bezel Visual Panel */}
          <div className="bg-zinc-100/40 border border-zinc-200/50 p-2.5 rounded-[30px] shadow-sm">
            <div className="bg-white rounded-[22px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-zinc-100/80 flex flex-col gap-5">
              
              {/* Minimalist SVG Society Map */}
              <div className="relative h-36 w-full bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none" aria-hidden="true" role="img">
                  {/* Grid Lines */}
                  <path d="M 0,45 L 500,45 M 0,90 L 500,90 M 0,135 L 500,135" stroke="rgba(9,9,11,0.02)" strokeWidth="1" />
                  <path d="M 125,0 L 125,180 M 250,0 L 250,180 M 375,0 L 375,180" stroke="rgba(9,9,11,0.02)" strokeWidth="1" />
                  
                  {/* Towers representation */}
                  <g fill="rgba(9,9,11,0.01)" stroke="rgba(9,9,11,0.04)" strokeWidth="1">
                    {/* Tower A */}
                    <rect x="80" y="50" width="40" height="40" rx="6" />
                    <text x="100" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(9,9,11,0.3)" className="font-mono">T-A</text>

                    {/* Tower B */}
                    <rect x="80" y="90" width="40" height="40" rx="6" />
                    <text x="100" y="114" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(9,9,11,0.3)" className="font-mono">T-B</text>

                    {/* Tower C */}
                    <rect x="380" y="90" width="40" height="40" rx="6" />
                    <text x="400" y="114" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(9,9,11,0.3)" className="font-mono">T-C</text>
                    
                    {/* Parking Bay */}
                    <rect x="380" y="50" width="40" height="40" rx="6" />
                    <text x="400" y="74" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(9,9,11,0.3)" className="font-mono">PRK</text>
                  </g>

                  {/* Booking Route Connection */}
                  <path
                    d={activeCar.routePath}
                    fill="none"
                    stroke={activeMode === "owner" ? "#10b981" : "#3b82f6"}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="transition-all duration-700 ease-in-out"
                  />

                  {/* Pulsing Nodes */}
                  <circle cx={activeCar.ownerNode.x} cy={activeCar.ownerNode.y} r="4" fill={activeMode === "owner" ? "#10b981" : "#3b82f6"} className="transition-all duration-700" />
                  <circle cx={activeCar.ownerNode.x} cy={activeCar.ownerNode.y} r="8" fill="none" stroke={activeMode === "owner" ? "#34d399" : "#60a5fa"} strokeWidth="1" className="animate-pulse" />

                  <circle cx={activeCar.renterNode.x} cy={activeCar.renterNode.y} r="4" fill={activeMode === "owner" ? "#10b981" : "#3b82f6"} className="transition-all duration-700" />
                  <circle cx={activeCar.renterNode.x} cy={activeCar.renterNode.y} r="8" fill="none" stroke={activeMode === "owner" ? "#34d399" : "#60a5fa"} strokeWidth="1" className="animate-pulse" />
                </svg>
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[8px] font-bold text-zinc-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-zinc-150 select-none">
                  <MapPin className="w-2.5 h-2.5" />
                  Green Park Map Preview
                </div>
              </div>

              {/* Match Card Details */}
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                    Active Share Status
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[8.5px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1.5 select-none transition-colors duration-300 ${
                      activeMode === "owner"
                        ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                        : "bg-blue-50 border border-blue-100 text-blue-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeMode === "owner" ? "bg-emerald-500 animate-pulse" : "bg-blue-500 animate-pulse"}`} />
                    Live Match verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="text-xs text-zinc-950 font-bold leading-normal">
                    {activeMode === "owner" ? (
                      <span>
                        Neighbor {activeCar.renterName} ({activeCar.renterTower}) requested your {activeCar.name} for Saturday.
                      </span>
                    ) : (
                      <span>
                        Booking {activeCar.owner}&apos;s {activeCar.name} from {activeCar.tower}.
                      </span>
                    )}
                  </div>

                  {/* Trust Verified Badge */}
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-3 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={2} />
                    <div className="space-y-0.5">
                      <span className="block text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide">
                        Verified Neighbor Sharing Loop
                      </span>
                      <p className="text-[8.5px] text-zinc-500 leading-normal">
                        Both verified via Aadhaar & Driving License. Covered by ₹10L zero-deductible platform insurance. In-app digital key release active.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main CTA */}
                <div className="group/btn w-full bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white text-[10px] font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-all duration-300 shadow-md select-none cursor-pointer">
                  <span>View Sharing Dashboard</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform duration-300">
                    <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
