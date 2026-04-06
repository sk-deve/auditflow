import React from 'react';
import { 
  Zap, ShieldCheck, BarChart3, Search, 
  MousePointer2, Gauge, LayoutDashboard, Globe 
} from 'lucide-react';
import Header from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';

export function FeaturesPage() {
  const mainFeatures = [
    {
      title: "Conversion-Focused Audits",
      description: "We don't just check SEO; we analyze your H1 headlines, CTA placement, and trust signals to ensure your traffic actually converts into customers.",
      icon: <MousePointer2 className="w-6 h-6 text-indigo-600" />,
      tag: "Conversion"
    },
    {
      title: "Real-Time Performance Tracking",
      description: "Measure your actual load times and page speed ratings against industry benchmarks to reduce bounce rates and improve user experience.",
      icon: <Gauge className="w-6 h-6 text-emerald-600" />,
      tag: "Technical"
    },
    {
      title: "Advanced Revenue Leakage Detection",
      description: "Identify missing trust signals, broken forms, or weak CTAs that are costing your business money every single day.",
      icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
      tag: "Business"
    },
    {
      title: "Deep Technical Analysis",
      description: "From image alt text to meta descriptions and SSL verification, we scan the 'under-the-hood' elements that search engines care about.",
      icon: <Search className="w-6 h-6 text-blue-600" />,
      tag: "SEO"
    }
  ];

  return (
    <>
    {/* website header added here ======== */}
     <Header />
    {/* website header ended here  */}
    <div className="min-h-screen bg-[#F8FAFC] py-24 px-6 selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-600 mb-6">Core Capabilities</h2>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
            Built for developers who <br />demand professional design.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Stop guessing why your website isn't performing. Get a data-driven blueprint for your next optimization.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-32">
          {mainFeatures.map((feature, idx) => (
            <div key={idx} className="group bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-bold">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary Detailed Section */}
        <div className="bg-slate-950 rounded-[4rem] p-12 md:p-20 text-white overflow-hidden relative">
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                Manage all your audits <br />in one professional dashboard.
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Saved History", desc: "Access every report you've ever run with one click." },
                  { title: "White-label Exports", desc: "Generate professional PDFs for your clients with your own branding." },
                  { title: "Progressive Scoring", desc: "Watch your website health score increase as you fix issues." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white fill-current" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="h-4 w-32 bg-white/10 rounded-full" />
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-full bg-indigo-500/20 rounded-lg animate-pulse" />
                  <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-white/5 rounded-xl" />
                    <div className="h-16 bg-white/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Globe className="absolute -right-20 -bottom-20 w-96 h-96 text-white/5" />
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
          <button className="h-20 px-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-lg transition-all shadow-2xl shadow-indigo-200">
            Start Your First Audit Now
          </button>
          <p className="mt-6 text-slate-400 font-bold text-sm">No credit card required for free audits.</p>
        </div>

      </div>
    </div>

    {/* website footer added here  */}
    <Footer />
    </>
  );
}