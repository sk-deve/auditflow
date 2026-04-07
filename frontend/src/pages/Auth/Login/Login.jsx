import React, { useState } from "react";
import { Globe, Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/api"
import { Footer } from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";

export function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const { data } = await api.post("/auth/login", formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(data.redirectTo || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
      <div className="max-w-md w-full bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-bold">
            Enter your details to access your audits.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
              >
                Forgot?
              </a>
            </div>
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
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group mt-4"
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm font-bold text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>

    {/* website footer added here  */}
    <Footer />
    </>
  );
}