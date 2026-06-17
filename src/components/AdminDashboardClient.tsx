'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Download, LogOut, ChevronDown, ChevronUp, 
  Car, User, Phone, Mail, MapPin, Building, Calendar, DollarSign 
} from 'lucide-react';

interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  societyName: string;
  role: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  expectedRentalPrice: number | null;
  createdAt: string;
}

interface AdminDashboardClientProps {
  initialData: WaitlistEntry[];
}

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [data, setData] = useState<WaitlistEntry[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    const owners = data.filter(d => d.role === 'OWNER').length;
    const renters = data.filter(d => d.role === 'RENTER').length;
    const both = data.filter(d => d.role === 'BOTH').length;
    return { total, owners, renters, both };
  }, [data]);

  // Unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = new Set(data.map(d => d.city.trim()));
    return Array.from(cities).sort();
  }, [data]);

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const matchesSearch = 
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.societyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || entry.role === roleFilter;
      const matchesCity = cityFilter === 'ALL' || entry.city.trim() === cityFilter;

      return matchesSearch && matchesRole && matchesCity;
    });
  }, [data, searchQuery, roleFilter, cityFilter]);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const exportCSV = () => {
    const headers = [
      'ID', 'Name', 'Phone', 'Email', 'City', 'Society Name', 
      'Role', 'Vehicle Type', 'Brand', 'Model', 'Year', 
      'Expected Rental Price', 'Registered Date'
    ];

    const rows = filteredData.map(entry => [
      entry.id,
      `"${entry.name.replace(/"/g, '""')}"`,
      entry.phone,
      entry.email,
      `"${entry.city.replace(/"/g, '""')}"`,
      `"${entry.societyName.replace(/"/g, '""')}"`,
      entry.role,
      entry.vehicleType || '',
      entry.brand || '',
      entry.model || '',
      entry.year || '',
      entry.expectedRentalPrice || '',
      new Date(entry.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `drivly_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 font-sans p-4 sm:p-6 lg:p-8 grid-lines">
      {/* Light mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-955 font-sans">Waitlist Registrations</h1>
            <p className="text-zinc-650 text-sm mt-1 font-medium">Manage and export interest submissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-950/20"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Signups', val: stats.total, color: 'text-zinc-800 bg-zinc-50 border-zinc-200' },
            { label: 'Renters', val: stats.renters, color: 'text-blue-900 bg-blue-50/50 border-blue-100' },
            { label: 'Owners', val: stats.owners, color: 'text-emerald-900 bg-emerald-50/50 border-emerald-100' },
            { label: 'Both Roles', val: stats.both, color: 'text-purple-900 bg-purple-50/50 border-purple-100' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${stat.color} shadow-sm`}>
              <span className="block text-zinc-600 text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
              <span className="block text-3xl font-extrabold mt-2 font-mono">{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50/50 border border-zinc-200 p-4 rounded-2xl">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, email, society..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-2.5 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all shadow-sm"
            />
          </div>

          {/* Filters drop downs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Role</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-zinc-200 py-2.5 px-4 rounded-xl text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all shadow-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="RENTER">Renter Only</option>
                <option value="OWNER">Owner Only</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            {/* Filter by City */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">City</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-white border border-zinc-200 py-2.5 px-4 rounded-xl text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-all shadow-sm"
              >
                <option value="ALL">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-650 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Society</th>
                  <th className="py-4 px-6 text-center">Role</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredData.length > 0 ? (
                  filteredData.map((entry) => {
                    const isExpanded = expandedId === entry.id;
                    const hasVehicle = entry.role === 'OWNER' || entry.role === 'BOTH';

                    return (
                      <>
                        <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-zinc-900">
                            <div className="font-semibold">{entry.name}</div>
                            <div className="text-xs text-zinc-600 font-medium mt-0.5">{entry.email}</div>
                          </td>
                          <td className="py-4 px-6 font-mono text-zinc-700">{entry.phone}</td>
                          <td className="py-4 px-6 text-zinc-800">{entry.city}</td>
                          <td className="py-4 px-6 max-w-[200px] truncate text-zinc-850">{entry.societyName}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                              entry.role === 'RENTER' 
                                ? 'bg-blue-50 border border-blue-100 text-blue-800' 
                                : entry.role === 'OWNER'
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                                : 'bg-purple-50 border border-purple-100 text-purple-800'
                            }`}>
                              {entry.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-zinc-600 font-medium">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => toggleRow(entry.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950/20 ${
                                isExpanded 
                                  ? 'bg-zinc-200 border-zinc-300 text-zinc-900' 
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:border-zinc-300'
                              }`}
                              title={hasVehicle ? "View vehicle info" : "Basic info only"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
 
                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/30">
                            <td colSpan={7} className="px-6 py-6 border-b border-zinc-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm max-w-4xl">
                                {/* Contact & General */}
                                <div className="space-y-4">
                                  <h4 className="font-bold text-zinc-600 uppercase tracking-wider text-[10px] border-b border-zinc-200 pb-2">
                                    Registration Details
                                  </h4>
                                  <div className="grid grid-cols-[120px_1fr] gap-y-2.5 gap-x-2 text-zinc-850">
                                    <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Waitlist ID:</div>
                                    <div className="font-mono text-xs text-zinc-800">{entry.id}</div>
 
                                    <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Email Address:</div>
                                    <div className="flex items-center gap-1.5 text-zinc-800">
                                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                      {entry.email}
                                    </div>
 
                                    <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Society:</div>
                                    <div className="flex items-center gap-1.5 text-zinc-800">
                                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                                      {entry.societyName}
                                    </div>
 
                                    <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">City:</div>
                                    <div className="flex items-center gap-1.5 text-zinc-800">
                                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                                      {entry.city}
                                    </div>
                                  </div>
                                </div>
 
                                {/* Vehicle Specs (If owner or both) */}
                                <div className="space-y-4">
                                  <h4 className="font-bold text-zinc-600 uppercase tracking-wider text-[10px] border-b border-zinc-200 pb-2">
                                    Vehicle Information
                                  </h4>
                                  {hasVehicle ? (
                                    <div className="grid grid-cols-[140px_1fr] gap-y-2.5 gap-x-2 text-zinc-850">
                                      <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Vehicle Type:</div>
                                      <div className="flex items-center gap-1.5 text-zinc-800">
                                        <Car className="w-3.5 h-3.5 text-zinc-600" />
                                        <span className="capitalize font-bold">{entry.vehicleType?.toLowerCase()}</span>
                                      </div>
 
                                      <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Brand & Model:</div>
                                      <div className="text-zinc-800">{entry.brand} • {entry.model}</div>
 
                                      <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Manufacture Year:</div>
                                      <div className="flex items-center gap-1.5 text-zinc-800">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                        {entry.year}
                                      </div>
 
                                      <div className="text-zinc-600 font-semibold text-xs uppercase tracking-wider">Expected Price:</div>
                                      <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                                        <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
                                        {entry.expectedRentalPrice?.toLocaleString()} / month
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-zinc-550 text-xs italic font-medium">
                                      User registered as a Renter only. No vehicle details listed.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-zinc-600 italic font-medium">
                      No registrations matched your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

