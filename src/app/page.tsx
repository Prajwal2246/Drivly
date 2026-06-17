import Header from '@/components/Header';
import WaitlistForm from '@/components/WaitlistForm';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import InteractiveSharingHub from '@/components/InteractiveSharingHub';
import {
  Car, Key, PiggyBank, Sparkles, MapPin, Clock, ArrowRight, ShieldCheck, CircleDollarSign,
  Search, ArrowUpRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-zinc-900 overflow-x-hidden selection:bg-zinc-900 selection:text-white font-sans grid-lines">
      {/* Light mask to fade grid lines at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none -z-10" />

      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 max-w-5xl leading-[1.1]">
          Private Vehicle Sharing <br className="hidden sm:inline" />
          For <span className="text-zinc-500 font-medium italic">Gated Communities</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-zinc-600 max-w-2xl leading-relaxed">
          Rent cars and bikes strictly within your gated community. 100% private, secure, and trust-verified exclusively for verified neighbors.
        </p>

        {/* CTA & Trust signals */}
        <div className="mt-10 flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#waitlist-form"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white font-bold text-base rounded-full transition-all duration-200 shadow-xl shadow-zinc-950/10 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Join the Waitlist
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 font-bold text-base rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Learn How It Works
            </a>
          </div>

          {/* Three-column micro-badge row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3.5 text-xs text-zinc-600 font-medium select-none bg-zinc-50/50 hover:bg-zinc-50/80 border border-zinc-200/60 hover:border-zinc-300 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-default">
            <div className="flex items-center gap-2 group/item">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 group-hover/item:scale-110 transition-transform duration-200" strokeWidth={2.5} />
              <span className="group-hover/item:text-zinc-900 transition-colors duration-200">Verified Neighbors Only</span>
            </div>
            
            <div className="hidden sm:block w-px h-4 bg-zinc-200/80" />
            
            <div className="flex items-center gap-2 group/item">
              <svg 
                className="w-4.5 h-4.5 text-emerald-600 group-hover/item:scale-110 transition-transform duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                aria-hidden="true" 
                role="img"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="group-hover/item:text-zinc-900 transition-colors duration-200">Aadhaar & DL Checked</span>
            </div>
            
            <div className="hidden sm:block w-px h-4 bg-zinc-200/80" />
            
            <div className="flex items-center gap-2 group/item">
              <svg 
                className="w-4.5 h-4.5 text-emerald-600 group-hover/item:scale-110 transition-transform duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                aria-hidden="true" 
                role="img"
              >
                <path d="M6 3h12" />
                <path d="M6 8h12" />
                <path d="m6 13 9 9" />
                <path d="M6 13h3a5 5 0 0 0 0-10" />
              </svg>
              <span className="group-hover/item:text-zinc-900 transition-colors duration-200">Passive Monthly Revenue</span>
            </div>
          </div>
        </div>

        {/* Mockup Container with Above-the-Fold Optimization */}
        <div className="mt-12 md:mt-16 w-full max-w-5xl relative">
          {/* Subtle Radial Glow Behind Mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-gradient-to-tr from-blue-200/20 via-indigo-200/25 to-emerald-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />

          <InteractiveSharingHub />
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-b border-zinc-200/80 bg-zinc-50/70 scroll-reveal">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="block text-xs font-bold uppercase tracking-widest text-zinc-500">The Context</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Why Are We Letting Assets Sit Idle?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 border border-zinc-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            <div className="p-8 sm:p-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-955">95% Idle Time</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Most personal vehicles sit unused in parking spots for over 28 days of the month, doing nothing but losing value.
              </p>
            </div>

            <div className="p-8 sm:p-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-955">Constant Expenses</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Even when parked, owners continue paying heavy costs for EMI, insurance, society parking fees, and routine maintenance.
              </p>
            </div>

            <div className="p-8 sm:p-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-955">Under-Served Demand</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Neighbors and society residents frequently require access to vehicles for temporary work commutes, weekend trips, or errands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Workflow</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              How Drivly Works
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Owners */}
            <div className="bg-zinc-100/40 border border-zinc-200/50 p-2.5 rounded-[32px]">
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-zinc-100/80 flex flex-col justify-between h-full gap-8">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md uppercase tracking-wider">SOCIETY</span>
                      Vehicle Owners
                    </h3>
                    <span className="text-[8.5px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Earn Passively
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'List Vehicle', desc: 'Provide details, set custom pricing, and configure your society availability calendar.', icon: Car },
                      { step: '02', title: 'Approve Requests', desc: 'Review booking requests from verified neighbors in your society and approve at your convenience.', icon: ShieldCheck },
                      { step: '03', title: 'Earn Income', desc: 'Hand over keys securely, and receive monthly rental payments directly to your bank account.', icon: CircleDollarSign },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="group bg-zinc-50/40 border border-zinc-200/40 rounded-[20px] p-4.5 flex gap-4 transition-all duration-300 hover:scale-[1.01] hover:bg-zinc-50 hover:border-zinc-300/60 hover:shadow-sm text-left">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/60 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Icon className="w-4.5 h-4.5 text-emerald-600" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-black text-zinc-900 mb-1 flex items-center justify-between">
                              {item.title}
                              <span className="font-mono text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full select-none">
                                STEP {item.step}
                              </span>
                            </h4>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <a
                  href="#waitlist-form"
                  className="group/btn w-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 text-[10px] font-bold py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-300 cursor-pointer"
                >
                  <span>Register Your Vehicle</span>
                  <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform duration-300">
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" strokeWidth={2.5} />
                  </div>
                </a>
              </div>
            </div>

            {/* For Renters */}
            <div className="bg-zinc-100/40 border border-zinc-200/50 p-2.5 rounded-[32px]">
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] border border-zinc-100/80 flex flex-col justify-between h-full gap-8">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-lg font-black text-zinc-955 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md uppercase tracking-wider">SOCIETY</span>
                      Renters
                    </h3>
                    <span className="text-[8.5px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Save Money
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Search Vehicle', desc: 'Browse available cars and bikes listed by verified owners inside your community.', icon: Search },
                      { step: '02', title: 'Book & Pick Up', desc: 'Reserve the vehicle for your required hours or days, pick up keys, and unlock nearby.', icon: Key },
                      { step: '03', title: 'Return to Spot', desc: 'Drop the keys back and park the vehicle in its designated society parking slot.', icon: MapPin },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="group bg-zinc-50/40 border border-zinc-200/40 rounded-[20px] p-4.5 flex gap-4 transition-all duration-300 hover:scale-[1.01] hover:bg-zinc-50 hover:border-zinc-300/60 hover:shadow-sm text-left">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/60 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Icon className="w-4.5 h-4.5 text-blue-600" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-black text-zinc-900 mb-1 flex items-center justify-between">
                              {item.title}
                              <span className="font-mono text-[8.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-full select-none">
                                STEP {item.step}
                              </span>
                            </h4>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <a
                  href="#waitlist-form"
                  className="group/btn w-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 text-[10px] font-bold py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-300 cursor-pointer"
                >
                  <span>Search Gated Vehicles</span>
                  <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform duration-300">
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" strokeWidth={2.5} />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-b border-zinc-200/80 bg-zinc-50/70 scroll-reveal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Core Value</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-zinc-955 tracking-tight">
              Designed To Benefit Everyone
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Owner Benefits */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
                Owner Benefits
              </h3>

              <ul className="divide-y divide-zinc-100">
                {[
                  { title: 'Earn Money Passively', desc: 'Offset vehicle EMI and ownership costs by sharing it when you don\'t need it.', icon: PiggyBank },
                  { title: 'Flexible Availability', desc: 'You decide exactly when your car or bike is available for rent.', icon: Clock },
                  { title: 'Reduce Ownership Cost', desc: 'Let your vehicle pay for its own insurance and society parking fees.', icon: Car },
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={idx} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Icon className="w-4.5 h-4.5 text-zinc-800" />
                      </div>
                      <div>
                        <strong className="block text-zinc-950 font-bold text-base">{benefit.title}</strong>
                        <span className="text-sm text-zinc-650 leading-relaxed mt-1.5 block">{benefit.desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Renter Benefits */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
                Renter Benefits
              </h3>

              <ul className="divide-y divide-zinc-100">
                {[
                  { title: 'Highly Affordable Rates', desc: 'Rent at a fraction of commercial rates. No hidden subscription or deposit fees.', icon: CircleDollarSign },
                  { title: 'Convenient & Nearby', desc: 'Pick up and return vehicles from your own society parking basement.', icon: MapPin },
                  { title: 'Flexible Bookings', desc: 'Reserve vehicles for short errands (hourly) or multi-day road trips.', icon: Sparkles },
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={idx} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Icon className="w-4.5 h-4.5 text-zinc-800" />
                      </div>
                      <div>
                        <strong className="block text-zinc-955 font-bold text-base">{benefit.title}</strong>
                        <span className="text-sm text-zinc-650 leading-relaxed mt-1.5 block">{benefit.desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gated Trust / Verification Section & Waitlist Form */}
      <section id="waitlist-form" className="py-24 px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Gated Trust</span>
              <h3 className="text-3xl font-extrabold text-zinc-950 mt-2 leading-tight">
                How We Verify <br /> Gated Neighbors
              </h3>
              <p className="text-zinc-600 text-sm mt-4 leading-relaxed">
                Drivly operates as a closed network. Your vehicle is only visible to, and rent-eligible by, verified members of your own gated society.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Aadhaar & PAN Verification',
                  desc: 'Every account is mapped to a verified government ID, establishing legally checked digital identities before booking.'
                },
                {
                  step: '02',
                  title: 'Active License Screening',
                  desc: 'We check the state transport database to confirm active driving credentials and clean records for all renters.'
                },
                {
                  step: '03',
                  title: 'Residency Authentication',
                  desc: 'Verification via society maintenance bills, ownership deeds, or lease agreements checks that zero outsiders enter your pool.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4.5 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 mb-1">{item.title}</h4>
                    <p className="text-zinc-600 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <FAQ />

      <Footer />
    </div>
  );
}