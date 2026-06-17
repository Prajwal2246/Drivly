'use client';

import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out border-b ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-zinc-200/80 py-3.5 shadow-sm'
          : 'bg-white/0 backdrop-blur-none border-transparent py-5 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {['how-it-works', 'benefits', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => scrollTo(section)}
              className="group px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60 rounded-full transition-all duration-200 cursor-pointer select-none"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                {section === 'faq' ? 'FAQ' : section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => scrollTo('waitlist-form')}
            className="group relative inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] active:translate-y-0 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100 py-6' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className="px-4 flex flex-col gap-2">
          {['how-it-works', 'benefits', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => scrollTo(section)}
              className="w-full text-left py-2.5 px-3.5 text-sm font-medium text-zinc-600 hover:text-zinc-950 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              {section === 'faq' ? 'FAQ' : section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
          <button
            onClick={() => scrollTo('waitlist-form')}
            className="w-full mt-4 py-3 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-full text-center shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
