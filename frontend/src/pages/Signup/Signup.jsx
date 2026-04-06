import React, { useState } from "react";
import {
  Globe,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api"
import Header from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(data.redirectTo || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    {/* website header added here  */}
    <Header />
    {/* website header ended here  */}
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex md:w-5/12 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Globe className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                AuditFlow
              </span>
            </div>

            <h2 className="text-3xl font-black text-white mb-6 leading-tight">
              Start building <br />higher-converting <br />landing pages.
            </h2>

            <ul className="space-y-6">
              {[
                "Unlimited professional audits",
                "Revenue leakage detection",
                "Advanced UX/UI suggestions",
                "White-label report exports",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-400 font-bold text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                Enterprise Grade
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">
              Your data is encrypted and never shared with third parties.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="flex-1 p-8 md:p-16">
          <div className="max-w-sm mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Create Account
            </h1>
            <p className="text-slate-500 font-bold mb-10">
              Join 2,000+ developers optimizing today.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
              >
                {loading ? "Creating Account..." : "Create My Account"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-bold text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* website footer added here  */}
    <Footer />
    </>
  );
}