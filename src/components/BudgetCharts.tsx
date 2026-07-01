import React, { useState } from "react";
import { FixedCosts, Transaction } from "../types";
import { formatCurrency } from "../utils";
import { useCurrency } from "../CurrencyContext";
import { PieChart, BarChart2, CheckCircle2, AlertTriangle, HelpCircle, Tag } from "lucide-react";

interface BudgetChartsProps {
  fixedCosts: FixedCosts;
  transactions: Transaction[];
}

export const BudgetCharts: React.FC<BudgetChartsProps> = ({
  fixedCosts,
  transactions,
}) => {
  const { currency } = useCurrency();
  const [activeChartTab, setActiveChartTab] = useState<"donut" | "progress" | "categories">("donut");
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const { rent, grocery, income: baseIncome } = fixedCosts;

  const extraIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = baseIncome + extraIncome;

  // Classify transactions
  const variableExpenses = transactions.filter((t) => t.type === "expense");

  // Needs: Rent + Grocery + essential categories
  const needsFromTransactions = variableExpenses
    .filter((t) =>
      ["Transport & Gas", "Bills & Utilities", "Health & Fitness", "Education/Courses"].includes(t.category)
    )
    .reduce((acc, curr) => acc + curr.amount, 0);
  const actualNeeds = rent + grocery + needsFromTransactions;

  // Wants: Discretionary spend categories
  const actualWants = variableExpenses
    .filter((t) =>
      ["Travel/Pursuits", "Dining Out", "Shopping", "Entertainment", "Other"].includes(t.category)
    )
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Savings: Leftover
  const totalExpenses = actualNeeds + actualWants;
  const actualSavings = Math.max(0, totalIncome - totalExpenses);

  // Group variable spend by category for categories tab
  const categorySummary = Object.entries(
    variableExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([category, amount]) => ({ category, amount: amount as number }))
    .sort((a, b) => b.amount - a.amount);

  const totalVariableSpend = variableExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Targets
  const targetNeeds = totalIncome * 0.5;
  const targetWants = totalIncome * 0.3;
  const targetSavings = totalIncome * 0.2;

  // Total denominator for percentages
  const denominator = Math.max(totalIncome, totalExpenses) || 1;
  const needsPct = actualNeeds / denominator;
  const wantsPct = actualWants / denominator;
  const savingsPct = actualSavings / denominator;

  // SVG Donut Calculations
  const radius = 38;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const segments = [
    {
      name: "Needs (50% target)",
      id: "needs",
      value: actualNeeds,
      pct: needsPct,
      color: "stroke-amber-500",
      fillColor: "bg-amber-500",
      target: targetNeeds,
      offset: 0,
    },
    {
      name: "Wants (30% target)",
      id: "wants",
      value: actualWants,
      pct: wantsPct,
      color: "stroke-zinc-800",
      fillColor: "bg-zinc-800",
      target: targetWants,
      offset: -(needsPct * circumference),
    },
    {
      name: "Savings (20% target)",
      id: "savings",
      value: actualSavings,
      pct: savingsPct,
      color: "stroke-emerald-500",
      fillColor: "bg-emerald-500",
      target: targetSavings,
      offset: -((needsPct + wantsPct) * circumference),
    },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
            50/30/20 Budget Breakdown
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Visualize your cashflow splits and see how they compare to targets.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto gap-0.5">
          <button
            onClick={() => setActiveChartTab("donut")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === "donut"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Donut Chart</span>
          </button>
          <button
            onClick={() => setActiveChartTab("progress")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === "progress"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Target vs Actual</span>
          </button>
          <button
            onClick={() => setActiveChartTab("categories")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === "categories"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Category Spend</span>
          </button>
        </div>
      </div>

      {activeChartTab === "donut" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut SVG */}
          <div className="md:col-span-5 flex justify-center relative">
            <svg
              width="160"
              height="160"
              viewBox="0 0 100 100"
              className="transform -rotate-90 select-none"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                className="stroke-zinc-100"
                strokeWidth={strokeWidth}
              />
              
              {/* Segments */}
              {segments.map((seg) => {
                if (seg.value <= 0) return null;
                const isHovered = hoveredSegment === seg.id;
                return (
                  <circle
                    key={seg.id}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    className={`${seg.color} transition-all duration-300 cursor-pointer`}
                    strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={`${seg.pct * circumference} ${circumference}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredSegment(seg.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );
              })}
            </svg>

            {/* Inner text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredSegment ? (
                <>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    {hoveredSegment}
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-800">
                    {formatCurrency(
                      segments.find((s) => s.id === hoveredSegment)?.value || 0, currency
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {Math.round(
                      ((segments.find((s) => s.id === hoveredSegment)?.value || 0) /
                        denominator) *
                        100
                    )}
                    %
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-zinc-400">
                    TOTAL FLOW
                  </span>
                  <span className="text-sm font-bold font-mono text-zinc-900">
                    {formatCurrency(totalIncome, currency)}
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    {transactions.length} items logged
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Donut Legend */}
          <div className="md:col-span-7 space-y-3">
            {segments.map((seg) => {
              const isHovered = hoveredSegment === seg.id;
              const percent = Math.round((seg.value / denominator) * 100) || 0;
              return (
                <div
                  key={seg.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isHovered
                      ? "bg-zinc-50 border-zinc-300 shadow-3xs"
                      : "bg-transparent border-transparent"
                  }`}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${seg.fillColor}`} />
                      <span className="text-xs font-semibold text-zinc-900">{seg.name}</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-zinc-800">{percent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pl-4">
                    <span>Actual: {formatCurrency(seg.value, currency)}</span>
                    <span>Target: {formatCurrency(seg.target, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeChartTab === "progress" && (
        <div className="space-y-5">
          {segments.map((seg) => {
            const isOverTarget = seg.id !== "savings" && seg.value > seg.target;
            const isUnderSavingsTarget = seg.id === "savings" && seg.value < seg.target;
            const ratio = seg.target > 0 ? Math.min(2, seg.value / seg.target) : 0;
            const percentageWidth = Math.min(100, ratio * 100);

            let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
            let statusText = "On Track";
            let statusBg = "bg-emerald-50 text-emerald-700 border-emerald-100";

            if (isOverTarget) {
              statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
              statusText = "Over Limit";
              statusBg = "bg-amber-50 text-amber-800 border-amber-100";
            } else if (isUnderSavingsTarget) {
              statusIcon = <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />;
              statusText = "Below Target";
              statusBg = "bg-zinc-50 text-zinc-600 border-zinc-100";
            }

            return (
              <div key={seg.id} className="space-y-1.5 p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.fillColor}`} />
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-tight">
                      {seg.id}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      (Target: {formatCurrency(seg.target, currency)})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-zinc-900">
                      {formatCurrency(seg.value, currency)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${statusBg}`}>
                      {statusIcon}
                      <span>{statusText}</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="relative w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  {/* Target line indicator marker (at 50% relative visual layout if actual <= target) */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10 opacity-70"
                    style={{ left: `${Math.min(100, (seg.target / Math.max(seg.target * 1.5, seg.value)) * 100)}%` }}
                    title="Target Marker"
                  />
                  {/* Fill progress */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      seg.id === "needs"
                        ? isOverTarget ? "bg-amber-600" : "bg-amber-400"
                        : seg.id === "wants"
                        ? isOverTarget ? "bg-zinc-950" : "bg-zinc-800"
                        : "bg-emerald-500"
                    }`}
                    style={{ 
                      width: `${
                        (seg.value / Math.max(seg.target * 1.5, seg.value)) * 100 || 0
                      }%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>{currency.symbol}0</span>
                  <span>Target Limit</span>
                  <span>{formatCurrency(Math.max(seg.target * 1.5, seg.value), currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeChartTab === "categories" && (
        <div className="space-y-4 animate-fade-in">
          {categorySummary.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-500 dark:text-zinc-400">
              No variable expenses logged yet. Log some purchases to see category-wise details!
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {categorySummary.map((item) => {
                const pct = totalVariableSpend > 0 ? (item.amount / totalVariableSpend) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-1.5 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-zinc-800 dark:text-zinc-200">{item.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(item.amount, currency)}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">({Math.round(pct)}%)</span>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-300" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
