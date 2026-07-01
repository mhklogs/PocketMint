import { useState, useEffect, useCallback } from "react";
import { FixedCosts, Transaction, AIConfig, SmartPlanResult, NavTab, Currency, CURRENCIES, UserProfile, Profession } from "./types";
import { CurrencyContext } from "./CurrencyContext";
import { ProfileContext } from "./ProfileContext";
import { Sidebar } from "./components/Sidebar";
import { FixedCostsCard } from "./components/FixedCostsCard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { SmartBudgetPlanner } from "./components/SmartBudgetPlanner";
import { BudgetCharts } from "./components/BudgetCharts";
import { ProfileModal } from "./components/ProfileModal";
import { MonthlyReport } from "./components/MonthlyReport";
import { ToastProvider } from "./components/Toast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { generateRuleBasedPlan, formatCurrency } from "./utils";
import { ArrowRight, PlusCircle, TrendingUp, TrendingDown, DollarSign, PieChart, History, Sparkles, UserIcon } from "lucide-react";

const STORAGE_KEYS = {
  FIXED_COSTS: "pocketmint_fixed_costs_min",
  TRANSACTIONS: "pocketmint_transactions_min",
  AI_CONFIG: "pocketmint_ai_config_min",
  LATEST_PLAN: "pocketmint_latest_plan_min",
};

const DEFAULT_FIXED_COSTS: FixedCosts = {
  income: 0,
  rent: 0,
  grocery: 0,
};

const DEFAULT_AI_CONFIG: AIConfig = {
  baseUrl: "default",
  apiKey: "",
  model: "llama3-8b-8192",
  useDirectClientFetch: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("pocketmint_dark_mode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("pocketmint_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("pocketmint_currency");
      if (saved) {
        const parsed = JSON.parse(saved);
        return CURRENCIES.find(c => c.code === parsed.code) || CURRENCIES[0];
      }
    } catch {}
    return CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem("pocketmint_currency", JSON.stringify(currency));
  }, [currency]);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("pocketmint_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; destructive?: boolean } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void, destructive?: boolean) => {
    setConfirmDialog({ title, message, onConfirm, destructive });
  };

  const handleImport = useCallback((data: any): string | null => {
    try {
      if (!data || !data.version) return "Invalid backup file.";
      const ls = localStorage;
      if (data.profile) ls.setItem("pocketmint_profile", JSON.stringify(data.profile));
      if (data.fixedCosts) ls.setItem("pocketmint_fixed_costs_min", JSON.stringify(data.fixedCosts));
      if (data.transactions) ls.setItem("pocketmint_transactions_min", JSON.stringify(data.transactions));
      if (data.aiConfig) ls.setItem("pocketmint_ai_config_min", JSON.stringify(data.aiConfig));
      if (data.currency) ls.setItem("pocketmint_currency", JSON.stringify(data.currency));
      return null;
    } catch (e) {
      return "Failed to restore backup.";
    }
  }, []);

  const professionLabel = profile
    ? profile.profession === "Custom" && profile.customProfession
      ? profile.customProfession
      : profile.profession
    : undefined;

  useEffect(() => {
    if (profile) {
      localStorage.setItem("pocketmint_profile", JSON.stringify(profile));
    }
  }, [profile]);

  const handleSaveProfile = (name: string, profession: Profession, customProfession?: string) => {
    setProfile({ name, profession, customProfession: profession === "Custom" ? customProfession : undefined });
    setShowProfileModal(false);
  };

  const [fixedCosts, setFixedCosts] = useState<FixedCosts>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIXED_COSTS);
      return saved ? JSON.parse(saved) : DEFAULT_FIXED_COSTS;
    } catch {
      return DEFAULT_FIXED_COSTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aiConfig, setAIConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_AI_CONFIG;
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  });

  const [latestPlan, setLatestPlan] = useState<SmartPlanResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LATEST_PLAN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIXED_COSTS, JSON.stringify(fixedCosts));
  }, [fixedCosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    if (latestPlan) {
      localStorage.setItem(STORAGE_KEYS.LATEST_PLAN, JSON.stringify(latestPlan));
    }
  }, [latestPlan]);

  const handleAddTransaction = (txData: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
  };

  const requestClearAll = () => {
    showConfirm(
      "Clear All Transactions",
      "This will permanently delete all logged transactions. This action cannot be undone.",
      () => { setTransactions([]); setConfirmDialog(null); },
      true
    );
  };

  // Financial Calculations
  const totalVariableSpend = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const extraIncomeLogged = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMonthlyEarnings = fixedCosts.income + extraIncomeLogged;
  const totalFixedExpenses = fixedCosts.rent + fixedCosts.grocery;
  const totalMonthlyExpenses = totalFixedExpenses + totalVariableSpend;
  const netRemaining = totalMonthlyEarnings - totalMonthlyExpenses;

  // Group variable spend by category for the summary table
  const spendByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const recentFive = transactions.slice(0, 5);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
    <ProfileContext.Provider value={{ profile, setProfile: (p) => {
      setProfile(p);
      localStorage.setItem("pocketmint_profile", JSON.stringify(p));
    } }}>
    <ToastProvider>
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col md:flex-row pb-16 md:pb-0 transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        aiConfig={aiConfig}
        onUpdateAIConfig={setAIConfig}
        transactionsCount={transactions.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        profile={profile}
        onEditProfile={() => setShowProfileModal(true)}
        onImport={handleImport}
        fixedCosts={fixedCosts}
        transactions={transactions}
      />

      {/* Profile Setup Modal (shown on first launch or via sidebar) */}
      {(showProfileModal || !profile) && (
        <ProfileModal
          initialName={profile?.name || ""}
          initialProfession={profile?.profession || "Student"}
          initialCustomProfession={profile?.customProfession || ""}
          onSave={handleSaveProfile}
          onClose={profile ? () => setShowProfileModal(false) : undefined}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        {/* =========================================================
            TAB 1: HOME OVERVIEW
        ========================================================= */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {profile ? `${profile.name}'s Dashboard` : "Home Overview"}
                  </h1>
                  {profile && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      {professionLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {profile
                    ? `Realistic monthly snapshot of your ${professionLabel?.toLowerCase()} cashflow.`
                    : "Realistic monthly snapshot of your cashflow."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("plan")}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-amber-900/35"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span>AI Budget Plan</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-zinc-700"
                >
                  <History className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>History ({transactions.length})</span>
                </button>
              </div>
            </div>

            {/* Getting Started Banner (when no data entered yet) */}
            {transactions.length === 0 && fixedCosts.income === 0 && fixedCosts.rent === 0 && fixedCosts.grocery === 0 && (
              <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">👋</span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {profile ? `Welcome, ${profile.name}!` : "Welcome to PocketMint!"}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Let&apos;s get started. Set your monthly income and fixed costs below, then start logging transactions.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    1. Set your earnings &amp; rent
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    2. Log expenses &amp; income
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    3. Get AI budget advice
                  </span>
                </div>
              </div>
            )}

            {/* Section 1: Financial Snapshot */}
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Financial Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs transition-colors duration-200">
                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-450">Total Earnings</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totalMonthlyEarnings)}
                </span>
                <span className="text-[11px] text-zinc-450 dark:text-zinc-400 mt-0.5 block truncate">
                  Base allowance + gigs
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs transition-colors duration-200">
                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-450">Fixed Essentials</span>
                  <DollarSign className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totalFixedExpenses)}
                </span>
                <span className="text-[11px] text-zinc-450 dark:text-zinc-400 mt-0.5 block truncate">
                  Rent & groceries
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs transition-colors duration-200">
                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-450">Variable Spending</span>
                  <TrendingDown className="w-4 h-4 text-amber-650" />
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-500">
                  {formatCurrency(totalVariableSpend)}
                </span>
                <span className="text-[11px] text-zinc-450 dark:text-zinc-400 mt-0.5 block truncate">
                  Trips, food, textbooks
                </span>
              </div>

              <div className={`border rounded-2xl p-4 shadow-2xs transition-colors duration-200 ${
                netRemaining >= 0 
                  ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Net Leftover</span>
                  <PieChart className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                </div>
                <span className={`text-xl sm:text-2xl font-bold font-mono ${
                  netRemaining >= 0 ? "text-zinc-950 dark:text-zinc-50" : "text-red-700 dark:text-red-400"
                }`}>
                  {netRemaining < 0 ? "-" : "+"}{formatCurrency(Math.abs(netRemaining))}
                </span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 block font-medium truncate">
                  {netRemaining >= 0 ? "Available savings" : "Over budget deficit"}
                </span>
              </div>
            </div>

            {/* Section 2: Budget Breakdown */}
            <div className="flex items-center gap-2 pt-2">
              <span className="w-1 h-5 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Budget Breakdown</h2>
            </div>
            {/* Grid Row: Table of Earnings & Expenses + Recent Txs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN (7 cols): CHARTS & TABLE OF MONTHLY EARNING & EXPENSES */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visual SVG Donut & Progress Charts */}
                <BudgetCharts fixedCosts={fixedCosts} transactions={transactions} />

                {/* TABLE OF MONTHLY EARNINGS & EXPENSES */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Table of Monthly Earnings & Expenses
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Detailed breakdown comparing standard vs actual logged flow.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">
                      {currency.code} ({currency.symbol})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          <th className="pb-2.5 pl-2">Category / Item</th>
                          <th className="pb-2.5">Type</th>
                          <th className="pb-2.5 text-right pr-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm font-medium">
                        
                        {/* Income Section */}
                        <tr className="bg-emerald-50/30 dark:bg-emerald-950/10">
                          <td className="py-3 pl-2 text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Monthly Allowance / Paycheck
                          </td>
                          <td className="py-3 text-emerald-700 dark:text-emerald-450 text-xs font-semibold">Base Earning</td>
                          <td className="py-3 text-right pr-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            +{formatCurrency(fixedCosts.income)}
                          </td>
                        </tr>

                        {extraIncomeLogged > 0 && (
                          <tr className="bg-emerald-50/20 dark:bg-emerald-950/5">
                            <td className="py-3 pl-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Logged Freelance & Gig Work
                            </td>
                            <td className="py-3 text-emerald-700 dark:text-emerald-450 text-xs">Extra Earning</td>
                            <td className="py-3 text-right pr-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              +{formatCurrency(extraIncomeLogged)}
                            </td>
                          </tr>
                        )}

                        {/* Fixed Expenses */}
                        <tr>
                          <td className="py-3 pl-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Monthly Rent / Dorm
                          </td>
                          <td className="py-3 text-zinc-500 dark:text-zinc-400 text-xs">Fixed Essential</td>
                          <td className="py-3 text-right pr-2 font-mono text-zinc-900 dark:text-zinc-100">
                            -{formatCurrency(fixedCosts.rent)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3 pl-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Average Groceries & Food
                          </td>
                          <td className="py-3 text-zinc-500 dark:text-zinc-400 text-xs">Fixed Essential</td>
                          <td className="py-3 text-right pr-2 font-mono text-zinc-900 dark:text-zinc-100">
                            -{formatCurrency(fixedCosts.grocery)}
                          </td>
                        </tr>

                        {/* Variable Spend Summary */}
                        {Object.entries(spendByCategory).map(([cat, amt]) => (
                          <tr key={cat}>
                            <td className="py-3 pl-2 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                              {cat}
                            </td>
                            <td className="py-3 text-zinc-400 dark:text-zinc-500 text-xs">Logged Variable</td>
                            <td className="py-3 text-right pr-2 font-mono text-zinc-700 dark:text-zinc-200">
                              -{formatCurrency(amt as number)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-zinc-200 dark:border-zinc-800 font-bold text-xs sm:text-sm bg-zinc-50/80 dark:bg-zinc-900">
                          <td className="py-3.5 pl-2 text-zinc-900 dark:text-zinc-50">Total Monthly Flow</td>
                          <td className="py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">Net Balance</td>
                          <td className={`py-3.5 text-right pr-2 font-mono text-base ${
                            netRemaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}>
                            {netRemaining < 0 ? "-" : "+"}{formatCurrency(Math.abs(netRemaining))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (5 cols): RECENT TRANSACTIONS PREVIEW */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors duration-200">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Recent Transactions
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Latest {recentFive.length} activity items.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 flex items-center gap-1 cursor-pointer bg-amber-50 dark:bg-amber-955/30 hover:bg-amber-100 dark:hover:bg-amber-950/40 px-2.5 py-1 rounded-lg transition-colors border border-transparent dark:border-amber-900/30"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentFive.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                    No transactions yet. Add your first item below!
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2">
                    {recentFive.map((t) => {
                      const isExp = t.type === "expense";
                      return (
                        <div key={t.id} className="pt-2 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-3">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {t.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-550 mt-0.5">
                              <span>{t.category}</span>
                              <span>•</span>
                              <span className="font-mono">{t.date}</span>
                            </div>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${
                            isExp ? "text-zinc-900 dark:text-zinc-100" : "text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {isExp ? "-" : "+"}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("history")}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/10 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>Open Full Expense History Table</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Section 3: Actions */}
            <div className="flex items-center gap-2 pt-2">
              <span className="w-1 h-5 rounded-full bg-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</h2>
            </div>
            {/* Bottom Row: Quick Add Transaction & Essentials Config */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-sm mb-1">
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                  <span>Log New Expense or Income</span>
                </div>
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>

              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-sm mb-1">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span>Adjust Base Allowance & Essentials</span>
                </div>
                <FixedCostsCard costs={fixedCosts} onChangeCosts={setFixedCosts} />
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 2: EXPENSE HISTORY (SEPARATE SECTION IN SIDEBAR)
        ========================================================= */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Expense & Earning History
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Search, filter by category, or delete logged items. Stored locally in browser.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-transparent dark:border-zinc-700"
              >
                ← Back to Overview
              </button>
            </div>

            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onClearAll={requestClearAll}
            />

            <div className="max-w-xl">
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: SMART BUDGET PLAN (SEPARATE SECTION IN SIDEBAR)
        ========================================================= */}
        {activeTab === "plan" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Smart Budget Plan
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  AI-assisted guidance (Llama 3 / Ollama) & 50/30/20 realistic budgeting breakdown.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-transparent dark:border-zinc-700"
              >
                ← Back to Overview
              </button>
            </div>

            <SmartBudgetPlanner
              fixedCosts={fixedCosts}
              transactions={transactions}
              aiConfig={aiConfig}
              latestPlan={latestPlan}
              onSavePlan={setLatestPlan}
            />

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs max-w-2xl transition-colors duration-200">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                How the 50/30/20 Rule Works for Students
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
                <span className="block mb-1.5">
                  • <strong className="text-zinc-900 dark:text-zinc-100">50% Needs</strong>: Dorm rent, basic groceries, transit passes, required textbooks.
                </span>
                <span className="block mb-1.5">
                  • <strong className="text-zinc-900 dark:text-zinc-100">30% Wants</strong>: Weekend roadtrips, coffee shop sessions, gaming subscriptions, dining out.
                </span>
                <span className="block">
                  • <strong className="text-zinc-900 dark:text-zinc-100">20% Savings</strong>: Emergency fund for unexpected laptop repairs or post-graduation buffer.
                </span>
              </p>
            </div>
          </div>
        )}

      </main>
    </div>

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          destructive={confirmDialog.destructive}
        />
      )}
    </ToastProvider>
    </ProfileContext.Provider>
    </CurrencyContext.Provider>
  );
}
