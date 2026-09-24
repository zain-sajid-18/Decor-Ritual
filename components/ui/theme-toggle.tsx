"use client";

import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const SystemIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; Icon: React.FC }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: SystemIcon },
];

interface ThemeToggleProps {
  /** "icon" = compact 3-icon row, "dropdown" = labelled dropdown menu */
  variant?: "icon" | "dropdown";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  // Prevent hydration mismatch — don't render until client-mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (variant === "icon") {
    return (
      <div
        role="group"
        aria-label="Theme selection"
        className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
      >
        {OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={`Switch to ${label} mode`}
            aria-pressed={theme === value}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
              theme === value
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Icon />
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (for compact spaces like admin header)
  const current = OPTIONS.find((o) => o.value === theme)!;
  return (
    <div className="relative">
      <button
        type="button"
        id="theme-toggle-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change theme"
        onClick={() => setOpen((p) => !p)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <current.Icon />
        <span>{current.label}</span>
        <svg
          className={`h-3 w-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label="Theme options"
            className="absolute right-0 z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
          >
            {OPTIONS.map(({ value, label, Icon }) => (
              <li key={value} role="option" aria-selected={theme === value}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    theme === value
                      ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon />
                  {label}
                  {theme === value && (
                    <svg
                      className="ml-auto h-3 w-3 text-zinc-500 dark:text-zinc-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
