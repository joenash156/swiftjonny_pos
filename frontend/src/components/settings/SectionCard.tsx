import React from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  isDark: boolean;
  children: React.ReactNode;
}

export function SectionCard({ title, description, isDark, children }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
        }`}
    >
      <div className="mb-5">
        <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          {title}
        </h2>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
