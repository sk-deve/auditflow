import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  Globe,
  Search,
  Layout,
  CheckCircle2,
  Clock3,
  Sparkles,
  Activity,
  ShieldCheck,
} from "lucide-react";
import Header from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export function RunAuditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // const API_URL = import.meta.env.VITE_API_URL;
  const API_URL = "http://localhost:5000";

  const url = location.state?.url || "";
  const [progress, setProgress] = useState(10);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const scanSteps = useMemo(
    () => [
      "Connecting to website and loading the page",
      "Reading title, headline, and meta description",
      "Checking CTA strength, structure, and content depth",
      "Reviewing trust signals, contact info, and image accessibility",
      "Measuring page speed and generating final report",
    ],
    []
  );

  const stepSubtext = useMemo(
    () => [
      "Resolving the domain and opening the page safely.",
      "Extracting high-value page metadata and messaging signals.",
      "Evaluating conversion clarity and page structure.",
      "Looking for trust cues, contact details, and accessibility gaps.",
      "Finalizing technical analysis and preparing your report.",
    ],
    []
  );

  const rotatingInsights = useMemo(
    () => [
      "Weak headlines often lower engagement in the first few seconds.",
      "Missing trust signals can quietly reduce conversion rates.",
      "Slow load speed often hurts both trust and bounce rate.",
      "Stronger CTA placement usually improves action-taking.",
      "Clear structure helps users understand what to do next.",
    ],
    []
  );

  function getAuthToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }

  useEffect(() => {
    if (!url) {
      navigate("/");
      return;
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return Math.min(prev + 12, 92);
      });

      setActiveStep((prev) => {
        if (prev >= scanSteps.length - 1) return prev;
        return prev + 1;
      });
    }, 900);

    async function runAudit() {
      try {
        setError("");
        setErrorCode("");

        const token = getAuthToken();

        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/audit`, {
          method: "POST",
          headers,
          body: JSON.stringify({ url }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401 && data.code === "AUTH_REQUIRED") {
            setErrorCode("AUTH_REQUIRED");
            throw new Error("Please log in to run an audit.");
          }

          if (
            response.status === 403 &&
            data.code === "FREE_PLAN_LIMIT_REACHED"
          ) {
            setErrorCode("FREE_PLAN_LIMIT_REACHED");
            throw new Error("Free limit reached. Upgrade to continue.");
          }

          setErrorCode("GENERIC_ERROR");
          throw new Error(data.message || data.error || "Audit failed");
        }

        setProgress(100);
        setActiveStep(scanSteps.length - 1);

        setTimeout(() => {
          navigate("/result", {
            state: {
              audit: data,
            },
          });
        }, 700);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        clearInterval(progressTimer);
      }
    }

    runAudit();

    return () => clearInterval(progressTimer);
  }, [url, navigate, scanSteps.length, API_URL]);

  const renderedSteps = scanSteps.map((label, index) => {
    let status = "pending";
    if (index < activeStep) status = "done";
    if (index === activeStep) status = "active";
    if (progress === 100) status = "done";
    return { label, status, subtext: stepSubtext[index] };
  });

  const currentInsight =
    rotatingInsights[Math.min(activeStep, rotatingInsights.length - 1)];

  const currentTask =
    scanSteps[Math.min(activeStep, scanSteps.length - 1)] || scanSteps[0];

  const estimatedSecondsRemaining =
    progress >= 100 ? 0 : Math.max(2, Math.ceil((100 - progress) / 12));

  if (error) {
    const isAuthError = errorCode === "AUTH_REQUIRED";
    const isLimitError = errorCode === "FREE_PLAN_LIMIT_REACHED";

    return (
      <>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f5f7fb_100%)] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(90deg,#6366f1_0%,#8b5cf6_100%)] px-8 py-6 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              AuditFlow Access
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {isAuthError
                ? "Log in to run your audit"
                : isLimitError
                ? "Free plan limit reached"
                : "Unable to continue"}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85">
              {isAuthError
                ? "Create a free account to unlock 2 audits per day, save reports, and track your audit history."
                : isLimitError
                ? "You’ve used your 2 free audits for today. Upgrade your plan to continue running more website audits."
                : error}
            </p>
          </div>

          <div className="p-8 md:p-10">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              {isAuthError ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Free plan
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        2 audits/day
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Save reports
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        Included
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Dashboard
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        Coming next
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/login")}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Log In
                    </button>

                    <button
                      onClick={() => navigate("/register")}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      Create Free Account
                    </button>
                  </div>

                  <button
                    onClick={() => navigate("/")}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back Home
                  </button>
                </>
              ) : isLimitError ? (
                <>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600">
                      Free plan usage
                    </p>
                    <p className="mt-2 text-sm leading-7 text-amber-900">
                      Your free account includes 2 audits per day. Upgrade to
                      continue scanning without waiting for the daily reset.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/pricing")}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Upgrade Plan
                    </button>

                    <button
                      onClick={() => navigate("/")}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back Home
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">
                      Scan error
                    </p>
                    <p className="mt-2 text-sm leading-7 text-red-900">
                      {error}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/")}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Try Another URL
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      </>
    );
  }

  return (
    <>
     {/* add website header here  */}
       <Header />
      {/* header end here  */}
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f5f7fb_100%)] text-slate-900 selection:bg-indigo-100">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <div className="overflow-hidden rounded-[2.75rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#a855f7_0%,#6366f1_50%,#8b5cf6_100%)]" />
            <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-indigo-100 blur-3xl opacity-60" />
            <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-violet-100 blur-3xl opacity-50" />

            <div className="relative px-8 pb-10 pt-12 md:px-12 md:pt-14">
              <div className="mx-auto max-w-3xl text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
                  <Loader2 className="h-9 w-9 animate-spin opacity-90" />
                  <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full border-4 border-white bg-indigo-400 animate-pulse" />
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Engine Scan
                </div>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Running your{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    website audit
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  We’re analyzing clarity, trust, structure, SEO, and performance
                  to generate your report. This usually takes 10–20 seconds.
                </p>
              </div>

              <div className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <Globe className="h-5 w-5 text-indigo-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Target domain
                        </p>
                        <p className="mt-2 break-all text-lg font-black text-slate-950">
                          {url}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Current task: {currentTask}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-700">
                          Scan progress
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-indigo-600">
                            {progress}%
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                            complete
                          </span>
                        </div>
                      </div>

                      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-stripe_1s_linear_infinite]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <InfoTile
                      icon={<Clock3 className="h-4 w-4 text-indigo-600" />}
                      label="Estimated time left"
                      value={
                        progress >= 100
                          ? "Finalizing..."
                          : `${estimatedSecondsRemaining}s`
                      }
                    />
                    <InfoTile
                      icon={<Activity className="h-4 w-4 text-indigo-600" />}
                      label="Live insight"
                      value={currentInsight}
                      small
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-4">
                {renderedSteps.map((step, idx) => (
                  <div
                    key={step.label}
                    className={`rounded-[1.6rem] border p-5 transition-all duration-500 ${
                      step.status === "active"
                        ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_10px_30px_rgba(99,102,241,0.10)]"
                        : step.status === "done"
                        ? "border-emerald-100 bg-white"
                        : "border-slate-100 bg-white/70 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                            step.status === "done"
                              ? "bg-emerald-500 text-white"
                              : step.status === "active"
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : step.status === "active" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-base font-black ${
                              step.status === "active"
                                ? "text-slate-950"
                                : step.status === "done"
                                ? "text-slate-900"
                                : "text-slate-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`mt-1 text-sm leading-6 ${
                              step.status === "active"
                                ? "text-slate-600"
                                : step.status === "done"
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {step.subtext}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex self-start rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] sm:self-center ${
                          step.status === "done"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : step.status === "active"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {step.status === "done"
                          ? "Completed"
                          : step.status === "active"
                          ? "In progress"
                          : "Queued"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-px border-t border-slate-100 bg-slate-100 md:grid-cols-2">
            <div className="bg-white p-8 md:p-10">
              <div className="mb-6 flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-600" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  What we’re checking
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Headline clarity",
                  "CTA strength",
                  "Meta description",
                  "Trust proof",
                  "Contact info",
                  "Content depth",
                  "Page structure",
                  "Load speed",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-600"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/70 p-8 md:p-10">
              <div className="mb-6 flex items-center gap-2">
                <Layout className="h-4 w-4 text-indigo-600" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Your report will include
                </h3>
              </div>

              <div className="grid gap-4">
                {[
                  "Weighted category performance scores",
                  "Conversion friction and trust issue detection",
                  "SEO and accessibility validation",
                  "Prioritized action plan with recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm font-bold text-slate-700"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-indigo-500" />
                    <span className="leading-6">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium italic text-slate-400">
          Tip: High-quality audits usually take between 10–20 seconds to finalize.
        </p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes move-stripe {
          from { background-position: 0 0; }
          to { background-position: 1rem 0; }
        }
      `,
        }}
      />
    </div>
    {/* footer call here  */}
    <Footer />
    </>
  );
}

function InfoTile({ icon, label, value, small = false }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
      </div>
      <p
        className={`mt-3 font-bold text-slate-900 ${
          small ? "text-sm leading-6" : "text-lg"
        }`}
      >
        {value}
      </p>
    </div>
  );
}