import React, { useState } from 'react';
import { 
  Mail, MessageSquare, ChevronDown, ChevronUp, 
  Send, HelpCircle, Globe, Zap, ShieldCheck 
} from 'lucide-react';
import Header from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';

export function ContactPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: "What does this audit check?",
      answer: "The audit performs a comprehensive scan of your landing page's critical elements, including H1-H6 hierarchy, CTA visibility, meta description quality, image alt tags, SSL status, and mobile responsiveness."
    },
    {
      question: "Is this a full SEO audit?",
      answer: "This tool focuses specifically on 'Conversion SEO'—ensuring your page is structured to rank well while also being optimized to convert visitors into customers. It is a streamlined alternative to complex, technical SEO crawlers."
    },
    {
      question: "Can I save my reports?",
      answer: "Users on the Pro plan can save unlimited reports to their dashboard, allowing you to track improvements over time and share live report links with clients or team members."
    },
    {
      question: "How is the score calculated?",
      answer: "Scores (0-100) are weighted across six categories: Clarity, CTA, Trust, Content, Structure, and Technical. We use a proprietary algorithm that prioritizes user experience and conversion signals over raw keyword density."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
    {/* website header added here ====== */}
     <Header />
    {/* website header ended here =========== */}
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Support Center</h2>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">How can we help?</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Have questions about your audit? We're here to help you optimize your website for maximum conversions.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Form & Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-600" /> Send us a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="How can we help you today?"
                    className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900 resize-none"
                  ></textarea>
                </div>

                <button className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Support Email Card */}
            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="relative z-10 text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Direct Support</p>
                <h4 className="text-xl font-black">support@auditflow.com</h4>
              </div>
              <a 
                href="mailto:support@auditflow.com"
                className="relative z-10 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-sm transition-all backdrop-blur-md"
              >
                Email Us Now
              </a>
              <Mail className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 -rotate-12" />
            </div>
          </div>

          {/* Right: FAQ Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900">Common Questions</h3>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all ${
                      activeFaq === index ? 'ring-2 ring-indigo-500 border-transparent shadow-lg shadow-indigo-50' : 'hover:border-slate-300'
                    }`}
                  >
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between gap-4"
                    >
                      <span className="text-sm font-black text-slate-900">{faq.question}</span>
                      {activeFaq === index ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    
                    {activeFaq === index && (
                      <div className="px-8 pb-8 pt-0">
                        <p className="text-sm leading-relaxed text-slate-500 font-bold border-t border-slate-50 pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] mt-8">
                <ShieldCheck className="w-8 h-8 text-indigo-600 mb-4" />
                <p className="text-sm font-black text-indigo-900 mb-2">Secure & Private</p>
                <p className="text-xs font-bold text-indigo-700/70 leading-relaxed">
                  We value your privacy. Your website data and contact information are encrypted and never shared with third parties.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    {/* website footer added here ========== */}
    <Footer />
    </>
  );
}