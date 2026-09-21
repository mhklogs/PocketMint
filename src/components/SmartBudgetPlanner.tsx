import { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle, Lightbulb, Target } from "lucide-react";
import { AIConfig, FixedCosts, SmartPlanResult, Transaction } from "../types";
import { fetchSmartAIPlan, generateRuleBasedPlan, generateGoalPlan, formatCurrency } from "../utils";
import { useCurrency } from "../CurrencyContext";
import { useProfile } from "../ProfileContext";

interface SmartBudgetPlannerProps {
  fixedCosts: FixedCosts;
  transactions: Transaction[];
  aiConfig: AIConfig;
  latestPlan: SmartPlanResult | null;
  onSavePlan: (plan: SmartPlanResult) => void;
}

export function SmartBudgetPlanner({
  fixedCosts,
  transactions,
  aiConfig,
  latestPlan,
  onSavePlan,
}: SmartBudgetPlannerProps) {
  const { currency } = useCurrency();
  const { profile } = useProfile();
  const professionLabel = profile
    ? profile.profession === "Custom" && profile.customProfession
      ? profile.customProfession
      : profile.profession
    : undefined;
  const [loading, setLoading] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  const handleGenerateTips = async () => {
    setLoading(true);
    try {
      const plan = await fetchSmartAIPlan(fixedCosts, transactions, aiConfig, currency, professionLabel);
      onSavePlan(plan);
    } catch {
      const rulePlan = generateRuleBasedPlan(fixedCosts, transactions, currency, professionLabel);
      onSavePlan(rulePlan);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGoalPlan = () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    const goalPlan = generateGoalPlan(fixedCosts, transactions, goalInput.trim(), currency, professionLabel);
    onSavePlan(goalPlan);
    setLoading(false);
  };

  const travelSpend = transactions
    .filter((t) => t.type === "expense" && t.category === "Travel/Pursuits")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = fixedCosts.rent + fixedCosts.grocery;

  const sourceLabel = latestPlan?.source === "gemini_api" ? "Gemini AI"
    : latestPlan?.source === "ai_live" ? "AI Financial Advisor"
    : latestPlan?.source === "goal_plan" ? "Goal Savings Plan"
    : "Financial Consultant";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-50 dark:text-zinc-900 shrink-0 mt-0.5 font-bold">
            <Lightbulb className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Financial Consultant
              </h2>
              {profile && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  {professionLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed max-w-xl">
              Ask about your finances or tell me what you want to save for.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder='e.g. "I want to buy a bike for 60,000" or "Save for a laptop"'
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-5 py-2.5 text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleGenerateGoalPlan()}
          />
          <button
            onClick={handleGenerateGoalPlan}
            disabled={loading || !goalInput.trim()}
            className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white disabled:opacity-50 text-zinc-50 font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Goal Plan</span>
          </button>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Describe your goal with or without a target amount
          </span>
          <button
            onClick={handleGenerateTips}
            disabled={loading}
            className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Budget Tips
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-xs">
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Income / Allowance</span>
          <span className="font-bold font-mono text-zinc-900 dark:text-zinc-50 text-sm">{formatCurrency(fixedCosts.income, currency)}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Rent + Groceries</span>
          <span className="font-bold font-mono text-zinc-900 dark:text-zinc-50 text-sm">{formatCurrency(totalFixed, currency)}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Travel & Fun Spend</span>
          <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">{formatCurrency(travelSpend, currency)}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] block">Goal Method</span>
          <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs mt-0.5 block">50/30/20 Rule</span>
        </div>
      </div>

      {/* Tips Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xs transition-colors">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            {sourceLabel}
          </span>
          {latestPlan?.timestamp && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {latestPlan.timestamp}
            </span>
          )}
        </div>

        {!latestPlan ? (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
            Type a goal above or click "Budget Tips" for a financial analysis.
          </div>
        ) : (
          <div className="space-y-3">
            {latestPlan.bullets.map((bullet, idx) => {
              const cleanTip = bullet.replace(/^[•*\-]\s*/, "");
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cleanTip}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
