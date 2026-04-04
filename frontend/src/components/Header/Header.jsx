import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-20">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
            <span className="text-sm font-bold tracking-wider text-white">WA</span>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Audit<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {['Home', 'Features', 'Pricing', 'Resources'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:block">
            Sign in
          </button>
          <button className="relative inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:ring-4 hover:ring-slate-900/10 active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}