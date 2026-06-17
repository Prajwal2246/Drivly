'use client';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-white border-t border-zinc-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-200">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 cursor-pointer group w-max" onClick={scrollToTop}>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center group-hover:border-zinc-300 transition-colors shadow-sm">
                <svg className="w-5 h-5 text-zinc-950" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
                  <path 
                    d="M6.5 18V6H12c3.3 0 6 2.7 6 6s-2.7 6-6 6H6.5z" 
                    stroke="currentColor" 
                    strokeWidth="2.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-zinc-950 tracking-tight">
                Driv<span className="text-zinc-700 font-medium">ly</span>
              </span>
            </div>
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-medium max-w-xs">
              Closed-network peer-to-peer vehicle sharing exclusively for verified gated residential societies.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold">
              <li>
                <button onClick={() => scrollTo('how-it-works')} className="text-zinc-650 hover:text-zinc-950 transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('benefits')} className="text-zinc-650 hover:text-zinc-950 transition-colors cursor-pointer">
                  Benefits
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="text-zinc-650 hover:text-zinc-950 transition-colors cursor-pointer">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Trust & Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold">
              <li>
                <a href="#verification" onClick={(e) => { e.preventDefault(); scrollTo('verification'); }} className="text-zinc-650 hover:text-zinc-950 transition-colors">
                  Gated Trust Code
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-zinc-650 hover:text-zinc-950 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-zinc-650 hover:text-zinc-950 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Contact & Support</h4>
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-medium">
              Want Drivly in your society? Reach out to our community launch team:
            </p>
            <div className="text-xs sm:text-sm font-bold text-zinc-950">
              <a href="mailto:support@drivly.co" className="hover:underline">
                support@drivly.co
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-zinc-500 text-xs font-medium text-center sm:text-left">
            © {new Date().getFullYear()} Drivly. All rights reserved. Registered for private gated community sharing.
          </div>
          <div className="text-zinc-400 text-[10px] font-bold tracking-wider uppercase select-none flex items-center gap-2">
            <span>Security Checked</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span>Aadhaar Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
