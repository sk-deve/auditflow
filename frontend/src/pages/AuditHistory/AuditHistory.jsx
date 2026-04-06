import React, { useMemo, useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  RefreshCw,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuditHistory = ({ reports = [], user, usage }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [localReports, setLocalReports] = useState(Array.isArray(reports) ? reports : []);

  useEffect(() => {
    setLocalReports(Array.isArray(reports) ? reports : []);
  }, [reports]);

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

  function getIssueCount(auditItem) {
    return (
      auditItem?.recommendations?.length ||
      auditItem?.audit?.recommendations?.length ||
      0
    );
  }

  function getStatusFromScore(score) {
    if (score >= 85) return "Passing";
    if (score >= 60) return "Warning";
    return "Critical";
  }

  function formatDate(value) {
    if (!value) return "Recently";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  const filteredAudits = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) return localReports;

    return localReports.filter((auditItem) =>
      getAuditUrl(auditItem).toLowerCase().includes(normalized)
    );
  }, [localReports, searchTerm]);

  const deleteAudit = (id) => {
    setLocalReports((prev) =>
      prev.filter((audit) => (audit?._id || audit?.id || audit?.reportId) !== id)
    );
  };

  const rerunAudit = (auditItem) => {
    navigate("/scan", {
      state: {
        url: getAuditUrl(auditItem),
      },
    });
  };

  const viewAudit = (auditItem) => {
    const auditPayload = auditItem?.audit || auditItem;

    navigate("/result", {
      state: {
        audit: auditPayload,
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <HistoryIcon className="h-6 w-6 text-indigo-600" />
            Audit Logs
          </h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-500">
            Records of all past website scans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 md:w-64"
            />
          </div>

          <button
            className="rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-600 transition-colors hover:bg-slate-50"
            title="Filter"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
        {filteredAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Website Identity
                  </th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Health Score
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Scan Date
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredAudits.map((auditItem, index) => {
                  const id = auditItem?._id || auditItem?.id || auditItem?.reportId || index;
                  const url = getAuditUrl(auditItem);
                  const score = getAuditScore(auditItem);
                  const date = formatDate(getAuditDate(auditItem));
                  const issues = getIssueCount(auditItem);
                  const status = getStatusFromScore(score);

                  return (
                    <tr
                      key={id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-slate-100 text-slate-400 transition-all group-hover:border-slate-100 group-hover:bg-white group-hover:shadow-sm">
                            <Globe className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-black text-slate-900 md:max-w-[280px]">
                              {url}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                              {issues} potential issue{issues === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex h-10 w-16 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                          {score}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{date}</p>
                      </td>

                      <td className="px-8 py-6">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                            status === "Passing"
                              ? "bg-emerald-50 text-emerald-600"
                              : status === "Critical"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {status === "Passing" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <ShieldAlert className="h-3 w-3" />
                          )}
                          {status}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => rerunAudit(auditItem)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:border-indigo-100 hover:text-indigo-600"
                            title="Re-run Scan"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => viewAudit(auditItem)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:border-indigo-100 hover:text-indigo-600"
                            title="View Details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteAudit(id)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all hover:border-rose-100 hover:text-rose-600"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="group-hover:hidden">
                          <MoreVertical className="ml-auto h-5 w-5 text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
              <HistoryIcon className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">
              {searchTerm ? "No matching audits found" : "No audits found"}
            </h4>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {searchTerm
                ? "Try a different website URL search."
                : "Start by running a new website scan."}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-8 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Showing {filteredAudits.length} Result{filteredAudits.length === 1 ? "" : "s"}
          </p>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-400 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-900 hover:bg-slate-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditHistory;