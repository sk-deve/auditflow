import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import Header from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";

export default function Home() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [homeError, setHomeError] = useState("");

  const trustStats = [
    { label: "Avg. audit time", value: "12 sec" },
    { label: "Priority issues surfaced", value: "Top 3 instantly" },
    { label: "Built for", value: "Founders, agencies, SMBs" },
  ];

  const painPoints = [
    "Most websites lose visitors in the first few seconds because the message is not clear enough.",
    "Business owners often feel something is off, but cannot identify what is actually hurting conversions.",
    "Small gaps in trust, CTA placement, and clarity quietly reduce sales and lead quality.",
  ];

  const steps = [
    {
      title: "Paste your website",
      description: "Enter any public website URL to start the scan.",
      number: "01",
    },
    {
      title: "We scan what matters",
      description:
        "AuditFlow reviews clarity, trust, structure, CTA strength, and performance signals.",
      number: "02",
    },
    {
      title: "Get a prioritized action plan",
      description:
        "See what is hurting the site, why it matters, and what to fix first.",
      number: "03",
    },
  ];

  const benefits = [
    {
      title: "Instant expert-level analysis",
      icon: <Zap className="h-5 w-5 text-indigo-300" />,
      description:
        "Go beyond a basic score and quickly understand the issues that actually affect performance.",
    },
    {
      title: "Clear, actionable insights",
      icon: <BarChart3 className="h-5 w-5 text-indigo-300" />,
      description:
        "Get a report that is easy to read, easy to trust, and focused on decisions instead of noise.",
    },
    {
      title: "Fix what matters first",
      icon: <Target className="h-5 w-5 text-indigo-300" />,
      description:
        "Know which issues are high priority, what impact they have, and where to start improving.",
    },
    {
      title: "Understand why users do not convert",
      icon: <ShieldCheck className="h-5 w-5 text-indigo-300" />,
      description:
        "Surface hidden clarity, trust, and UX friction that can quietly weaken leads and sales.",
    },
  ];

  function handleAnalyze() {
    const cleanedUrl = websiteUrl.trim();

    if (!cleanedUrl) {
      setHomeError("Please enter a website URL");
      return;
    }

    setHomeError("");

    navigate("/scan", {
      state: { url: cleanedUrl },
    });
  }

  return (
    <>
      {/* website header call here ================== */}
      <Header />
      {/* website header end here ============== */}

      <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
        <section className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] pb-16 pt-10 sm:pt-14 md:pt-16 lg:pb-24 lg:pt-20">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className="max-w-2xl">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700 sm:text-[11px]">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
                  </span>
                  <span className="truncate">Optimization Engine</span>
                </div>

                <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:mt-8 sm:text-5xl lg:text-6xl">
                  Find what’s killing your{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    conversions
                  </span>{" "}
                  — and fix it instantly
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:mt-8 sm:text-lg sm:leading-8">
                  Analyze your website like an expert. Get clear issues,
                  priority fixes, and actionable recommendations in seconds —
                  not vague guesses.
                </p>

                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all focus-within:border-indigo-300 sm:mt-10 sm:rounded-[2rem]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center px-3 sm:px-4">
                      <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                      <input
                        type="url"
                        placeholder="Enter your website URL (e.g. example.com)"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          if (homeError) setHomeError("");
                        }}
                        className="w-full min-w-0 bg-transparent py-4 text-sm outline-none placeholder:text-slate-400 sm:text-base"
                      />
                    </div>

                    <button
                      onClick={handleAnalyze}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-indigo-600 active:scale-[0.98] sm:w-auto sm:rounded-[1.35rem] sm:px-8"
                    >
                      Run Free Audit
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {homeError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {homeError}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Clock3 className="h-4 w-4 shrink-0 text-indigo-500" />
                    Instant report
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Target className="h-4 w-4 shrink-0 text-indigo-500" />
                    Priority fixes
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500" />
                    Clear action plan
                  </div>
                </div>
              </div>

              <div className="relative lg:pl-4">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-indigo-500/15 to-violet-500/15 blur-3xl sm:-inset-6 sm:rounded-[3rem]" />

                <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(99,102,241,0.12)] sm:rounded-[2.25rem] sm:p-4">
                  <div className="overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top_right,#312e81_0%,#020617_58%)] p-4 text-white sm:rounded-[1.75rem] sm:p-7">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pb-6">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300 sm:text-[11px]">
                          Live Preview
                        </p>
                        <h2 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl">
                          example.com
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Top issue detected: slow clarity + weak trust
                        </p>
                      </div>

                      <div className="w-fit rounded-2xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-3 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-200">
                          Score
                        </p>
                        <p className="mt-1 text-3xl font-black">72</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {[
                        {
                          title: "Unclear headline",
                          status: "Low clarity",
                          dot: "bg-amber-400",
                        },
                        {
                          title: "CTA placement",
                          status: "Needs attention",
                          dot: "bg-amber-400",
                        },
                        {
                          title: "Trust signals",
                          status: "Missing",
                          dot: "bg-rose-500",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-all hover:bg-white/10"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-white/50">
                                  Priority issue surfaced in the scan
                                </p>
                              </div>
                            </div>

                            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3">
                      <PreviewStat label="Speed" value="Poor" />
                      <PreviewStat label="Trust" value="Weak" />
                      <PreviewStat label="Priority" value="High" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:mt-16 sm:rounded-[2rem] sm:p-6 md:grid-cols-3">
              {trustStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-slate-50 px-5 py-5"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950 sm:text-xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12">
              <div className="max-w-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600">
                  The Challenge
                </p>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  You don’t have a traffic problem.{" "}
                  <span className="text-slate-400">
                    You have a conversion problem.
                  </span>
                </h2>
                <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Many websites look polished on the surface but still
                  underperform. The issue is usually not traffic alone — it is
                  hidden friction in clarity, trust, and decision-making.
                </p>
              </div>

              <div className="grid gap-5">
                {painPoints.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-5 shadow-sm sm:rounded-[1.75rem] sm:px-6 sm:py-6"
                  >
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium leading-7 text-slate-700 sm:text-[15px]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Get a complete audit in under 30 seconds
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Fast enough to use immediately. Clear enough to take action
                right away.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="group relative rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl sm:rounded-[2rem] sm:p-8"
                >
                  <span className="absolute right-5 top-5 text-4xl font-black text-slate-200 transition-colors group-hover:text-indigo-100 sm:right-7 sm:text-5xl">
                    {step.number}
                  </span>
                  <h3 className="mt-8 pr-12 text-xl font-black text-slate-950 sm:mt-10 sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 lg:py-24">
          <div className="absolute inset-0 opacity-20">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(99,102,241,0.22) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl sm:mb-16">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300">
                Why this audit is different
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built to show what matters — not bury you in noise
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                AuditFlow focuses on practical clarity, conversion friction,
                trust issues, and high-priority improvements you can actually
                act on.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/10 sm:rounded-[2rem] sm:p-8"
                >
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/15">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-black text-white sm:text-xl">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_65%)] px-4 py-10 text-center shadow-[0_25px_80px_rgba(15,23,42,0.12)] sm:rounded-[3rem] sm:px-8 sm:py-14 md:px-10 lg:px-12 lg:py-16">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.7) 1px, transparent 0)",
                  backgroundSize: "26px 26px",
                }}
              />

              <div className="relative z-10 mx-auto max-w-3xl">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300">
                  Final call
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-6xl">
                  Stop guessing. Start fixing what matters.
                </h2>
                <p className="mt-6 text-base leading-7 text-indigo-100/80 sm:text-lg sm:leading-8">
                  Run your free audit and get a clear action plan in seconds.
                </p>

                <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-[1.5rem] bg-white p-2 shadow-2xl sm:mt-10 sm:flex-row sm:rounded-[1.75rem]">
                  <input
                    type="url"
                    placeholder="Paste your website URL"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      if (homeError) setHomeError("");
                    }}
                    className="w-full flex-1 rounded-[1rem] px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400 sm:rounded-[1.2rem] sm:px-5"
                  />
                  <button
                    onClick={handleAnalyze}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-indigo-600 px-6 py-4 font-bold text-white transition-all hover:bg-indigo-700 sm:w-auto sm:rounded-[1.2rem] sm:px-7"
                  >
                    Get My Report
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {homeError ? (
                  <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {homeError}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-indigo-100/70">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Instant analysis
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Prioritized fixes
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Clear recommendations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* website footer call here =============== */}
      <Footer />
    </>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}



