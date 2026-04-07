import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Key,
  Trash2,
  Camera,
  Save,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Zap,
  PlusCircle,
  Copy,
  Check,
} from "lucide-react";

const Settings = ({ user, usage, onUpgrade, onDeleteAccount }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
  }, [user]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing & Plan", icon: CreditCard },
    { id: "security", label: "Security", icon: Lock },
    { id: "api", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const firstLetter = useMemo(() => {
    return user?.fullName?.charAt(0)?.toUpperCase() || "U";
  }, [user]);

  const currentPlan = usage?.plan || user?.plan || "free";
  const auditsRemaining = usage?.auditsRemaining ?? "—";
  const auditsUsedToday = usage?.auditsUsedToday ?? 0;

  const fakeApiKey = "sk_live_••••••••••••••••••••4j9k";

  const handleSaveProfile = () => {
    console.log("Save profile:", { fullName, email });
    alert("Profile update backend will be connected next.");
  };

  const handleUpdatePassword = () => {
    console.log("Update password:", { currentPassword, newPassword });
    alert("Password update backend will be connected next.");
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(fakeApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-400">
          Manage your identity and app preferences
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Current Plan
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xl font-black capitalize text-slate-900">
              {currentPlan}
            </h3>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Audits Remaining Today
          </p>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-xl font-black text-slate-900">
              {auditsRemaining}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                activeTab === tab.id
                  ? "border border-slate-100 bg-white text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-6">
                  <div className="group relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50 text-3xl font-black text-indigo-600 transition-colors group-hover:bg-indigo-100">
                      {firstLetter}
                    </div>
                    <button className="absolute -bottom-2 -right-2 rounded-xl bg-slate-950 p-2 text-white shadow-lg transition-transform hover:scale-110">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Profile Picture
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50/30 p-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-rose-600">
                  Danger Zone
                </h4>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Permanently delete your account and all audit data.
                </p>
                <button
                  onClick={onDeleteAccount}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-black text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">
                Subscription Plan
              </h3>

              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6 md:flex-row md:items-center">
                <div>
                  <h4 className="font-black capitalize text-slate-900">
                    {currentPlan} Tier
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    {currentPlan === "free"
                      ? `You have used ${auditsUsedToday} audits today and have ${auditsRemaining} remaining.`
                      : "You currently have premium access enabled on your account."}
                  </p>
                </div>

                {currentPlan === "free" ? (
                  <button
                    onClick={onUpgrade}
                    className="rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                  >
                    Upgrade to Pro
                  </button>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">
                    Pro Active
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900">
                  Change Password
                </h3>

                <div className="grid max-w-md gap-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    onClick={handleUpdatePassword}
                    className="mt-2 w-fit rounded-2xl bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center justify-between rounded-[2rem] border border-indigo-100 bg-indigo-50 p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-indigo-900">
                      Two-Factor Authentication
                    </h4>
                    <p className="mt-1 text-xs font-bold text-indigo-700/60">
                      Add an extra layer of security.
                    </p>
                  </div>
                </div>

                <button className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white">
                  Enable
                </button>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">
                  API Access
                </h3>
                <button className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-600 transition-all hover:bg-indigo-100">
                  <PlusCircle className="h-4 w-4" />
                  Create Key
                </button>
              </div>

              <p className="text-xs font-bold text-slate-500">
                Integrate AuditFlow with your Shopify or custom site.
              </p>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Secret Key
                  </p>
                  <code className="font-mono text-xs font-bold text-slate-700">
                    {fakeApiKey}
                  </code>
                </div>

                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:underline"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">
                Notifications
              </h3>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Product updates
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    Get updates about new audit features and improvements.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Billing alerts
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    Receive notices for plan and payment changes.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;