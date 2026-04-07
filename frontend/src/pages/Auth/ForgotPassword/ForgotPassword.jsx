import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";

// const API_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-black text-white text-xl shadow-xl">
                AF
              </div>
              <div className="text-left">
                <h1 className="text-xl font-black text-slate-900 leading-none">
                  AuditFlow
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Recovery System
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50">
            {!isSubmitted ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Forgot Password?
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    No worries! Enter your email and we'll send you a recovery
                    link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Email Address
                    </label>

                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                      {error}
                    </div>
                  ) : null}

                  <button
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-500">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Check your email
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    We've sent a password reset link to <br />
                    <span className="text-slate-900 underline font-black">
                      {email}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setError("");
                  }}
                  className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Didn't receive it? Try again
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPassword;