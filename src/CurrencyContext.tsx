import { createContext, useContext } from "react";
import { Currency, CURRENCIES } from "./types";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
});

export const useCurrency = () => useContext(CurrencyContext);
