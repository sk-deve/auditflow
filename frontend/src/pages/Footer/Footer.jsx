import React from 'react';
import { 
  Globe, 
  MessageCircle, 
  Share2, 
  Users, 
  Mail, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Newsletter / CTA Section */}
        <div className="mb-20 p-8 md:p-12 bg-slate-950 rounded-[3rem] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="relative z-10 text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Stay ahead of the competition.
            </h3>
            <p className="text-slate-400 font-bold">
              Get weekly conversion tips and product updates.
            </p>
          </div>
          
          <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-indigo-500 transition-all min-w-[280px]"
            />
            <button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Background Graphic */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none" />
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Globe className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">AuditFlow</span>
            </div>
            <p className="text-slate-500 font-bold leading-relaxed max-w-sm mb-8">
              The professional-grade website auditor designed to help developers and business owners detect revenue leakage and optimize for conversions.
            </p>
            <div className="flex gap-4">
              {/* Replaced brand icons with safe general icons to prevent SyntaxErrors */}
              {[MessageCircle, Share2, Users].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Documentation', 'Changelog'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Support', 'Careers'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-400">
            © {currentYear} AuditFlow SaaS. All rights reserved. Built with precision.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <ShieldCheck className="w-4 h-4" /> System Status: Operational
            </div>
            <div className="h-4 w-px bg-slate-100 hidden md:block" />
            <p className="text-xs font-bold text-slate-400">English (US)</p>
          </div>
        </div>

      </div>
    </footer>
  );
}