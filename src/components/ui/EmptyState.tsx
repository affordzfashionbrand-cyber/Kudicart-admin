import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-12 px-6 flex flex-col items-center justify-center text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-[#E4E0DB] flex items-center justify-center mb-4 text-secondary">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface mb-1">
        {title}
      </h3>
      <p className="text-body-sm font-body-sm text-secondary max-w-sm mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-9 px-4 rounded-lg bg-primary-container text-white text-label-sm font-label-sm font-semibold hover:bg-[#D94B17] active:scale-[0.98] transition-all shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
