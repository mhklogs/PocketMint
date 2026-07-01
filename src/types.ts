export type TransactionType = "expense" | "income";
export type NavTab = "home" | "history" | "plan";

export type Profession = "Student" | "Freelancer" | "Salaried Employee" | "Business Owner" | "Intern" | "Custom";

export interface UserProfile {
  name: string;
  profession: Profession;
  customProfession?: string;
}

export const PROFESSIONS: Profession[] = [
  "Student",
  "Freelancer",
  "Salaried Employee",
  "Business Owner",
  "Intern",
  "Custom",
];

export interface Currency {
  code: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: "PKR", symbol: "₨", locale: "ur-PK" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "CNY", symbol: "¥", locale: "zh-CN" },
  { code: "KRW", symbol: "₩", locale: "ko-KR" },
  { code: "BRL", symbol: "R$", locale: "pt-BR" },
  { code: "CAD", symbol: "CA$", locale: "en-CA" },
  { code: "AUD", symbol: "A$", locale: "en-AU" },
  { code: "MXN", symbol: "MX$", locale: "es-MX" },
  { code: "CHF", symbol: "Fr", locale: "de-CH" },
  { code: "SEK", symbol: "kr", locale: "sv-SE" },
  { code: "NOK", symbol: "kr", locale: "nb-NO" },
  { code: "DKK", symbol: "kr", locale: "da-DK" },
  { code: "NZD", symbol: "NZ$", locale: "en-NZ" },
  { code: "SGD", symbol: "S$", locale: "en-SG" },
  { code: "HKD", symbol: "HK$", locale: "en-HK" },
  { code: "TRY", symbol: "₺", locale: "tr-TR" },
  { code: "ZAR", symbol: "R", locale: "en-ZA" },
];

export type VariableCategory =
  | "Travel/Pursuits"
  | "Groceries"
  | "Dining Out"
  | "Shopping"
  | "Entertainment"
  | "Transport & Gas"
  | "Bills & Utilities"
  | "Health & Fitness"
  | "Education/Courses"
  | "Freelance/Bonus"
  | "Salary"
  | "Other";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: VariableCategory;
  date: string; // ISO string YYYY-MM-DD
  note?: string;
}

export interface FixedCosts {
  rent: number;
  grocery: number;
  income: number;
}

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  useDirectClientFetch: boolean; // Option to bypass backend proxy if CORS allowed
}

export interface SmartPlanResult {
  planText: string;
  source: "ai_live" | "rule_fallback" | "gemini_api" | "goal_plan";
  timestamp: string;
  bullets: string[];
  goal?: string;
}
