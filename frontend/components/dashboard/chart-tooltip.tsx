"use client";

import { DEFAULT_CONFIG, formatCount, formatMoney, formatNumber } from "./chart-config";
import type { FormattedDataPoint, RevenueScale } from "./types";

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string | readonly (number | string)[];
  /** The original record behind the entry — holds the un-normalized revenue. */
  payload?: Partial<FormattedDataPoint>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  /** Colors passed through so the tooltip marks match the lines */
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  revenueScale: RevenueScale;
}

/**
 * Custom recharts tooltip shown on hover.
 * Reads on ink: a raised charcoal surface, a hairline border, mist labels and
 * paper figures.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  colors,
  revenueScale,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const findValue = (key: string) => {
    const value = payload.find((entry) => entry.dataKey === key)?.value;
    return typeof value === "number" ? value : undefined;
  };

  const revenue = typeof point?.revenue === "number" ? point.revenue : undefined;
  const normalized = findValue("revenueNormalized");

  const rows = [
    {
      key: "count",
      label: "Bookings",
      color: colors.primary,
      value: formatCount(findValue("count") ?? 0),
    },
    {
      key: "revenue",
      label: "Revenue",
      color: colors.secondary,
      value:
        revenue !== undefined
          ? formatMoney(revenue)
          : `${formatNumber(normalized ?? 0)}${revenueScale.suffix}`,
    },
    {
      key: "totalPeople",
      label: "Travellers",
      color: colors.tertiary,
      value: formatCount(findValue("totalPeople") ?? 0),
    },
  ];

  const heading = point?.fullDate ?? (typeof label === "string" ? label : "");

  return (
    <div
      className="border px-4 py-3"
      style={{
        minWidth: 200,
        backgroundColor: DEFAULT_CONFIG.surfaceColor,
        borderColor: DEFAULT_CONFIG.axisColor,
      }}
    >
      <p className="nh-meta mb-3">{heading}</p>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 shrink-0"
                style={{ backgroundColor: row.color }}
              />
              <span className="nh-muted text-[0.8rem]">{row.label}</span>
            </span>
            <span className="nh-num text-[0.8rem] font-medium">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
