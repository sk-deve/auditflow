import React from 'react';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import Header from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';

export function PrivacyPage() {
  const sections = [
    {
      title: "Data Collection",
      icon: <Database className="w-5 h-5" />,
      content: "We collect information you provide directly to us, such as your email address when creating an account or contacting support. Additionally, we collect the URLs of the websites you submit for auditing."
    },
    {
      title: "How We Use Data",
      icon: <Eye className="w-5 h-5" />,
      content: "The data collected is used to generate your audit reports, improve our scoring algorithms, and provide customer support. We do not sell your personal information or website data to third parties."
    },
    {
      title: "URL Storage",
      icon: <Lock className="w-5 h-5" />,
      content: "Audit URLs are stored in our database to allow Pro users to access report history. If you use the Free tier, URLs may be cached temporarily for performance but are not permanently linked to a personal profile."
    }
  ];

  return (
    <>
    {/* website header added here ============ */}
      <Header />
    {/* website header ended here ================= */}
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-bold">Last Updated: April 1, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <section key={idx} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-indigo-600">
                {section.icon}
                <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {section.content}
              </p>
            </section>
          ))}

          <section className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl">
            <h2 className="text-xl font-black mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6" /> Contact Information
            </h2>
            <p className="text-indigo-100 font-medium mb-6">
              If you have questions about this Privacy Policy or wish to request data deletion, please contact our privacy team:
            </p>
            <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-black">
              privacy@auditflow.com
            </div>
          </section>
        </div>
      </div>
    </div>

    {/* website footer added here  */}
    <Footer />
    </>
  );
}