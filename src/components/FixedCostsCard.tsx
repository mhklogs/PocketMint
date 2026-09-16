import React from "react";
import { Home, ShoppingBag, DollarSign, Check } from "lucide-react";
import { FixedCosts } from "../types";
import { validatePositiveNumber } from "../utils";
import { useCurrency } from "../CurrencyContext";

interface FixedCostsCardProps {
  costs: FixedCosts;
  onChangeCosts: (newCosts: FixedCosts) => void;
}

export const FixedCostsCard: React.FC<FixedCostsCardProps> = ({
  costs,
  onChangeCosts,
}) => {
  const { currency } = useCurrency();
  const [tempCosts, setTempCosts] = React.useState<FixedCosts>(costs);
  const [savedSignal, setSavedSignal] = React.useState<boolean>(false);

  React.useEffect(() => {
    setTempCosts(costs);
  }, [costs]);

  const handleChange = (field: keyof FixedCosts, val: string) => {
    const cleanNum = validatePositiveNumber(val);
    const updated = { ...tempCosts, [field]: cleanNum };
    setTempCosts(updated);
    onChangeCosts(updated);
  };

  const handleManualTrigger = () => {
    setSavedSignal(true);
    setTimeout(() => setSavedSignal(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Monthly Earnings & Essentials
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your regular earnings, rent, and typical grocery spending.
          </p>
        </div>
        
        {savedSignal && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30 animate-fade-in">
            <Check className="w-3 h-3" />
            Saved
          </span>
        )}
      </div>

      <div className="space-y-3.5">
        {/* Total Monthly Income / Allowance */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            Monthly Income / Allowance / Paycheck
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 font-mono text-sm">{currency.symbol}</span>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 1500"
              value={tempCosts.income || ""}
              onChange={(e) => handleChange("income", e.target.value)}
              onBlur={handleManualTrigger}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fixed Monthly Rent */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
              <Home className="w-3.5 h-3.5 text-amber-500" />
              Monthly Rent / Dorm
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 font-mono text-sm">{currency.symbol}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 750"
                value={tempCosts.rent || ""}
                onChange={(e) => handleChange("rent", e.target.value)}
                onBlur={handleManualTrigger}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Average Groceries */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              Average Groceries & Food
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 dark:text-zinc-500 font-mono text-sm">{currency.symbol}</span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 300"
                value={tempCosts.grocery || ""}
                onChange={(e) => handleChange("grocery", e.target.value)}
                onBlur={handleManualTrigger}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-55 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
