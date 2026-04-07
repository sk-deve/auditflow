import React from 'react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo Section */}
        <a href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
            <span className="text-sm font-bold tracking-wider text-white">WA</span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Audit<span className="text-indigo-600">Flow</span>
          </span>
        </a>

        {/* Center Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <a
            href="/signin"
            className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:block"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="relative inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:ring-4 hover:ring-slate-900/10 active:scale-95"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}