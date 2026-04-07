import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { Footer } from "../../../components/Footer/Footer";

// const API_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
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
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
              <span className="font-black text-slate-900 tracking-tight">
                Secure Reset
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="text-2xl font-black text-slate-900">
                    Set New Password
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    Choose a strong password with at least 6 characters.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      New Password
                    </label>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Confirm Password
                    </label>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    {error}
                  </div>
                ) : null}

                <button
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-lg disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-500">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Password Updated
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    Your account is now secure. You can log in with your new
                    password.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/signin")}
                  className="w-full rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResetPassword;