import React from 'react';
import { Check, X, Zap, Shield, Star, ArrowRight } from 'lucide-react';

export function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for a quick health check of your landing page.",
      features: [
        "Basic SEO audit",
        "3 audits per month",
        "Standard load speed check",
        "Mobile responsiveness test",
      ],
      unavailable: [
        "Saved reports history",
        "Advanced UX/UI checks",
        "White-label PDF exports",
        "Priority support"
      ],
      buttonText: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "29",
      description: "For developers and marketers who need deep insights.",
      features: [
        "Unlimited audits",
        "Saved reports history",
        "Advanced conversion checks",
        "Revenue leakage detection",
        "Priority technical support",
        "Custom branding (White-label)",
      ],
      unavailable: [],
      buttonText: "Upgrade to Pro",
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Pricing Plans</h2>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          Simple pricing for <br />professional audits
        </h1>
        <p className="text-lg text-slate-500">
          Choose the plan that fits your workflow. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-24">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative p-10 rounded-[3rem] border transition-all duration-300 ${
              plan.highlight 
                ? 'bg-slate-950 border-slate-900 shadow-2xl shadow-indigo-200 scale-105 z-10' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className={`text-xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                <span className={plan.highlight ? 'text-slate-400' : 'text-slate-500'}>/month</span>
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-bold">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-500' : 'bg-emerald-100'}`}>
                    <Check className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-emerald-600'}`} />
                  </div>
                  <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                </li>
              ))}
              {plan.unavailable.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-bold opacity-40">
                  <X className={`w-5 h-5 ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={plan.highlight ? 'text-slate-500' : 'text-slate-400'}>{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full h-16 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              plan.highlight 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}>
              {plan.buttonText} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Plan Comparison Table */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3">
          <Zap className="w-6 h-6 text-indigo-600" /> Full Plan Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Features</th>
                <th className="py-4 text-sm font-black text-slate-900 text-center px-4">Free</th>
                <th className="py-4 text-sm font-black text-indigo-600 text-center px-4">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { feature: "Daily Audit Limit", free: "3/day", pro: "Unlimited" },
                { feature: "Saved Reports", free: "No", pro: "Lifetime Access" },
                { feature: "Advanced UX Checks", free: "No", pro: "Yes" },
                { feature: "Meta Description Analysis", free: "Basic", pro: "Advanced AI" },
                { feature: "White-label Exports", free: "No", pro: "Yes" },
                { feature: "Priority Support", free: "Email", pro: "24/7 Priority" },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="py-5 text-sm font-bold text-slate-600">{row.feature}</td>
                  <td className="py-5 text-sm font-bold text-slate-400 text-center px-4">{row.free}</td>
                  <td className="py-5 text-sm font-black text-slate-900 text-center px-4">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}