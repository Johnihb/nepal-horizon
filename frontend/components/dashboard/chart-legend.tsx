"use client";

import { cn } from "@/lib/utils";

interface LegendItem {
  color: string;
  label: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
}

/**
 * Horizontal legend for the Field Office console.
 * Each series is a short rule in its own colour — the only chromatic marks
 * on the chart — labelled in the mono metadata face.
 */
export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-6 gap-y-2", className)}>
      {items.map(({ color, label }) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-px w-6 shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="nh-meta">{label}</span>
        </li>
      ))}
    </ul>
  );
}
