import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  History,
  CreditCard,
  Settings as SettingsIcon,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Overview from "../Overview/Overview";
import AuditHistory from "../AuditHistory/AuditHistory";
import { PricingPage } from "../../Pricing/PricingPage";
import Settings from "../Settings/Settings";

// const API_URL = "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ activePage, setActivePage, userRole }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "history", label: "Audit History", icon: History },
    { id: "pricing", label: "Pricing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-8 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-black text-slate-950">
            AF
          </div>
          <div>
            <h1 className="text-lg font-bold">AuditFlow</h1>
            <p className="text-xs font-medium text-slate-400">
              SaaS Audit System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8">
        <p className="px-4 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 transition-all ${
                activePage === item.id
                  ? "bg-white text-slate-950 shadow-lg"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {userRole} Plan
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
            Status: Active
          </p>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title, user, setActivePage, onLogout, onNewAudit }) => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-20 mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Dashboard
        </p>
        <h2 className="text-2xl font-black capitalize text-slate-900">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewAudit}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white shadow-lg shadow-slate-900/20"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">New Audit</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdown((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 pr-4 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600">
              {user?.fullName?.charAt(0) || "U"}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-xs font-black text-slate-900">
                {user?.fullName || "User"}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {user?.email || ""}
              </p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition ${
                dropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdown && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl">
              <button
                onClick={() => {
                  setActivePage("settings");
                  setDropdown(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4" />
                Profile
              </button>

              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(null);
  const [reports, setReports] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  function getAuthToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }

  async function fetchDashboardData() {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const token = getAuthToken();

      if (!token) {
        navigate("/signin");
        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: authHeaders,
      });

      const meData = await meRes.json().catch(() => ({}));
      console.log("User response:", meData);

      if (!meRes.ok) {
        throw new Error(meData.message || "Failed to load user info");
      }

      setUser(meData.user || null);
      setUsage(meData.usage || null);

      try {
        const historyRes = await fetch(`${API_URL}/api/report/history`, {
          method: "GET",
          headers: authHeaders,
        });

        const historyData = await historyRes.json().catch(() => ({}));

        console.log("History status:", historyRes.status);
        console.log("History response:", historyData);

        if (historyRes.ok) {
          const loadedReports = historyData.reports || historyData.data || [];
          console.log("Reports loaded:", loadedReports);
          setReports(loadedReports);
        } else {
          console.error("History fetch failed:", historyData);
          setReports([]);
        }
      } catch (error) {
        console.error("History fetch error:", error);
        setReports([]);
      }
    } catch (error) {
      setDashboardError(error.message || "Failed to load dashboard");
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    navigate("/signin");
  }

  function handleNewAudit() {
    navigate("/");
  }

  function handleUpgrade() {
    navigate("/pricing");
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    alert("Delete account backend will be connected next.");
  }

  const userRole = usage?.plan || user?.plan || "free";

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return (
          <Overview
            user={user}
            usage={usage}
            reports={reports}
            setActivePage={setActivePage}
            onNewAudit={handleNewAudit}
          />
        );

      case "history":
        return <AuditHistory reports={reports} user={user} usage={usage} />;

      case "settings":
        return (
          <Settings
            user={user}
            usage={usage}
            onUpgrade={handleUpgrade}
            onDeleteAccount={handleDeleteAccount}
          />
        );

      case "pricing":
        return <PricingPage />;

      default:
        return (
          <Overview
            user={user}
            usage={usage}
            reports={reports}
            setActivePage={setActivePage}
            onNewAudit={handleNewAudit}
          />
        );
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <LayoutDashboard className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Loading dashboard...
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Fetching your profile, usage, and audit data.
          </p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-lg rounded-[2rem] border border-red-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            Unable to load dashboard
          </h2>
          <p className="mt-3 text-sm text-slate-500">{dashboardError}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={fetchDashboardData}
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Retry
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        userRole={userRole}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-10">
        <Header
          title={activePage}
          user={user}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          onNewAudit={handleNewAudit}
        />

        <main>{renderContent()}</main>
      </div>
    </div>
  );
}
