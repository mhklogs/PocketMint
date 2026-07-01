import React, { useState } from "react";
import { Plus, DollarSign, Calendar, Tag, AlertCircle } from "lucide-react";
import { Transaction, TransactionType, VariableCategory } from "../types";
import { validatePositiveNumber } from "../utils";
import { useCurrency } from "../CurrencyContext";

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
}) => {
  const { currency } = useCurrency();
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<VariableCategory>("Travel/Pursuits");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter what this transaction was for.");
      return;
    }

    const validAmount = validatePositiveNumber(amount);
    if (validAmount <= 0) {
      setErrorMsg(`Please enter a valid amount greater than ${currency.symbol}0.`);
      return;
    }

    if (!date) {
      setErrorMsg("Please choose a date.");
      return;
    }

    onAddTransaction({
      title: title.trim(),
      amount: validAmount,
      type,
      category: type === "income" ? (category === "Salary" || category === "Freelance/Bonus" ? category : "Freelance/Bonus") : category,
      date,
      note: note.trim() || undefined,
    });

    setTitle("");
    setAmount("");
    setNote("");
    setErrorMsg(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Add Transaction
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Log textbooks, freelance payouts, coffee, or weekend trips.
          </p>
        </div>

        {/* Type Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              if (category === "Salary" || category === "Freelance/Bonus") {
                setCategory("Travel/Pursuits");
              }
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              type === "expense"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("Freelance/Bonus");
            }}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              type === "income"
                ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {type === "expense" ? "What did you buy?" : "Income Source"}
          </label>
          <input
            type="text"
            placeholder={type === "expense" ? "e.g. Bus fare, Used Biology Textbook, Ramen" : "e.g. Logo design gig, Tutoring"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Amount
            </label>
            <div className="relative flex items-center">
              <DollarSign className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Category</span>
              {category === "Travel/Pursuits" && (
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold">AI Planner Key</span>
              )}
            </label>
            <div className="relative flex items-center">
              <Tag className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VariableCategory)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 cursor-pointer transition-colors"
              >
                {type === "expense" ? (
                  <>
                    <option value="Travel/Pursuits">★ Travel / Pursuits / Fun</option>
                    <option value="Groceries">Groceries & Food</option>
                    <option value="Dining Out">Dining Out & Coffee</option>
                    <option value="Education/Courses">Textbooks & Courses</option>
                    <option value="Transport & Gas">Transit & Gas</option>
                    <option value="Bills & Utilities">Phone & Subscriptions</option>
                    <option value="Shopping">Clothes & Shopping</option>
                    <option value="Entertainment">Gaming & Movies</option>
                    <option value="Health & Fitness">Gym & Health</option>
                    <option value="Other">Other Expense</option>
                  </>
                ) : (
                  <>
                    <option value="Freelance/Bonus">Freelance / Gig Work</option>
                    <option value="Salary">Allowance / Stipend / Job</option>
                    <option value="Other">Other Income</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 font-mono transition-colors"
              />
            </div>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split with Sarah"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
