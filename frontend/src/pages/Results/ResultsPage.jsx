import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  FileBarChart,
  Gauge,
  Info,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;
// const API_BASE = "http://localhost:5000";

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  

  const [audit, setAudit] = useState(location.state?.audit || null);
  const [fixedIssues, setFixedIssues] = useState({});
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [openModalIssue, setOpenModalIssue] = useState(null);
  const [loadingSharedReport, setLoadingSharedReport] = useState(false);
  const [shareId, setShareId] = useState(location.state?.audit?.share?.reportId || null);
  const [isSavingShare, setIsSavingShare] = useState(false);

  const reportQueryId = searchParams.get("report");

  useEffect(() => {
    if (audit || !reportQueryId) return;

    let active = true;
    const fetchSharedReport = async () => {
      try {
        setLoadingSharedReport(true);
        const res = await fetch(`${API_BASE}/api/report/${reportQueryId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to load shared report");
        }

        if (active) {
          setAudit(data.audit);
          setShareId(data.reportId);
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      } finally {
        if (active) {
          setLoadingSharedReport(false);
        }
      }
    };

    fetchSharedReport();

    return () => {
      active = false;
    };
  }, [audit, reportQueryId]);

  useEffect(() => {
    if (!audit || shareId || isSavingShare) return;

    let active = true;

    const saveReport = async () => {
      try {
        setIsSavingShare(true);

        const res = await fetch(`${API_BASE}/api/report/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audit }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to save report");
        }

        if (active) {
          setAudit(data.audit);
          setShareId(data.reportId);
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      } finally {
        if (active) {
          setIsSavingShare(false);
        }
      }
    };

    saveReport();

    return () => {
      active = false;
    };
  }, [audit, shareId, isSavingShare]);

  if (!audit && loadingSharedReport) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200 text-center">
          <h1 className="text-2xl font-black text-slate-950">Loading report...</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            We’re fetching the shared audit report.
          </p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">No audit data found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please go back and run a new website audit.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const score = audit.score ?? 0;
  const verdict = audit.verdict || {};
  const executiveSummary = audit.executiveSummary || {};
  const highlights = audit.highlights || [];
  const groupedChecks = audit.groupedChecks || {};
  const recommendations = audit.recommendations || [];
  const scoreBreakdown = audit.scoreBreakdown || [];
  const performance = audit.performance || {};
  const performanceMetrics = audit.performanceMetrics || [];
  const analysisMeta = audit.analysisMeta || {};
  const meta = audit.meta || {};
  const whatToFixFirst = audit.whatToFixFirst || [];
  const retention = audit.retention || {};
  const exportOptions = audit.exportOptions || {};
  const speedContext = audit.speedContext || {};

  const fixedCount = useMemo(
    () => Object.values(fixedIssues).filter(Boolean).length,
    [fixedIssues]
  );

  const progressTotal =
    retention?.progress?.totalIssues || recommendations.length || 0;
  const progressRemaining = Math.max(progressTotal - fixedCount, 0);

  const getToneBadge = (value) => {
    if (value === "excellent") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (value === "good") return "bg-blue-50 text-blue-700 border border-blue-200";
    if (value === "average") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-rose-50 text-rose-700 border border-rose-200";
  };

  const getSeverityBadge = (severity) => {
    if (severity === "high") return "bg-rose-50 text-rose-700 border border-rose-200";
    if (severity === "medium") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  };

  const getEffortBadge = (effort) => {
    if (effort === "high") return "bg-slate-950 text-white";
    if (effort === "medium") return "bg-slate-200 text-slate-800";
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  };

  const getMetricStatusStyles = (status) => {
    if (status === "good") {
      return {
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
      };
    }
    if (status === "needs-improvement") {
      return {
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-500",
      };
    }
    return {
      badge: "bg-rose-50 text-rose-700 border border-rose-200",
      dot: "bg-rose-500",
    };
  };

  const getCheckVisuals = (state) => {
    switch (state) {
      case "passed":
        return {
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          dot: "bg-emerald-500",
          label: "Passed",
        };
      case "warning":
        return {
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          dot: "bg-amber-500",
          label: "Warning",
        };
      case "not-detected":
        return {
          badge: "bg-slate-100 text-slate-600 border border-slate-200",
          dot: "bg-slate-400",
          label: "Not detected",
        };
      default:
        return {
          badge: "bg-rose-50 text-rose-700 border border-rose-200",
          dot: "bg-rose-500",
          label: "Needs fix",
        };
    }
  };

  const circumference = 439.6;
  const dashOffset = circumference - (circumference * score) / 100;

  const toggleFixed = (issueId) => {
    setFixedIssues((prev) => ({
      ...prev,
      [issueId]: !prev[issueId],
    }));
  };

  const buildShareUrl = () => {
    const currentShareId = shareId || audit?.share?.reportId;
    if (!currentShareId) return null;

    const url = new URL(window.location.href);
    url.searchParams.set("report", currentShareId);
    return url.toString();
  };

  const copyShareLink = async () => {
    try {
      const shareUrl = buildShareUrl();

      if (!shareUrl) {
        alert("Report link is still being prepared.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      alert("Report link copied");
    } catch {
      alert("Unable to copy link");
    }
  };

  const downloadPdf = async () => {
    try {
      const currentShareId = shareId || audit?.share?.reportId;

      const endpoint = currentShareId
        ? `${API_BASE}/api/report/${currentShareId}/pdf`
        : `${API_BASE}/api/report/pdf`;

      const options = currentShareId
        ? { method: "GET" }
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ audit }),
          };

      const res = await fetch(endpoint, options);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to generate PDF");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanDomain = String(audit.url || "audit-report")
        .replace(/^https?:\/\//, "")
        .replace(/[^\w.-]+/g, "-");

      link.href = downloadUrl;
      link.download = `${cleanDomain}-audit-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to download PDF");
    }
  };

  const openFixModal = (issue) => {
    setOpenModalIssue(issue);
  };

  const closeFixModal = () => {
    setOpenModalIssue(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 pb-24">
      <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              Website Audit Report
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              {String(audit.url || "").replace(/^https?:\/\//, "")}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Generated {audit.generatedAt ? new Date(audit.generatedAt).toLocaleString() : "just now"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Re-run Audit
            </button>

            {exportOptions?.supportsShareLink ? (
              <button
                onClick={copyShareLink}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Copy className="h-4 w-4" />
                Copy Report Link
              </button>
            ) : null}

            {exportOptions?.supportsPdf ? (
              <button
                onClick={downloadPdf}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            ) : null}
          </div>
        </div>

        <section className="overflow-hidden rounded-[36px] bg-white border border-slate-200 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-8 md:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5" />
                Executive verdict
              </div>

              <h2 className="mt-6 max-w-3xl text-3xl font-black leading-[1.1] text-slate-950 md:text-5xl">
                {verdict.title}
              </h2>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                {verdict.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${getToneBadge(audit.scoreLabel)}`}>
                  {audit.scoreLabel}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                  Weakest area: {audit.weakestCategory}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                  Primary CTA: {meta.ctaText || "Not detected"}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <SummaryPanel label="What’s working" value={executiveSummary.whatIsWorking} />
                <SummaryPanel label="What’s hurting" value={executiveSummary.whatIsHurting} />
                <SummaryPanel label="What to do first" value={executiveSummary.whatToDoFirst} />
              </div>

              {highlights.length > 0 ? (
                <div className="mt-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Key highlights
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {highlights.map((item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-10 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <Info className="h-4 w-4" />
                  Analysis source
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                    {analysisMeta.dataSource || "Analysis source not available"}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                    Confidence: {analysisMeta.confidence}
                  </span>
                  {(analysisMeta.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#020617_60%)] p-8 md:p-10 lg:p-12 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/40">
                Aggregate score
              </p>

              <div className="mt-8 flex justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="h-44 w-44 -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="url(#scoreGradient)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute text-center">
                    <div className="text-5xl font-black">{score}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                      out of 100
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <span className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${getToneBadge(audit.scoreLabel)}`}>
                  {audit.scoreLabel}
                </span>
              </div>

              <div className="mt-8 rounded-[28px] bg-white/5 p-5 backdrop-blur-sm border border-white/10">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-indigo-300" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                      Performance snapshot
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {performance.loadTimeSeconds ?? "N/A"}s
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {performance.status || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <DarkMetric label="Words" value={meta.wordCount ?? 0} />
                <DarkMetric label="Images" value={meta.imageCount ?? 0} />
                <DarkMetric label="Requests" value={performance.totalRequests ?? 0} />
                <DarkMetric label="Page Size" value={`${performance.totalPageSizeMb ?? 0} MB`} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-7">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <TriangleAlert className="h-4 w-4" />
              What to fix first
            </div>

            <div className="mt-6 space-y-4">
              {whatToFixFirst.length > 0 ? (
                whatToFixFirst.map((item, index) => (
                  <PriorityRow
                    key={item.id}
                    item={item}
                    index={index}
                    onFix={() => openFixModal(item)}
                    onToggleFixed={() => toggleFixed(item.id)}
                    isFixed={!!fixedIssues[item.id]}
                  />
                ))
              ) : (
                <EmptyCard text="No high-priority quick wins were generated." />
              )}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-5">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <BadgeCheck className="h-4 w-4" />
              Audit progress
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-6">
              <p className="text-3xl font-black text-slate-950">
                {fixedCount} / {progressTotal}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                You’ve fixed {fixedCount} of {progressTotal} issues
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-950 transition-all duration-500"
                  style={{
                    width: `${progressTotal > 0 ? (fixedCount / progressTotal) * 100 : 0}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {progressRemaining} issue{progressRemaining === 1 ? "" : "s"} remaining
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {exportOptions?.supportsPdf ? (
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileBarChart className="h-4 w-4" />
                  Download Basic PDF
                </button>
              ) : null}

              {exportOptions?.supportsShareLink ? (
                <button
                  onClick={copyShareLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy Share Link
                </button>
              ) : null}

              {retention?.canRerunAudit ? (
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-run Audit
                </button>
              ) : null}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Eye className="h-4 w-4" />
              How to read your speed
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SpeedCard
                title={speedContext?.userVisibleLoadTime?.label || "First visible content"}
                value={speedContext?.userVisibleLoadTime?.value || "N/A"}
                status={speedContext?.userVisibleLoadTime?.premiumStatus || "Not available"}
                explanation={speedContext?.userVisibleLoadTime?.explanation}
                percentile={speedContext?.userVisibleLoadTime?.percentileText}
                highlight
              />
              <SpeedCard
                title={speedContext?.estimatedFullLoadTime?.label || "Full page load"}
                value={speedContext?.estimatedFullLoadTime?.value || "N/A"}
                status={speedContext?.estimatedFullLoadTime?.premiumStatus || "Not available"}
                explanation={speedContext?.estimatedFullLoadTime?.explanation}
                percentile={speedContext?.estimatedFullLoadTime?.percentileText}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-indigo-200 bg-indigo-50 px-5 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
                Plain-English explanation
              </p>
              <p className="mt-2 text-sm leading-7 text-indigo-900">
                Users start seeing content when First visible content appears, but the full page can keep loading afterward because of scripts, large images, and background requests.
              </p>
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDetailedAnalysis((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
              >
                {showDetailedAnalysis ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {showDetailedAnalysis ? "Hide detailed analysis" : "View detailed analysis"}
              </button>

              <button
                onClick={() => setShowFullReport((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
              >
                {showFullReport ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {showFullReport ? "Hide full report" : "Show full report"}
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Summary, score, and top fixes stay visible first. Detailed sections are collapsed by default to keep the report easy to scan.
            </p>
          </section>

          {showDetailedAnalysis ? (
            <>
              <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Gauge className="h-4 w-4" />
                  Detailed metrics
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {performanceMetrics.length > 0 ? (
                    performanceMetrics.map((metric) => (
                      <MetricCard key={metric.key} metric={metric} getMetricStatusStyles={getMetricStatusStyles} />
                    ))
                  ) : (
                    <EmptyCard text="No performance metrics available." />
                  )}
                </div>
              </section>

              <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <BarChart3 className="h-4 w-4" />
                  Category breakdown
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {scoreBreakdown.length > 0 ? (
                    scoreBreakdown.map((item) => (
                      <ScoreBreakdownCard key={item.category} item={item} />
                    ))
                  ) : (
                    <EmptyCard text="No score breakdown available." />
                  )}
                </div>
              </section>

              <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Zap className="h-4 w-4" />
                  Technical deep dive
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                  <CheckGroup title="Fundamentals" items={groupedChecks.fundamentals || []} getCheckVisuals={getCheckVisuals} />
                  <CheckGroup title="Trust & content" items={groupedChecks.trustAndContent || []} getCheckVisuals={getCheckVisuals} />
                  <CheckGroup title="Technical" items={groupedChecks.technical || []} getCheckVisuals={getCheckVisuals} />
                </div>
              </section>
            </>
          ) : null}

          {showFullReport ? (
            <section className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] border border-slate-200 lg:col-span-12">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Wrench className="h-4 w-4" />
                Full recommendations
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {recommendations.length > 0 ? (
                  recommendations.map((item) => (
                    <div key={item.id} className="rounded-[30px] bg-slate-50 p-7">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.category}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${getEffortBadge(item.effort)}`}>
                          {item.effort} effort
                        </span>
                        {item.tag ? (
                          <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] bg-slate-100 text-slate-700 border border-slate-200">
                            {item.tag}
                          </span>
                        ) : null}
                        {typeof item.scoreImpact === "number" ? (
                          <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            +{item.scoreImpact} pts
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Problem
                          </p>
                          <p className="mt-2 text-xl font-black leading-tight text-slate-950">
                            {item.problem}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Why it matters
                          </p>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {item.impact}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Fix
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-7 text-slate-800">
                            {item.fix}
                          </p>
                        </div>

                        {item.businessImpact ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600">
                              Business impact
                            </p>
                            <p className="mt-2 text-sm leading-7 text-amber-900">
                              {item.businessImpact}
                            </p>
                          </div>
                        ) : null}

                        {item.estimatedEffect ? (
                          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500">
                              Estimated effect
                            </p>
                            <p className="mt-2 text-sm leading-7 text-indigo-900">
                              {item.estimatedEffect}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                          <div className="text-xs text-slate-500">
                            Source: {item.source || "Not specified"}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openFixModal(item)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                            >
                              Fix this
                            </button>

                            {retention?.supportsIssueFixTracking ? (
                              <button
                                onClick={() => toggleFixed(item.id)}
                                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                                  fixedIssues[item.id]
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-950 text-white hover:bg-slate-800"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {fixedIssues[item.id] ? "Fixed" : "Mark Fixed"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyCard text="No recommendations available." />
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {openModalIssue ? (
        <FixIssueModal
          issue={openModalIssue}
          onClose={closeFixModal}
          onToggleFixed={() => toggleFixed(openModalIssue.id)}
          isFixed={!!fixedIssues[openModalIssue.id]}
        />
      ) : null}
    </div>
  );
}

function SummaryPanel({ label, value }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function DarkMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {text}
    </div>
  );
}

function PriorityRow({ item, index, onFix, onToggleFixed, isFixed }) {
  const severityClass =
    item.severity === "high"
      ? "bg-rose-50 text-rose-700 border border-rose-200"
      : item.severity === "medium"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  const effortClass =
    item.effort === "high"
      ? "bg-slate-950 text-white"
      : item.effort === "medium"
      ? "bg-slate-200 text-slate-800"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${severityClass}`}>
              {item.severity}
            </span>
            <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] bg-indigo-50 text-indigo-700 border border-indigo-200">
              {item.category}
            </span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${effortClass}`}>
              {item.effort} effort
            </span>
            {typeof item.estimatedScoreImprovement === "number" ? (
              <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{item.estimatedScoreImprovement} pts
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-lg font-black text-slate-950">{item.problem}</p>
            <p className="text-sm leading-7 text-slate-600">{item.impact}</p>
            <p className="text-sm font-semibold leading-7 text-slate-800">{item.fix}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={onFix}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Fix this
            </button>

            <button
              onClick={onToggleFixed}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition ${
                isFixed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isFixed ? "Marked Fixed" : "Mark Fixed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeedCard({ title, value, status, explanation, percentile, highlight = false }) {
  return (
    <div
      className={`rounded-[28px] border p-6 ${
        highlight
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">
        {status}
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{explanation}</p>
      <p className="mt-3 text-sm font-semibold text-slate-800">{percentile}</p>
    </div>
  );
}

function MetricCard({ metric, getMetricStatusStyles }) {
  const styles = getMetricStatusStyles(metric.status);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-black text-slate-950">{metric.shortLabel}</p>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 border border-slate-200">
              {metric.tag}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{metric.label}</p>
        </div>

        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${styles.badge}`}>
          {metric.premiumStatus}
        </span>
      </div>

      <p className="mt-5 text-3xl font-black text-slate-950">{metric.value}</p>
      {metric.percentileText ? (
        <p className="mt-2 text-sm font-semibold text-slate-700">{metric.percentileText}</p>
      ) : null}

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Tooltip
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{metric.tooltip}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Interpretation
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{metric.explanation}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdownCard({ item }) {
  const percent = (item.score / item.max) * 100;

  return (
    <div className="rounded-[28px] bg-slate-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-black text-slate-950">{item.label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {item.deductionReason}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-slate-950">
            {item.score}
            <span className="text-sm text-slate-400">/{item.max}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-950 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>

      {item.relatedIssueIds?.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.relatedIssueIds.slice(0, 4).map((issueId) => (
            <span
              key={issueId}
              className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600"
            >
              {issueId}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CheckGroup({ title, items, getCheckVisuals }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => {
          const visuals = getCheckVisuals(item.state);

          return (
            <div
              key={`${item.label}-${index}`}
              className="rounded-2xl bg-slate-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.details}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${visuals.dot}`} />
                </div>
              </div>

              <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${visuals.badge}`}>
                {visuals.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FixIssueModal({ issue, onClose, onToggleFixed, isFixed }) {
  const fixDetails = issue.fixDetails || {};
  const steps = fixDetails.steps || [issue.fix];
  const tools = fixDetails.tools || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-8 shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Mini solution engine
            </p>
            <h3 className="mt-2 text-3xl font-black text-slate-950">
              Fix this issue
            </h3>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid gap-5">
          <ModalPanel title="What the issue is">
            {fixDetails.explanation || issue.problem}
          </ModalPanel>

          <ModalPanel title="Why it matters">
            {fixDetails.whyItMatters || issue.impact}
          </ModalPanel>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Step-by-step fix
            </p>
            <div className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 border border-slate-200"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {tools.length > 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Recommended tools
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {fixDetails.codeHint ? (
            <div className="rounded-[24px] border border-indigo-200 bg-indigo-50 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">
                Implementation hint
              </p>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-indigo-950">
                {fixDetails.codeHint}
              </pre>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <ModalPanel title="Expected impact">
              {fixDetails.expectedImpact || issue.estimatedEffect || "Not available"}
            </ModalPanel>

            <ModalPanel title="Estimated score improvement">
              +{fixDetails.estimatedScoreImprovement ?? issue.scoreImpact ?? 0} points
            </ModalPanel>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onToggleFixed}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
              isFixed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isFixed ? "Marked Fixed" : "Mark as Fixed"}
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalPanel({ title, children }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-700">{children}</p>
    </div>
  );
}
