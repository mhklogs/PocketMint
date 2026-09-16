import React, { useState, useEffect } from "react";
import {
  Wallet,
  LayoutDashboard,
  History,
  Sparkles,
  Settings,
  GraduationCap,
  Sun,
  Moon,
  UserIcon,
} from "lucide-react";
import { AIConfig, NavTab, CURRENCIES, UserProfile, FixedCosts, Transaction } from "../types";
import { useCurrency } from "../CurrencyContext";
import { DataBackup } from "./DataBackup";
import { MonthlyReport } from "./MonthlyReport";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  aiConfig: AIConfig;
  onUpdateAIConfig: (config: AIConfig) => void;
  transactionsCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  profile: UserProfile | null;
  onEditProfile: () => void;
  onImport: (data: any) => string | null;
  fixedCosts: FixedCosts;
  transactions: Transaction[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  aiConfig,
  onUpdateAIConfig,
  transactionsCount,
  darkMode,
  onToggleDarkMode,
  profile,
  onEditProfile,
  onImport,
  fixedCosts,
  transactions,
}) => {
  const { currency, setCurrency } = useCurrency();
  const professionLabel = profile
    ? profile.profession === "Custom" && profile.customProfession
      ? profile.customProfession
      : profile.profession
    : undefined;
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstallStatus("App installed!");
      setInstallPrompt(null);
    } else {
      setInstallStatus("Install cancelled");
    }
    setTimeout(() => setInstallStatus(null), 3000);
  };
  const [tempConfig, setTempConfig] = useState<AIConfig>(aiConfig);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAIConfig(tempConfig);
    setShowConfigModal(false);
  };

  const navItems = [
    {
      id: "home" as NavTab,
      label: "Home Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "history" as NavTab,
      label: "Expense History",
      icon: History,
      badge: transactionsCount > 0 ? transactionsCount : null,
    },
    {
      id: "plan" as NavTab,
      label: "Smart Budget Plan",
      icon: Sparkles,
      badge: "AI",
    },
  ];

  return (
    <>
      {/* ====================================================
          DESKTOP SIDEBAR (md: and above)
      ==================================================== */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-30 transition-colors duration-200">
        {/* Brand */}
        <div className="p-6 pb-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-zinc-950 font-bold shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              PocketMint
            </h1>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3 h-3 text-amber-600 dark:text-amber-500" />
              Student & Freelance
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-zinc-950 font-bold shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-zinc-500 dark:text-zinc-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? "bg-zinc-950 text-amber-300"
                        : item.badge === "AI"
                        ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status & Settings */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">

          {/* Profile Section */}
          <button
            onClick={onEditProfile}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-xs shrink-0">
              {profile ? profile.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {profile ? profile.name : "Set up profile"}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {profile ? professionLabel : "Tap to set name & profession"}
              </p>
            </div>
          </button>

          {/* Status Pill & Dark Mode Toggle */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            
            <button
              onClick={onToggleDarkMode}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-pointer transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* AI Config Trigger */}
          <button
            onClick={() => {
              setTempConfig(aiConfig);
              setShowConfigModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Planning Settings</span>
          </button>
        </div>
      </aside>

      {/* ====================================================
          MOBILE TOP HEADER & BOTTOM NAV (< md)
      ==================================================== */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 font-bold shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
            PocketMint
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`}
            title={isOnline ? "Online" : "Offline"}
          />
          <button
            onClick={onEditProfile}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            title="Edit profile"
          >
            <UserIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setTempConfig(aiConfig);
              setShowConfigModal(true);
            }}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-40 px-2 py-1 flex items-center justify-around shadow-lg transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-amber-500 dark:text-amber-400 font-bold" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ====================================================
          AI SETTINGS MODAL
      ==================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  AI Advisor Setup
                </h2>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400 font-bold text-xl leading-none px-2 py-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
              Connect a low-cost model (like Llama 3 via Groq or local Ollama) for realistic budgeting tips, or leave defaults.
            </p>

            {/* PWA Install */}
            {installPrompt && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium mb-2">Install PocketMint on your device</p>
                <button
                  onClick={handleInstall}
                  className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Install App
                </button>
              </div>
            )}

            {installStatus && (
              <p className="text-[11px] text-center text-emerald-600 dark:text-emerald-400">{installStatus}</p>
            )}

            {/* Data Backup & Restore */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Data Backup
              </label>
              <DataBackup onImport={onImport} />
            </div>

            {/* Monthly Report */}
            <MonthlyReport fixedCosts={fixedCosts} transactions={transactions} />

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Currency
              </label>
              <select
                value={currency.code}
                onChange={(e) => {
                  const found = CURRENCIES.find(c => c.code === e.target.value);
                  if (found) setCurrency(found);
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 cursor-pointer transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} — {c.code}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveConfig} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                  API URL Endpoint
                </label>
                <input
                  type="text"
                  placeholder="default (built-in server proxy)"
                  value={tempConfig.baseUrl}
                  onChange={(e) => setTempConfig({ ...tempConfig, baseUrl: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                  API Key (if required)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty for default server key"
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  placeholder="llama3-8b-8192"
                  value={tempConfig.model}
                  onChange={(e) => setTempConfig({ ...tempConfig, model: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-800"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/35">
                <input
                  type="checkbox"
                  id="directClient"
                  checked={tempConfig.useDirectClientFetch}
                  onChange={(e) => setTempConfig({ ...tempConfig, useDirectClientFetch: e.target.checked })}
                  className="mt-0.5 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="directClient" className="text-[11px] text-zinc-500 dark:text-zinc-300 cursor-pointer leading-tight">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">Direct Browser Fetch</span>: Check this if running local Ollama (http://localhost:11434).
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-transparent dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
