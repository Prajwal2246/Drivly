'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, Calendar, Clock, DollarSign, LogOut, ArrowLeft, Plus, 
  ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, X, Play, StopCircle, Loader2, User
} from 'lucide-react';

interface Vehicle {
  id: string;
  ownerId: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  colorHex: string;
  pricePerHour: number;
  available: boolean;
}

interface Booking {
  id: string;
  renterId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: string;
  totalCost: number;
  odometerStart: number | null;
  odometerEnd: number | null;
  notes: string | null;
  createdAt: string;
  paymentStatus: string;
  depositAmount: number;
  refundAmount: number;
  challanPenalty: number;
  challanReason: string | null;
  challanStatus: string;
  ownerRating: number | null;
  ownerReview: string | null;
  renterRating: number | null;
  renterReview: string | null;
  vehicle: Vehicle & {
    owner: { name: string; phone: string };
  };
  renter: { name: string; phone: string; preVerifyDl: boolean; dlFileName: string | null };
}

interface DashboardClientProps {
  user: {
    userId: string;
    name: string;
    role: string;
    society: string;
  };
  initialRenterBookings: Booking[];
  initialOwnerBookings: Booking[];
  initialMyVehicles: Vehicle[];
}

export default function DashboardClient({ 
  user, 
  initialRenterBookings, 
  initialOwnerBookings, 
  initialMyVehicles 
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'rentals' | 'vehicles' | 'requests'>('rentals');
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>(initialMyVehicles);
  const [renterBookings, setRenterBookings] = useState<Booking[]>(initialRenterBookings);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>(initialOwnerBookings);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    type: 'CAR',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    colorHex: '#3b82f6',
    pricePerHour: 100,
  });

  // Modal inspection states
  const [activeInspectionBooking, setActiveInspectionBooking] = useState<Booking | null>(null);
  const [inspectionOdometer, setInspectionOdometer] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionChecks, setInspectionChecks] = useState({
    odometerLogged: false,
    damageChecked: false,
    lightsVerified: false,
    brakesChecked: false,
  });

  // End trip modal states
  const [activeEndTripBooking, setActiveEndTripBooking] = useState<Booking | null>(null);
  const [endOdometer, setEndOdometer] = useState('');

  // Review & Rating Modal States
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Challan Logging Modal States
  const [activeChallanBooking, setActiveChallanBooking] = useState<Booking | null>(null);
  const [challanPenaltyInput, setChallanPenaltyInput] = useState('');
  const [challanReasonInput, setChallanReasonInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/login');
  };

  // Add a new vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list vehicle.');
      }

      setMyVehicles(prev => [data.vehicle, ...prev]);
      setNewVehicle({
        type: 'CAR',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        colorHex: '#3b82f6',
        pricePerHour: 100,
      });
      alert('Vehicle listed successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Owner action: Approve or Reject a request
  const handleOwnerAction = async (bookingId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed.');
      }

      // Update local state
      setOwnerBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status } : b)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update request.');
    }
  };

  // Renter action: Start trip (Active)
  const handleStartTrip = async () => {
    if (!activeInspectionBooking) return;
    if (!inspectionOdometer.trim()) {
      alert('Please enter current odometer reading.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${activeInspectionBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          odometerStart: inspectionOdometer,
          notes: inspectionNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start trip.');
      }

      // Update local state
      setRenterBookings(prev => 
        prev.map(b => b.id === activeInspectionBooking.id ? { ...b, status: 'ACTIVE', odometerStart: parseInt(inspectionOdometer), notes: inspectionNotes } : b)
      );
      setActiveInspectionBooking(null);
      setInspectionOdometer('');
      setInspectionNotes('');
      setInspectionChecks({
        odometerLogged: false,
        damageChecked: false,
        lightsVerified: false,
        brakesChecked: false,
      });
      alert('Trip activated! Drive safe.');
    } catch (err: any) {
      alert(err.message || 'Failed to start trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renter action: Complete trip
  const handleCompleteTrip = async () => {
    if (!activeEndTripBooking) return;
    if (!endOdometer.trim()) {
      alert('Please enter return odometer reading.');
      return;
    }

    const startOdom = activeEndTripBooking.odometerStart || 0;
    if (parseInt(endOdometer) < startOdom) {
      alert(`Return odometer cannot be less than starting odometer (${startOdom}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${activeEndTripBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          odometerEnd: endOdometer,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to end trip.');
      }

      // Update local state
      setRenterBookings(prev => 
        prev.map(b => b.id === activeEndTripBooking.id ? { ...b, status: 'COMPLETED', odometerEnd: parseInt(endOdometer) } : b)
      );
      setActiveEndTripBooking(null);
      setEndOdometer('');
      alert('Trip completed! Thank you for sharing.');
    } catch (err: any) {
      alert(err.message || 'Failed to complete trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReview = async () => {
    if (!activeReviewBooking) return;
    const isOwner = activeReviewBooking.vehicle.ownerId === user.userId;
    const ratingKey = isOwner ? 'renterRating' : 'ownerRating';
    const reviewKey = isOwner ? 'renterReview' : 'ownerReview';

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${activeReviewBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [ratingKey]: reviewRating,
          [reviewKey]: reviewComment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review.');
      }

      const updateList = (prev: Booking[]) =>
        prev.map(b =>
          b.id === activeReviewBooking.id
            ? { ...b, [ratingKey]: reviewRating, [reviewKey]: reviewComment }
            : b
        );
      setRenterBookings(updateList);
      setOwnerBookings(updateList);
      setActiveReviewBooking(null);
      alert('Thank you for your rating!');
    } catch (err: any) {
      alert(err.message || 'Failed to post review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogChallan = async () => {
    if (!activeChallanBooking) return;
    if (!challanPenaltyInput.trim()) {
      alert('Please enter a challan penalty amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${activeChallanBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challanPenalty: parseFloat(challanPenaltyInput),
          challanReason: challanReasonInput,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log challan.');
      }

      const data = await response.json();

      const updateList = (prev: Booking[]) =>
        prev.map(b =>
          b.id === activeChallanBooking.id
            ? {
                ...b,
                challanPenalty: parseFloat(challanPenaltyInput),
                challanReason: challanReasonInput,
                challanStatus: data.booking.challanStatus,
                refundAmount: data.booking.refundAmount,
              }
            : b
        );
      setRenterBookings(updateList);
      setOwnerBookings(updateList);
      setActiveChallanBooking(null);
      alert('Traffic challan violation logged successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to log challan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total earnings
  const totalEarnings = ownerBookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalCost, 0);

  const pendingRequests = ownerBookings.filter(b => b.status === 'PENDING');

  const allInspectionChecked = 
    inspectionChecks.odometerLogged && 
    inspectionChecks.damageChecked && 
    inspectionChecks.lightsVerified && 
    inspectionChecks.brakesChecked && 
    inspectionOdometer.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/feed')}>
          <ArrowLeft className="w-5 h-5 text-zinc-650" />
          <span className="font-bold text-sm text-zinc-700">Back to Society Feed</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-550 font-bold bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl uppercase">
            {user.role} • {user.society}
          </span>
          <button 
            onClick={() => router.push('/profile')}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition cursor-pointer border border-zinc-200 bg-white"
          >
            <User className="w-3.5 h-3.5" />
            My Profile
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

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        
        {/* Profile Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left">
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Welcome, {user.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage listings, approve bookings, and monitor active community trips.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 mt-8 gap-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-left">
          <button 
            onClick={() => setActiveTab('rentals')}
            className={`pb-2 border-b-2 transition cursor-pointer ${activeTab === 'rentals' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'}`}
          >
            My Rentals (As Renter)
          </button>
          
          {(user.role === 'OWNER' || user.role === 'BOTH') && (
            <>
              <button 
                onClick={() => setActiveTab('vehicles')}
                className={`pb-2 border-b-2 transition cursor-pointer ${activeTab === 'vehicles' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'}`}
              >
                My Listings (As Owner)
              </button>
              
              <button 
                onClick={() => setActiveTab('requests')}
                className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'requests' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400'}`}
              >
                Borrow Requests
                {pendingRequests.length > 0 && (
                  <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black font-mono">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* 1. Rentals Tab */}
          {activeTab === 'rentals' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight mb-4">My Booking History</h2>
              
              {renterBookings.length === 0 ? (
                <p className="text-sm text-zinc-400 font-medium">You haven't requested any vehicle rentals yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <th className="pb-3">Vehicle</th>
                        <th className="pb-3">Owner Contact</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Total Price</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 font-medium">
                      {renterBookings.map((b) => (
                        <tr key={b.id} className="text-xs">
                          <td className="py-4">
                            <strong className="block text-zinc-900">{b.vehicle.brand} {b.vehicle.model}</strong>
                            <span className="text-[10px] text-zinc-400 font-mono uppercase">{b.vehicle.type}</span>
                          </td>
                          <td className="py-4 text-zinc-500">
                            <span>{b.vehicle.owner.name}</span>
                            <span className="block text-[10px] font-mono text-zinc-400">{b.vehicle.owner.phone}</span>
                          </td>
                          <td className="py-4 text-zinc-600">
                            <span>{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="block text-[10px] text-zinc-400">{new Date(b.startTime).toLocaleDateString()}</span>
                          </td>
                          <td className="py-4 text-zinc-900">₹{b.totalCost}</td>
                          <td className="py-4">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                b.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                b.status === 'ACTIVE' ? 'bg-emerald-500 text-white' :
                                b.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-550 border border-zinc-200' :
                                'bg-zinc-50 text-zinc-400 border border-zinc-100'
                              }`}>
                                {b.status}
                              </span>
                              
                              {/* Deposit State */}
                              {b.paymentStatus === 'HELD' && (
                                <span className="block text-[9px] text-blue-700 font-semibold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50 w-max leading-tight select-none">
                                  Deposit: HELD (₹{b.depositAmount})
                                </span>
                              )}
                              {b.paymentStatus === 'PAID' && (
                                <span className="block text-[9px] text-emerald-700 font-semibold bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100/50 w-max leading-tight select-none">
                                  Deposit: REFUNDED (₹{b.refundAmount})
                                </span>
                              )}
                              
                              {/* Challan warning alert */}
                              {b.challanPenalty > 0 && (
                                <span className="block text-[9px] text-red-700 font-bold bg-red-50/50 px-2 py-0.5 rounded border border-red-100/50 w-max leading-tight animate-pulse">
                                  Challan: -₹{b.challanPenalty} ({b.challanReason})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex flex-col items-end gap-1.5 justify-end">
                              {b.status === 'APPROVED' && (
                                <button
                                  onClick={() => setActiveInspectionBooking(b)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-sm"
                                >
                                  <Play className="w-3 h-3 fill-white" />
                                  Start Trip
                                </button>
                              )}
                              {b.status === 'ACTIVE' && (
                                <button
                                  onClick={() => setActiveEndTripBooking(b)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-sm"
                                >
                                  <StopCircle className="w-3.5 h-3.5" />
                                  End Trip
                                </button>
                              )}
                              {b.status === 'COMPLETED' && b.odometerStart !== null && b.odometerEnd !== null && (
                                <span className="text-[10px] text-zinc-450 block leading-tight">
                                  Odo: {b.odometerStart} ➔ {b.odometerEnd} ({b.odometerEnd - b.odometerStart} km)
                                </span>
                              )}
                              {/* Rating Actions */}
                              {b.status === 'COMPLETED' && !b.ownerRating && (
                                <button
                                  onClick={() => {
                                    setActiveReviewBooking(b);
                                    setReviewRating(5);
                                    setReviewComment('');
                                  }}
                                  className="inline-flex items-center px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs"
                                >
                                  Rate Owner
                                </button>
                              )}
                              {b.status === 'COMPLETED' && b.ownerRating && (
                                <span className="text-[10px] font-bold text-zinc-500 block">
                                  My Review: ⭐{b.ownerRating}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Vehicles Tab (Owner Listings) */}
          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
              {/* List Action */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
                <h3 className="text-lg font-black text-zinc-950 tracking-tight">List a Vehicle</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Ready to share a car or bike with verified neighbors in your society?
                </p>
                <button
                  onClick={() => router.push('/dashboard/list-vehicle')}
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  List new Vehicle
                </button>
              </div>

              {/* Owner Stats & Listings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Panel */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Total Listings</span>
                    <span className="text-3xl font-black text-zinc-950 tracking-tight mt-1 block">{myVehicles.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Total Earnings</span>
                    <span className="text-3xl font-black text-emerald-600 tracking-tight mt-1 block">₹{totalEarnings}</span>
                  </div>
                </div>

                {/* Listing Details */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-4">My Listed Vehicles</h3>
                  {myVehicles.length === 0 ? (
                    <p className="text-sm text-zinc-400 font-medium">You haven't listed any vehicles yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {myVehicles.map(vehicle => (
                        <div key={vehicle.id} className="flex items-center justify-between border border-zinc-100 p-4 rounded-2xl bg-zinc-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border border-zinc-200 shadow-xs" style={{ backgroundColor: vehicle.colorHex }} />
                            <div>
                              <strong className="block text-zinc-900 text-sm leading-snug">{vehicle.brand} {vehicle.model}</strong>
                              <span className="text-[10px] text-zinc-400 font-mono">{vehicle.type} • {vehicle.year}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm block">₹{vehicle.pricePerHour}/hr</span>
                            <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              vehicle.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {vehicle.available ? 'Available' : 'Rented'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Requests Tab */}
          {activeTab === 'requests' && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight mb-4">Incoming Borrow Requests</h2>
              {ownerBookings.length === 0 ? (
                <p className="text-sm text-zinc-400 font-medium">No one has requested to borrow your vehicles yet.</p>
              ) : (
                <div className="space-y-4">
                  {ownerBookings.map(b => (
                    <div key={b.id} className="border border-zinc-150 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-zinc-900">{b.renter.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{b.renter.phone}</span>
                        </div>
                        <p className="text-xs text-zinc-550">
                          Wants to borrow: <strong>{b.vehicle.brand} {b.vehicle.model}</strong>
                        </p>
                        <p className="text-[10.5px] text-zinc-400 mt-1">
                          Duration: {new Date(b.startTime).toLocaleString()} ➔ {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Driver license badge */}
                        {b.renter.preVerifyDl && (
                          <div className="mt-3 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-100">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            DL Pre-Verified ({b.renter.dlFileName})
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                        <div>
                          <span className="text-[10px] text-zinc-450 font-bold block uppercase tracking-wide">Total Price</span>
                          <span className="text-base font-black text-zinc-900 block">₹{b.totalCost}</span>
                          
                          {/* Owner View Payment details */}
                          {b.paymentStatus === 'HELD' && (
                            <span className="block text-[9px] text-blue-700 font-semibold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50 mt-1 select-none">
                              Deposit: HELD (₹{b.depositAmount})
                            </span>
                          )}
                          {b.paymentStatus === 'PAID' && (
                            <span className="block text-[9px] text-emerald-700 font-semibold bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100/50 mt-1 select-none">
                              Deposit: RESOLVED (₹{b.refundAmount} ref)
                            </span>
                          )}
                        </div>

                        <div className="mt-3.5 flex flex-col sm:items-end gap-2">
                          <div className="flex gap-2">
                            {b.status === 'PENDING' ? (
                              <>
                                <button 
                                  onClick={() => handleOwnerAction(b.id, 'APPROVED')}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleOwnerAction(b.id, 'REJECTED')}
                                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                b.status === 'APPROVED' || b.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                b.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-550 border border-zinc-200' :
                                'bg-zinc-50 text-zinc-400 border border-zinc-150'
                              }`}>
                                {b.status}
                              </span>
                            )}
                          </div>

                          {/* Challan logging triggers */}
                          {(b.status === 'ACTIVE' || b.status === 'COMPLETED') && b.challanStatus === 'NONE' && (
                            <button
                              onClick={() => {
                                setActiveChallanBooking(b);
                                setChallanPenaltyInput('');
                                setChallanReasonInput('');
                              }}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs"
                            >
                              Log Challan
                            </button>
                          )}
                          {b.challanPenalty > 0 && (
                            <span className="block text-[9px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              Challan: ₹{b.challanPenalty} ({b.challanReason})
                            </span>
                          )}

                          {/* Review rating triggers */}
                          {b.status === 'COMPLETED' && !b.renterRating && (
                            <button
                              onClick={() => {
                                setActiveReviewBooking(b);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs"
                            >
                              Rate Renter
                            </button>
                          )}
                          {b.status === 'COMPLETED' && b.renterRating && (
                            <span className="text-[10px] font-bold text-zinc-500 block">
                              Renter Rated: ⭐{b.renterRating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Pre-Trip Inspection Modal (Safety Module) */}
      {activeInspectionBooking && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-scale-in">
            <button 
              onClick={() => setActiveInspectionBooking(null)}
              className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-emerald-100">
                  SAFETY CHECKLIST
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1.5 tracking-tight">
                  Verify Condition
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  Please complete the visual safety checklist for <strong>{activeInspectionBooking.vehicle.brand} {activeInspectionBooking.vehicle.model}</strong>.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Odometer Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Starting Odometer Reading</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45210"
                    value={inspectionOdometer}
                    onChange={(e) => {
                      setInspectionOdometer(e.target.value);
                      setInspectionChecks(prev => ({ ...prev, odometerLogged: e.target.value.trim().length > 0 }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Damage / Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dent on rear fender"
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-2.5 border-t border-zinc-100 pt-4 mt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={inspectionChecks.odometerLogged}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, odometerLogged: e.target.checked }))}
                      className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900" 
                    />
                    <span className="text-xs text-zinc-700 font-semibold">Odometer reading matched & documented</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={inspectionChecks.damageChecked}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, damageChecked: e.target.checked }))}
                      className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900" 
                    />
                    <span className="text-xs text-zinc-700 font-semibold">Walkaround complete: exterior damages logged</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={inspectionChecks.lightsVerified}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, lightsVerified: e.target.checked }))}
                      className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900" 
                    />
                    <span className="text-xs text-zinc-700 font-semibold">Headlights and indicators verified operational</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={inspectionChecks.brakesChecked}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, brakesChecked: e.target.checked }))}
                      className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900" 
                    />
                    <span className="text-xs text-zinc-700 font-semibold">Brakes, tires, and basic control systems check out</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleStartTrip}
                disabled={!allInspectionChecked || isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Trip...
                  </>
                ) : (
                  'Confirm & Start Trip'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Trip Modal (Safety Module) */}
      {activeEndTripBooking && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-scale-in">
            <button 
              onClick={() => setActiveEndTripBooking(null)}
              className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-blue-100">
                  END TRIP
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1.5 tracking-tight">
                  Return Vehicle
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  Log the final odometer reading for <strong>{activeEndTripBooking.vehicle.brand} {activeEndTripBooking.vehicle.model}</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Return Odometer Reading</label>
                  <input
                    type="number"
                    required
                    placeholder={`Must be greater than ${activeEndTripBooking.odometerStart || 0}`}
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteTrip}
                disabled={isSubmitting}
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing Trip...
                  </>
                ) : (
                  'Confirm & Complete Trip'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Rating Modal */}
      {activeReviewBooking && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-scale-in">
            <button 
              onClick={() => setActiveReviewBooking(null)}
              className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-zinc-200">
                  RATE TRIP
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1.5 tracking-tight">
                  Share Your Experience
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  How was your sharing experience for booking <strong>{activeReviewBooking.vehicle.brand} {activeReviewBooking.vehicle.model}</strong>?
                </p>
              </div>

              <div className="space-y-4">
                {/* Rating Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`w-10 h-10 rounded-xl border font-bold text-sm transition cursor-pointer ${
                          reviewRating >= star 
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                            : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        ⭐ {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Review Comments</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Smooth exchange, very punctual renter, vehicle runs perfectly..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handlePostReview}
                disabled={isSubmitting}
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Traffic Challan Modal */}
      {activeChallanBooking && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-scale-in">
            <button 
              onClick={() => setActiveChallanBooking(null)}
              className="absolute top-4 right-4 text-zinc-450 hover:text-zinc-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-red-100">
                  TRAFFIC CHALLAN VIOLATION
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1.5 tracking-tight">
                  Log Traffic Challan
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  Log a penalty on the renter of <strong>{activeChallanBooking.vehicle.brand} {activeChallanBooking.vehicle.model}</strong> for traffic laws violation.
                </p>
              </div>

              <div className="space-y-4">
                {/* Penalty Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Challan Fine Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000"
                    value={challanPenaltyInput}
                    onChange={(e) => setChallanPenaltyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Reason Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Reason / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Over-speeding penalty at NH-48"
                    value={challanReasonInput}
                    onChange={(e) => setChallanReasonInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleLogChallan}
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging Challan...
                  </>
                ) : (
                  'Log Challan & Deduct Deposit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
