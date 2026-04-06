import React from 'react';
import { Scale, UserCheck, AlertTriangle, CreditCard } from 'lucide-react';
import Header from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';

export function TermsPage() {
  const rules = [
    {
      title: "Use of Service",
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
      content: "You agree to use AuditFlow only for lawful purposes. You may not use this tool to scrape data or attempt to disrupt the service through automated bot attacks."
    },
    {
      title: "Account Responsibility",
      icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
      content: "Users are responsible for maintaining the confidentiality of their login credentials. You are responsible for all activities that occur under your account."
    },
    {
      title: "Subscription Terms",
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      content: "Pro plans are billed on a recurring monthly basis. You may cancel at any time, but no partial refunds are provided for the remaining period of the billing cycle."
    },
    {
      title: "Limitations of Liability",
      icon: <AlertTriangle className="w-5 h-5 text-indigo-600" />,
      content: "AuditFlow provides suggestions based on automated scans. We do not guarantee specific SEO rankings or revenue increases. Use of the tool is at your own risk."
    }
  ];

  return (
    <>
    {/* website header added here ============== */}
      <Header />
    {/* website header ended here  */}
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Terms & Conditions</h1>
          <p className="text-slate-500 font-bold">Effective Date: April 1, 2026</p>
        </div>

        <div className="grid gap-6">
          {rules.map((rule, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  {rule.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900">{rule.title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium pl-2">
                {rule.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-slate-950 rounded-[2.5rem] text-center">
          <p className="text-slate-400 text-sm font-bold mb-4">
            By using AuditFlow, you agree to these terms in their entirety.
          </p>
          <button className="text-white font-black text-sm underline decoration-indigo-500 underline-offset-8">
            Download PDF Version
          </button>
        </div>
      </div>
    </div>

    {/* website footer added here ========= */}
    <Footer />
    </>
  );
}