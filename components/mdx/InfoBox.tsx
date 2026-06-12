import { ReactNode } from "react";

type BoxType = "info" | "warning" | "tip" | "danger";

interface InfoBoxProps {
  type?: BoxType;
  title?: string;
  children: ReactNode;
}

const config: Record<BoxType, { icon: ReactNode; border: string; bg: string; text: string; label: string }> = {
  info: {
    label: "Note",
    border: "border-blue-400 dark:border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-800 dark:text-blue-200",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    label: "Warning",
    border: "border-amber-400 dark:border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-800 dark:text-amber-200",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  tip: {
    label: "Pro Tip",
    border: "border-emerald-400 dark:border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-200",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.001z" />
      </svg>
    ),
  },
  danger: {
    label: "Risk",
    border: "border-red-400 dark:border-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-800 dark:text-red-200",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export default function InfoBox({ type = "info", title, children }: InfoBoxProps) {
  const c = config[type];
  return (
    <div className={`not-prose my-6 rounded-lg border-l-4 ${c.border} ${c.bg} p-5`}>
      <div className={`flex items-center gap-2 mb-2 ${c.text}`}>
        {c.icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title ?? c.label}</span>
      </div>
      <div className={`text-sm leading-relaxed ${c.text}`}>{children}</div>
    </div>
  );
}
