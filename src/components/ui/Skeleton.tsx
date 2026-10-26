import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-container-high", className)}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columns = 8 }: { columns?: number }) {
  return (
    <tr className="h-12 border-b border-surface-container-highest animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-3 py-2">
          <div className="h-4 bg-surface-container-high rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}
