import React, { useState } from "react";
import { UserIcon, Briefcase, X } from "lucide-react";
import { Profession, PROFESSIONS } from "../types";

interface ProfileModalProps {
  initialName?: string;
  initialProfession?: Profession;
  initialCustomProfession?: string;
  onSave: (name: string, profession: Profession, customProfession?: string) => void;
  onClose?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  initialName = "",
  initialProfession = "Student",
  initialCustomProfession = "",
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [profession, setProfession] = useState<Profession>(initialProfession);
  const [customProfession, setCustomProfession] = useState(initialCustomProfession);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (profession === "Custom" && !customProfession.trim()) {
      setError("Please describe your profession.");
      return;
    }
    onSave(name.trim(), profession, profession === "Custom" ? customProfession.trim() : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/55 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transition-colors duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-amber-600">
            <UserIcon className="w-5 h-5" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Your Profile
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400 font-bold text-xl leading-none px-2 py-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
          Set up your profile so PocketMint can tailor budget advice to your situation.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Your Name
            </label>
            <div className="relative flex items-center">
              <UserIcon className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Profession
            </label>
            <div className="relative flex items-center">
              <Briefcase className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <select
                value={profession}
                onChange={(e) => { setProfession(e.target.value as Profession); setError(null); }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 cursor-pointer transition-colors"
              >
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {profession === "Custom" && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Describe Your Profession
              </label>
              <input
                type="text"
                placeholder="e.g. Graphic Designer, Doctor, Teacher..."
                value={customProfession}
                onChange={(e) => { setCustomProfession(e.target.value); setError(null); }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
            </div>
          )}

          <div className="pt-3 flex gap-2 justify-end">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
