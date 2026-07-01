import { useState, useRef, type ChangeEvent } from "react";
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface BackupData {
  version: number;
  exportedAt: string;
  profile: any;
  fixedCosts: any;
  transactions: any[];
  aiConfig: any;
  currency: any;
}

interface DataBackupProps {
  onImport: (data: BackupData) => string | null;
}

export function DataBackup({ onImport }: DataBackupProps) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: JSON.parse(localStorage.getItem("pocketmint_profile") || "null"),
      fixedCosts: JSON.parse(localStorage.getItem("pocketmint_fixed_costs_min") || "null"),
      transactions: JSON.parse(localStorage.getItem("pocketmint_transactions_min") || "[]"),
      aiConfig: JSON.parse(localStorage.getItem("pocketmint_ai_config_min") || "null"),
      currency: JSON.parse(localStorage.getItem("pocketmint_currency") || "null"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pocketmint-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: "success", message: "Backup downloaded!" });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data: BackupData = JSON.parse(ev.target?.result as string);
        const error = onImport(data);
        if (error) {
          setStatus({ type: "error", message: error });
        } else {
          setStatus({ type: "success", message: "Data restored! Reloading..." });
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        setStatus({ type: "error", message: "Invalid backup file." });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <Download className="w-3.5 h-3.5" />
          Export Backup
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
        >
          <Upload className="w-3.5 h-3.5" />
          Restore Backup
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
      {status && (
        <div className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg ${
          status.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
            : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
