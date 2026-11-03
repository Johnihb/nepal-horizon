"use client";

import { useId } from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartLegend } from "./chart-legend";
import { DEFAULT_CONFIG } from "./chart-config";

/** Ink-shell palette for the slices — teal, ochre, mist, then muted variants. */
const SLICE_COLORS = [
  "#9FD3CE",
  "#E0A662",
  "#C7C5BF",
  "#7FB3AC",
  "#D4A87A",
  "#A8B5B2",
  "#E8C99B",
  "#6F9B94",
];

interface PackagePieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  subtitle?: string;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: { name: string; value: number; percent?: number };
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name = entry?.name ?? entry?.payload?.name ?? "";
  const value = typeof entry?.value === "number" ? entry.value : 0;
  const percent = entry?.payload?.percent;
  return (
    <div
      className="border px-4 py-3"
      style={{
        minWidth: 180,
        backgroundColor: DEFAULT_CONFIG.surfaceColor,
        borderColor: DEFAULT_CONFIG.axisColor,
      }}
    >
      <p className="nh-meta mb-1">{name}</p>
      <p className="nh-num text-[0.85rem] font-medium">
        {value} booking{value === 1 ? "" : "s"}
        {typeof percent === "number" ? ` · ${(percent * 100).toFixed(1)}%` : ""}
      </p>
    </div>
  );
}

export function PackagePieChart({
  data,
  title = "Most booked packages",
  subtitle = "Share of reservations by journey",
}: PackagePieChartProps) {
  const uid = useId();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const legendItems = data.map((item, index) => ({
    color: SLICE_COLORS[index % SLICE_COLORS.length]!,
    label: `${item.name} · ${total ? Math.round((item.value / total) * 100) : 0}%`,
  }));

  return (
    <div className="nh-panel" style={{ width: "100%" }}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="nh-display-3">{title}</h2>
          <p className="nh-meta mt-2">{subtitle}</p>
        </div>
        <ChartLegend items={legendItems} className="mt-2" />
      </div>

      {data.length === 0 ? (
        <p className="nh-meta py-12 text-center">No bookings to chart yet.</p>
      ) : (
        <div
          suppressHydrationWarning
          role="img"
          aria-label={`Package popularity: ${data
            .map((d) => `${d.name} ${total ? Math.round((d.value / total) * 100) : 0}%`)
            .join(", ")}`}
        >
          <ResponsiveContainer width="100%" height={320}>
            <RechartsPieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                stroke={DEFAULT_CONFIG.surfaceColor}
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`${uid}-cell-${index}`}
                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
