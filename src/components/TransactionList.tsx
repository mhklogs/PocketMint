import React, { useState } from "react";
import { Trash2, ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { Transaction } from "../types";
import { formatCurrency } from "../utils";
import { useCurrency } from "../CurrencyContext";
import { useToast } from "./Toast";

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onClearAll: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  onClearAll,
}) => {
  const { currency } = useCurrency();
  const { showToast } = useToast();
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(search.toLowerCase())) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Recent Transactions ({transactions.length})
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Offline records stored on this device.
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={onClearAll}
            className="self-start sm:self-auto text-xs text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium border border-transparent dark:border-red-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter & Search */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
          <div className="sm:col-span-7 relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
          </div>

          <div className="sm:col-span-5 relative flex items-center">
            <Filter className="absolute left-2.5 w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-305 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 cursor-pointer transition-colors"
            >
              <option value="ALL">All Categories</option>
              <option value="Travel/Pursuits">★ Travel / Pursuits</option>
              <option value="Groceries">Groceries & Food</option>
              <option value="Dining Out">Dining Out & Coffee</option>
              <option value="Education/Courses">Textbooks & Courses</option>
              <option value="Transport & Gas">Transit & Gas</option>
              <option value="Freelance/Bonus">Freelance / Gig Income</option>
            </select>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 bg-zinc-50/50 dark:bg-zinc-850/10 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {transactions.length === 0
              ? "No expenses or income logged yet. Add your first item above!"
              : "No transactions match your search filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((t) => {
            const isExpense = t.type === "expense";

            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-850/5 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isExpense
                        ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {t.title}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                        {t.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-450 mt-0.5">
                      <span className="font-mono">{t.date}</span>
                      {t.note && (
                        <span className="truncate text-zinc-400 dark:text-zinc-500 italic">
                          • {t.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isExpense ? "text-zinc-900 dark:text-zinc-100" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {formatCurrency(t.amount, currency)}
                  </span>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
