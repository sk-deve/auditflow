import React, { useMemo } from "react";
import {
  Zap,
  ShieldAlert,
  TrendingUp,
  Globe,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Clock3,
  Target,
} from "lucide-react";

const Overview = ({ user, usage, reports = [], setActivePage, onNewAudit }) => {
  const firstName = user?.fullName?.split(" ")[0] || "Builder";
  const safeReports = Array.isArray(reports) ? reports : [];
  const recentReports = safeReports.slice(0, 5);

  const totalReports = safeReports.length;

  const averageScore = useMemo(() => {
    if (!safeReports.length) return 0;

    const validScores = safeReports
      .map((item) => Number(item?.score ?? item?.audit?.score ?? 0))
      .filter((num) => !Number.isNaN(num));

    if (!validScores.length) return 0;

    const total = validScores.reduce((sum, value) => sum + value, 0);
    return Math.round(total / validScores.length);
  }, [safeReports]);

  const totalIssuesFound = useMemo(() => {
    if (!safeReports.length) return 0;

    return safeReports.reduce((sum, item) => {
      const recommendationCount =
        item?.recommendations?.length ||
        item?.audit?.recommendations?.length ||
        0;

      return sum + recommendationCount;
    }, 0);
  }, [safeReports]);

  const bestScore = useMemo(() => {
    if (!safeReports.length) return 0;

    return safeReports.reduce((best, item) => {
      const score = Number(item?.score ?? item?.audit?.score ?? 0);
      return score > best ? score : best;
    }, 0);
  }, [safeReports]);

  const weakestCount = useMemo(() => {
    if (!safeReports.length) return 0;

    return safeReports.filter((item) => {
      const score = Number(item?.score ?? item?.audit?.score ?? 0);
      return score < 70;
    }).length;
  }, [safeReports]);

  const usageText =
    usage?.plan === "free"
      ? `${usage?.auditsUsedToday || 0}/2 today`
      : "Unlimited";

  const stats = [
    {
      label: "Health Score",
      value: `${averageScore}/100`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Issues Found",
      value: String(totalIssuesFound),
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "Usage",
      value: usageText,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const lastAuditLabel =
    recentReports.length > 0
      ? `You have ${totalReports} saved audit${totalReports === 1 ? "" : "s"} in your account.`
      : "Run your first audit to start building your dashboard.";

  const auditsRemainingText =
    usage?.plan === "free"
      ? `You have ${usage?.auditsRemaining ?? 0} free audit${
          usage?.auditsRemaining === 1 ? "" : "s"
        } remaining today.`
      : "Your Pro plan gives you unlimited audits.";

  function getAuditUrl(auditItem) {
    return (
      auditItem?.url ||
      auditItem?.audit?.url ||
      auditItem?.siteUrl ||
      "Website audit"
    );
  }

  function getAuditScore(auditItem) {
    return Number(auditItem?.score ?? auditItem?.audit?.score ?? 0);
  }

  function getAuditDate(auditItem) {
    return (
      auditItem?.createdAt ||
      auditItem?.generatedAt ||
      auditItem?.audit?.generatedAt ||
      null
    );
  }

  function getScoreClass(score) {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-indigo-600";
    if (score >= 55) return "text-amber-600";
    return "text-rose-600";
  }

  function formatAuditDate(value) {
    if (!value) return "Recently";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleDateString();
  }

  const topInsight =
    safeReports.length > 0
      ? averageScore < 70
        ? `Your average audit score is ${averageScore}/100, which suggests there are still meaningful improvement opportunities across your websites.`
        : `Your average audit score is ${averageScore}/100, which shows a solid baseline with room for targeted optimization.`
      : "Once audits are saved to your account, this section will surface quick patterns and priority opportunities.";

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl md:p-12">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-2 max-w-2xl font-medium leading-8 text-slate-400">
              {lastAuditLabel} {auditsRemainingText}
            </p>
          </div>

          <button
            onClick={onNewAudit}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 font-black transition hover:bg-indigo-400 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            New Website Audit
          </button>
        </div>

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group rounded-[2rem] border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-2xl ${stat.bg} p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>

              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Live Data <TrendingUp className="h-3 w-3" />
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <h3 className="mt-1 text-3xl font-black text-slate-900">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Recent Audits
            </h3>

            <button
              onClick={() => setActivePage?.("history")}
              className="text-xs font-black text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((auditItem, idx) => {
                const score = getAuditScore(auditItem);
                const auditUrl = getAuditUrl(auditItem);
                const createdAt = getAuditDate(auditItem);

                return (
                  <div
                    key={auditItem?._id || auditItem?.reportId || idx}
                    className="flex items-center justify-between rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-slate-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                        <Globe className="h-5 w-5 text-slate-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-bold text-slate-900 md:max-w-[320px]">
                          {auditUrl}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          <span>{formatAuditDate(createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <div className={`text-sm font-black ${getScoreClass(score)}`}>
                        {score}%
                      </div>

                      <button
                        onClick={() => setActivePage?.("history")}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        title="View history"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">No audits yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Run your first audit to start building your report history.
                </p>

                <button
                  onClick={onNewAudit}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Run First Audit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50 p-8">
          <h3 className="text-lg font-black uppercase tracking-tight text-indigo-900">
            Quick Insights
          </h3>

          <p className="mt-2 text-sm font-medium text-indigo-700/80">
            {topInsight}
          </p>

          <div className="mt-8 space-y-3">
            {safeReports.length > 0 ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  <p className="text-xs font-bold text-slate-700">
                    Average score across saved audits: {averageScore}/100
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <p className="text-xs font-bold text-slate-700">
                    Total recommendations found: {totalIssuesFound}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <p className="text-xs font-bold text-slate-700">
                    Best saved audit score: {bestScore}/100
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <p className="text-xs font-bold text-slate-700">
                    Audits below 70 score: {weakestCount}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-slate-700">
                    Current plan: {(usage?.plan || user?.plan || "free").toUpperCase()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm opacity-80">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <p className="text-xs font-bold text-slate-500">
                    No saved reports yet
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm opacity-70">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <p className="text-xs font-bold text-slate-500">
                    Health score updates after your first saved audit
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm opacity-60">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <p className="text-xs font-bold text-slate-500">
                    Insights will appear once reports are connected to your account
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onNewAudit}
            className="mt-8 w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-indigo-600 shadow-sm transition hover:bg-indigo-600 hover:text-white"
          >
            Run New Diagnostics
          </button>
        </div>
      </div>

      {safeReports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              <Target className="h-4 w-4" />
              Saved Reports
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">
              {totalReports}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total audits currently saved in your account.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              <TrendingUp className="h-4 w-4" />
              Best Score
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">
              {bestScore}/100
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Highest score among your saved audits.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              <ShieldAlert className="h-4 w-4" />
              Low Scores
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">
              {weakestCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Saved audits currently below a 70 score.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Overview;