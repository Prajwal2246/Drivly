"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Clock,
  DollarSign,
  LogOut,
  LayoutDashboard,
  X,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import VehicleCard from "@/components/VehicleCard";

interface Vehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  colorHex: string;
  pricePerHour: number;
  available: boolean;
  owner: {
    name: string;
    phone: string;
  };
}

interface FeedClientProps {
  user: {
    userId: string;
    name: string;
    role: string;
    society: string;
  };
  initialVehicles: Vehicle[];
}

export default function FeedClient({ user, initialVehicles }: FeedClientProps) {
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingHours, setBookingHours] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  const handleBookRequest = async () => {
    if (!selectedVehicle) return;
    setIsSubmitting(true);
    setError(null);

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + bookingHours * 60 * 60 * 1000,
    );
    const totalCost = selectedVehicle.pricePerHour * bookingHours;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalCost,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit request.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="font-bold text-lg text-zinc-950">Drivly</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition cursor-pointer border border-zinc-200 bg-white"
          >
            <User className="w-3.5 h-3.5" />
            My Profile
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition cursor-pointer border border-zinc-200 bg-white"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            My Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        {/* Banner */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Gated Society
              </span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {user.society}
              </span>
            </div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Available Vehicles in {user.society}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Direct community rentals from your verified neighbors.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search make or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
            />
          </div>
        </div>

        {/* Listings Grid */}
        {filteredVehicles.length === 0 ? (
          <EmptyState societyName={user.society} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                brand={vehicle.brand}
                model={vehicle.model}
                type={vehicle.type}
                colorHex={vehicle.colorHex}
                contribution={vehicle.pricePerHour}
                isAvailable={vehicle.available}
                onRequest={() => {
                  setSelectedVehicle(vehicle);
                  setIsSuccess(false);
                  setError(null);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-scale-in">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="p-8 text-center space-y-5">
                <div className="w-6 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                    Request Submitted!
                  </h3>
                  <p className="text-xs text-zinc-500 leading-normal max-w-xs mx-auto">
                    Your request has been logged. We have notified{" "}
                    <strong>{selectedVehicle.owner.name}</strong>. You will be
                    able to track this booking in your Dashboard.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Back to Feed
                </button>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    REQUEST BOOKING
                  </span>
                  <h3 className="text-xl font-black text-zinc-950 mt-1 tracking-tight">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Listed by {selectedVehicle.owner.name}
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-lg text-xs font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Rental Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 4, 8, 24].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setBookingHours(hours)}
                          className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            bookingHours === hours
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {hours === 24 ? "1 Day" : `${hours} hrs`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Rate</span>
                      <span>₹{selectedVehicle.pricePerHour}/hr</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Duration</span>
                      <span>{bookingHours} Hours</span>
                    </div>
                    <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-zinc-900 text-sm">
                      <span>Total Estimated Cost</span>
                      <span>
                        ₹{selectedVehicle.pricePerHour * bookingHours}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                  <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Before starting, you must complete a vehicle physical
                    checklist.
                  </span>
                </div>

                <button
                  onClick={handleBookRequest}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    "Request Borrow"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
