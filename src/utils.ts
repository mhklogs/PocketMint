import { Currency, FixedCosts, SmartPlanResult, Transaction } from "./types";

export function formatCurrency(amount: number, currency: Currency = { code: "PKR", symbol: "₨", locale: "ur-PK" }): string {
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const DEFAULT_CURRENCY: Currency = { code: "PKR", symbol: "₨", locale: "ur-PK" };

/**
 * Validates numeric inputs strictly: prevents negative values and NaN.
 */
export function validatePositiveNumber(val: string | number): number {
  if (val === "" || val === null || val === undefined) return 0;
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num) || num < 0) return 0;
  return Number(num.toFixed(2));
}

/**
 * Professional Financial Consultant — Rule-Based Planner
 * Analyzes income, fixed costs, and transactions to give tailored advice.
 * No external API needed — runs entirely locally.
 */
export function generateRuleBasedPlan(
  fixedCosts: FixedCosts,
  transactions: Transaction[],
  currency: Currency = DEFAULT_CURRENCY,
  profession?: string
): SmartPlanResult {
  const sym = currency.symbol;
  const { rent, grocery, income } = fixedCosts;

  const expenses = transactions.filter((t) => t.type === "expense");
  const variableExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const incomeEntries = transactions.filter((t) => t.type === "income");
  const extraIncome = incomeEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = income + extraIncome;

  const totalFixed = rent + grocery;
  const totalSpend = totalFixed + variableExpenses;
  const netSavings = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const targetNeeds = totalIncome * 0.5;
  const targetWants = totalIncome * 0.3;
  const targetSavings = totalIncome * 0.2;

  const essentialPct = totalIncome > 0 ? (totalFixed / totalIncome) * 100 : 0;
  const variablePct = totalIncome > 0 ? (variableExpenses / totalIncome) * 100 : 0;

  const spendByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategory = Object.entries(spendByCategory).sort((a, b) => b[1] - a[1])[0];

  const bullets: string[] = [];
  const role = profession?.toLowerCase() || "";

  // --- Tip 1: Financial Health Assessment ---
  if (totalIncome <= 0) {
    bullets.push(`• Set your monthly income${profession ? ` as a ${profession}` : ""} in the Fixed Costs section to receive a full financial assessment.`);
  } else if (savingsRate >= 20) {
    bullets.push(`• Healthy Position: You're saving ${savingsRate.toFixed(0)}% of your ${sym}${totalIncome.toFixed(0)} income. Essentials consume ${essentialPct.toFixed(0)}%, well within the 50% benchmark. Consider investing surplus${role.includes("student") ? " in a high-yield savings account for post-graduation" : role.includes("freelanc") ? " in retirement and tax-advantaged accounts" : ""}.`);
  } else if (savingsRate >= 10) {
    bullets.push(`• Moderate Position: Saving ${savingsRate.toFixed(0)}% of income. Essentials are ${essentialPct.toFixed(0)}% (target under 50%). Gap is ${(totalSpend - totalIncome * 0.8).toFixed(0) > "0" ? "wants spending" : "fixed costs"} — ${role.includes("student") ? "cut dining out and subscription services" : role.includes("freelanc") ? "reduce business-related variable costs" : role.includes("salaried") || role.includes("employ") ? "review recurring subscriptions" : "trim discretionary spending"} to reach 20% savings.`);
  } else {
    const deficitAmt = (targetSavings - netSavings).toFixed(0);
    bullets.push(`• Tight Position: Only saving ${Math.max(0, savingsRate).toFixed(0)}% — need to free ${sym}${deficitAmt} more monthly to hit the 20% target. Essentials are ${essentialPct.toFixed(0)}% of income${essentialPct > 50 ? ` (exceeding the 50% guideline by ${(essentialPct - 50).toFixed(0)}%)` : ""}. ${role.includes("student") ? "Consider a part-time gig or selling unused items" : role.includes("freelanc") ? "Review client rates and reduce business overhead" : role.includes("business") ? "Audit operational expenses and slow hires" : "Review rent/subscriptions and consider side income"}.`);
  }

  // --- Tip 2: Category-Specific Optimization ---
  if (topCategory) {
    const catName = topCategory[0];
    const catAmt = topCategory[1];
    const catPct = totalIncome > 0 ? (catAmt / totalIncome) * 100 : 0;

    if (catPct > 20) {
      bullets.push(`• Overspend Alert: "${catName}" (${sym}${catAmt.toFixed(0)}) is ${catPct.toFixed(0)}% of your income. ${catName.includes("Food") || catName.includes("Dining") ? "Set a weekly meal budget and cook at home 3 more days per week" : catName.includes("Travel") || catName.includes("Pursuit") ? "Plan one big trip instead of multiple small outings" : catName.includes("Shop") || catName.includes("Cloth") ? "Use a 48-hour rule before any non-essential purchase" : catName.includes("Entertain") || catName.includes("Game") ? "Switch to free alternatives and limit to weekends only" : `Cap this category at ${Math.round(catAmt * 0.75)} next month`}.`);
    } else if (catPct > 10) {
      bullets.push(`• Moderate Spend: "${catName}" at ${catPct.toFixed(0)}% (${sym}${catAmt.toFixed(0)}). ${role.includes("student") ? "Look for student discounts and campus alternatives" : role.includes("freelanc") ? "Consider if this is a deductible business expense" : "Track weekly to ensure it doesn't exceed 15%"}.`);
    } else {
      bullets.push(`• Controlled Spending: Your top category "${catName}" is ${catPct.toFixed(0)}% of income (${sym}${catAmt.toFixed(0)}) — well managed.`);
    }
  } else {
    bullets.push(`• Start tracking expenses to receive category-specific optimization advice. Add your first transaction in the Transactions tab.`);
  }

  // --- Tip 3: Profession & Goal Alignment ---
  if (totalIncome > 0) {
    if (essentialPct > 50) {
      bullets.push(`• Fixed Cost Reduction: Essential costs are ${essentialPct.toFixed(0)}% of income. ${role.includes("student") ? "Consider moving to a shared apartment or negotiating rent with roommates" : role.includes("freelanc") ? "Sublet unused office space or negotiate a co-working membership" : role.includes("business") ? "Review lease terms and renegotiate supplier contracts" : "Consider refinancing or downsizing"}. Every 5% reduction here adds ${sym}${Math.round(totalIncome * 0.05)} to savings.`);
    } else if (netSavings >= targetSavings) {
      bullets.push(`• On Track: You're meeting the 20% savings goal (${sym}${netSavings.toFixed(0)} this month). ${role.includes("student") ? "Great habit for financial independence after graduation" : role.includes("freelanc") ? "Build a 6-month expense buffer for slow periods" : role.includes("business") ? "Reinvest surplus into business growth or an emergency fund" : "Consider accelerating debt payoff or investing the surplus"}.`);
    } else {
      const roomInWants = Math.max(0, targetWants - variableExpenses);
      if (roomInWants > 0) {
        bullets.push(`• Rebalance: Variable spending is ${sym}${variableExpenses.toFixed(0)} of your ${sym}${targetWants.toFixed(0)} wants budget, leaving ${sym}${roomInWants.toFixed(0)}. Redirect half of this surplus directly to savings to close your savings gap faster.`);
      } else {
        bullets.push(`• Trade-off Needed: Variable spending (${sym}${variableExpenses.toFixed(0)}) exceeds the 30% wants guideline (${sym}${targetWants.toFixed(0)}). ${role.includes("student") ? "Swap 2 paid activities per week for free campus events" : role.includes("freelanc") ? "Separate personal and business spending with dedicated accounts" : role.includes("business") ? "Cut personal perks until the business is profitable" : "Use cash envelopes for discretionary categories"}.`);
      }
    }
  } else {
    bullets.push(`• Enter your monthly income to get a personalized savings and investment strategy${profession ? ` as a ${profession}` : ""}.`);
  }

  return {
    planText: bullets.join("\n"),
    source: "rule_fallback",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bullets,
  };
}

/**
 * Goal-Based Savings Planner
 * Takes a user's goal (e.g. "I want to buy a bike for 60,000")
 * and generates a savings roadmap as a financial consultant.
 */
export function generateGoalPlan(
  fixedCosts: FixedCosts,
  transactions: Transaction[],
  goalText: string,
  currency: Currency = DEFAULT_CURRENCY,
  profession?: string
): SmartPlanResult {
  const sym = currency.symbol;
  const { rent, grocery, income } = fixedCosts;

  const avgExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = rent + grocery;
  const monthlySpend = totalFixed + avgExpenses;
  const monthlySavingsCapacity = Math.max(0, income - monthlySpend);

  const numbers = goalText.match(/\d[\d,]*/g);
  const goalCost = numbers ? parseInt(numbers[0].replace(/,/g, ""), 10) : 0;

  const cleanGoal = goalText
    .replace(/i want to (buy|get|save for|purchase) /i, "")
    .replace(/\d[\d,]*/g, "")
    .replace(/for\s*$/, "")
    .replace(/\s+/g, " ")
    .trim() || goalText;
  const goalName = cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1);

  const role = profession?.toLowerCase() || "";
  const bullets: string[] = [];

  if (income <= 0) {
    bullets.push(`• ${goalName} — First, set your monthly income in Fixed Costs to see how fast you can reach this goal.`);
    bullets.push(`• As a general rule${role ? ` for a ${profession}` : ""}, aim to save at least 20% of any income toward goals like this.`);
    bullets.push(`• Start tracking all expenses to identify areas where you can cut back and save more.`);
    return {
      planText: bullets.join("\n"),
      source: "goal_plan",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bullets,
      goal: goalName,
    };
  }

  if (monthlySavingsCapacity <= 0) {
    bullets.push(`• Assessment: Your monthly expenses (${sym}${monthlySpend.toFixed(0)}) match or exceed your income (${sym}${income.toFixed(0)}).`);
    bullets.push(`• To save for "${goalName}", you'll need to free up cash: ${role.includes("student") ? "find a part-time gig, or reduce dining out and subscriptions" : role.includes("freelanc") ? "increase your rates or take on an extra client" : role.includes("business") ? "cut operational costs or boost revenue channels" : "cut discretionary spending by 15-20%"} first.`);
    bullets.push(`• Start with a 30-day expense audit — track every rupee to find saving opportunities.`);
    return {
      planText: bullets.join("\n"),
      source: "goal_plan",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bullets,
      goal: goalName,
    };
  }

  const monthsNeeded = goalCost > 0 ? Math.ceil(goalCost / monthlySavingsCapacity) : 0;
  const halfCap = monthlySavingsCapacity / 2;
  const aggressiveMonths = goalCost > 0 ? Math.ceil(goalCost / (monthlySavingsCapacity + halfCap)) : 0;

  bullets.push(`• Current Situation: You earn ${sym}${income.toFixed(0)}/month with ${sym}${monthlySpend.toFixed(0)} in expenses. You can save ~${sym}${monthlySavingsCapacity.toFixed(0)} per month.`);

  if (goalCost > 0) {
    bullets.push(`• Timeline: "${goalName}" (${sym}${goalCost.toLocaleString()}) is achievable in ~${monthsNeeded} month${monthsNeeded > 1 ? "s" : ""} at your current savings rate.`);
    if (monthsNeeded > 12) {
      bullets.push(`• Accelerate: Cut ${role.includes("student") ? "entertainment and eating out" : role.includes("freelanc") ? "non-essential business spending" : role.includes("business") ? "personal discretionary spending" : "wants spending"} by ${sym}${Math.round(halfCap).toFixed(0)}/month to reach it in ${aggressiveMonths} months instead.`);
    } else if (monthsNeeded > 3) {
      bullets.push(`• Boost: Save an extra ${sym}${Math.round(halfCap).toFixed(0)}/month by ${role.includes("student") ? "cutting subscriptions and eating out less" : role.includes("freelanc") ? "taking one extra small project monthly" : role.includes("business") ? "reducing personal draws temporarily" : "cutting non-essential purchases"} to reach it in just ${aggressiveMonths} months.`);
    } else {
      bullets.push(`• Great news — this is a short-term goal. Set up an automatic transfer of ${sym}${Math.round(monthlySavingsCapacity * 0.8).toFixed(0)}/month to a dedicated savings account.`);
    }
  } else {
    bullets.push(`• Add a target amount (e.g., "bike for 60,000") and I'll calculate exactly how many months you need at ${sym}${monthlySavingsCapacity.toFixed(0)}/month savings.`);
    bullets.push(`• General recommendation${role ? ` as a ${profession}` : ""}: Save at least 20% of your income — that's ${sym}${Math.round(income * 0.2).toFixed(0)}/month toward your goal.`);
  }

  const milestoneMonth = Math.max(1, Math.floor(monthsNeeded * 0.5));
  const milestoneAmount = goalCost > 0 ? Math.round((goalCost / monthsNeeded) * milestoneMonth) : 0;
  if (goalCost > 0 && milestoneAmount > 0) {
    bullets.push(`• Milestone: By month ${milestoneMonth}, you'll have saved ~${sym}${milestoneAmount.toLocaleString()} — halfway to your ${goalName}.`);
  }

  return {
    planText: bullets.join("\n"),
    source: "goal_plan",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bullets,
    goal: goalName,
  };
}

/**
 * Clean Fetch Function for Llama 3 / Lightweight AI API
 */
export async function fetchSmartAIPlan(
  fixedCosts: FixedCosts,
  transactions: Transaction[],
  aiConfig: { baseUrl: string; apiKey: string; model: string; useDirectClientFetch: boolean },
  currency: Currency = DEFAULT_CURRENCY,
  profession?: string,
  userGoal?: string
): Promise<SmartPlanResult> {
  const sym = currency.symbol;
  const roleContext = profession ? ` as a ${profession}` : "";
  const variableExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const travelSpend = transactions
    .filter((t) => t.type === "expense" && t.category === "Travel/Pursuits")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const spendByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const recentTransactions = transactions.slice(0, 5).map(t => ({
    title: t.title,
    amount: t.amount,
    category: t.category,
    type: t.type
  }));

  const payloadData = {
    income: fixedCosts.income,
    rent: fixedCosts.rent,
    grocery: fixedCosts.grocery,
    travelExpenses: travelSpend,
    totalVariable: variableExpenses,
    categorizedSpend: spendByCategory,
    recentTransactions: recentTransactions,
    aiConfig: {
      baseUrl: aiConfig.baseUrl,
      apiKey: aiConfig.apiKey,
      model: aiConfig.model,
    },
    currency: { code: currency.code, symbol: currency.symbol, locale: currency.locale },
    profession: profession || "",
    userGoal: userGoal || "",
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("Offline");
  }

  // Option 1: Direct Client-Side Fetch (e.g. Ollama / Groq)
  if (aiConfig.useDirectClientFetch && aiConfig.baseUrl && aiConfig.baseUrl !== "default") {
    const cleanUrl = aiConfig.baseUrl.replace(/\/+$/, "");
    const endpoint = cleanUrl.includes("11434") ? `${cleanUrl}/chat` : `${cleanUrl}/chat/completions`;

    const formattedCategories = Object.entries(spendByCategory)
      .map(([cat, amt]) => `- ${cat}: ${sym}${amt}`)
      .join("\n") || "None logged";

    const formattedRecent = recentTransactions.length > 0
      ? recentTransactions.map(t => `- ${t.title} (${t.category}): ${sym}${t.amount}`).join("\n")
      : "None logged";

    const sysPrompt = `You are a professional financial consultant specializing in personal budgeting. The user is${roleContext}.

Analyze this financial data and provide expert advice:
- Income/Allowance: ${sym}${fixedCosts.income}
- Fixed Rent: ${sym}${fixedCosts.rent}
- Groceries: ${sym}${fixedCosts.grocery}
- Total Variable: ${sym}${variableExpenses}

Variable Spending by Category:
${formattedCategories}

Recent Logged Transactions:
${formattedRecent}

Return EXACTLY 3 actionable bullet points with professional financial advice tailored to their actual spending and profession.
Rules:
1. No intro or outro text.
2. Each line must start with "• ".
3. Keep each tip under 25 words, specific to their data.
4. Be direct, practical, and encouraging like a real financial advisor.`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (aiConfig.apiKey) headers["Authorization"] = `Bearer ${aiConfig.apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: aiConfig.model || "llama3-8b-8192",
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: "Give me my 3 simple budget tips." },
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) throw new Error(`API error (${res.status})`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.message?.content || "";
    if (!text) throw new Error("Empty response");

    const rawLines = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 3);

    const bullets = rawLines.slice(0, 3).map((l: string) => (l.startsWith("•") || l.startsWith("-") || l.startsWith("*") ? l.replace(/^[-*]\s*/, "• ") : `• ${l}`));

    return {
      planText: bullets.join("\n"),
      source: "ai_live",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bullets,
    };
  }

  // Option 2: Default Backend Proxy
  const response = await fetch("/api/ai/budget-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadData),
  });

  if (!response.ok) {
    const errObj = await response.json().catch(() => ({}));
    throw new Error(errObj.error || "Connection failed");
  }

  const data = await response.json();
  const rawText: string = data.plan || "";
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const bullets = lines.slice(0, 3).map((l) => {
    if (l.startsWith("•") || l.startsWith("-") || l.startsWith("*")) {
      return l.replace(/^[-*]\s*/, "• ");
    }
    return `• ${l}`;
  });

  const source = data.source === "gemini_api" ? "gemini_api" : "ai_live";

  return {
    planText: bullets.join("\n"),
    source,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bullets,
  };
}
