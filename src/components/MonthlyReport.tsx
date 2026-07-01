import { useState } from "react";
import { FileText, RefreshCw, Sparkles, AlertCircle, Lightbulb } from "lucide-react";
import { FixedCosts, Transaction, Currency } from "../types";
import { formatCurrency, DEFAULT_CURRENCY } from "../utils";
import { useCurrency } from "../CurrencyContext";
import { useProfile } from "../ProfileContext";

interface MonthlyReportProps {
  fixedCosts: FixedCosts;
  transactions: Transaction[];
}

export function MonthlyReport({ fixedCosts, transactions }: MonthlyReportProps) {
  const { currency } = useCurrency();
  const { profile } = useProfile();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const professionLabel = profile
    ? profile.profession === "Custom" && profile.customProfession
      ? profile.customProfession
      : profile.profession
    : undefined;

  const totalIncome = fixedCosts.income + transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0) + fixedCosts.rent + fixedCosts.grocery;
  const topCategories = Object.entries(
    transactions.filter(t => t.type === "expense").reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const sym = currency.symbol;
    const prompt = `You are a professional financial consultant. The user is${professionLabel ? ` a ${professionLabel}` : ""}.

Generate a concise monthly financial report (4-5 sentences):
- Total income: ${sym}${totalIncome}
- Total expenses: ${sym}${totalExpenses}
- Net savings: ${sym}${totalIncome - totalExpenses}
- Top spending: ${topCategories.map(([c, a]) => `${c} (${sym}${a})`).join(", ") || "none"}
- Fixed costs: Rent ${sym}${fixedCosts.rent}, Groceries ${sym}${fixedCosts.grocery}

Give a professional, honest assessment of their financial health this month and one specific recommendation.`;

    try {
      const res = await fetch("/api/ai/budget-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: fixedCosts.income,
          rent: fixedCosts.rent,
          grocery: fixedCosts.grocery,
          totalVariable: transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0),
          categorizedSpend: {},
          recentTransactions: transactions.slice(0, 5),
          aiConfig: { baseUrl: "default", apiKey: "", model: "gemini-2.0-flash" },
          currency: { code: currency.code, symbol: currency.symbol },
          profession: professionLabel || "",
          _reportMode: true,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.plan) {
        setReport(data.plan);
      } else {
        throw new Error("Empty response");
      }
    } catch {
      const net = totalIncome - totalExpenses;
      const top = topCategories.map(([c, a]) => `${c} (${sym}${a})`).join(", ") || "none";
      setReport(
        `Monthly Financial Summary${professionLabel ? ` for ${professionLabel}` : ""}:\n` +
        `Income: ${sym}${totalIncome} | Expenses: ${sym}${totalExpenses} | Net: ${sym}${net}\n` +
        `Top spending: ${top}\n` +
        `Fixed costs: Rent ${sym}${fixedCosts.rent}, Groceries ${sym}${fixedCosts.grocery}\n` +
        `${net >= 0 ? "You're in positive territory. Continue tracking to build better habits." : "Expenses exceed income — review discretionary spending and consider cutting non-essentials."}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Monthly Report</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">AI-generated summary of your finances</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Could not generate report. Gemini API may need configuration.</span>
        </div>
      )}

      {report ? (
        <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Gemini AI Report</span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{report}</p>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500">
          {transactions.length === 0 && fixedCosts.income === 0
            ? "Add your income and transactions first, then generate a report."
            : "Click generate for an AI summary of your monthly finances."}
        </div>
      )}
    </div>
  );
}
