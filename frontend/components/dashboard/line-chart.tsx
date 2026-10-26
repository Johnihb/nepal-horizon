"use client";

import { useId } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartLegend } from "./chart-legend";
import { ChartTooltip } from "./chart-tooltip";
import { formatAxisNumber, formatChartData, getRevenueScale, resolveConfig } from "./chart-config";
import type { AnalyticsPoint, LineChartConfig } from "./types";

interface LineChartProps {
  /** Visual / style configuration (all fields optional; defaults apply) */
  config?: LineChartConfig;
  /** Data array from the API */
  data: AnalyticsPoint[];
  /** Optional chart title */
  title?: string;
  /** Optional subtitle below the title */
  subtitle?: string;
}

interface CursorPoint {
  x?: number;
  y?: number;
}

interface CustomChartCursorProps {
  /** Recharts hands the cursor the two ends of the hovered column. */
  points?: CursorPoint[];
  /** Fallback geometry for renderers that only pass the plot box. */
  x?: number;
  y?: number;
  height?: number;
  primaryColor: string;
  secondaryColor: string;
  gradientId: string;
}

/**
 * The Field Office cursor: a hairline rule that follows the hovered column,
 * capped with a dot in each of the two series colours.
 */
function CustomChartCursor({
  points,
  x,
  y,
  height,
  primaryColor,
  secondaryColor,
  gradientId,
}: CustomChartCursorProps) {
  const top = points?.[0];
  const bottom = points?.[1];

  const cursorX = typeof top?.x === "number" ? top.x : x;
  const cursorTop = typeof top?.y === "number" ? top.y : y;
  const cursorBottom =
    typeof bottom?.y === "number" ? bottom.y : typeof y === "number" ? y + (height ?? 0) : undefined;

  if (
    typeof cursorX !== "number" ||
    typeof cursorTop !== "number" ||
    typeof cursorBottom !== "number"
  ) {
    return null;
  }

  return (
    <g>
      <line
        x1={cursorX}
        y1={cursorTop}
        x2={cursorX}
        y2={cursorBottom}
        stroke={`url(#${gradientId})`}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={cursorX} cy={cursorTop} r={3} fill={primaryColor} />
      <circle cx={cursorX} cy={cursorBottom} r={3} fill={secondaryColor} />
    </g>
  );
}

/**
 * LineChart — a reusable, config-driven line chart for the analytics dashboard.
 *
 * @param config  Visual overrides: primaryColor, secondaryColor, tertiaryColor,
 *                textColor, gridColor, axisColor, height, width, range
 * @param data    Array of { timestamp, count, revenue, totalPeople } records
 */
export function LineChart({
  config,
  data,
  title = "Booking Analytics",
  subtitle = "Performance metrics over time",
}: LineChartProps) {
  const resolved = resolveConfig(config);
  const scale = getRevenueScale(data);
  const chartData = formatChartData(data, scale, resolved.range);
  const uid = useId();
  const gradientId = `nh-cursor-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;

  const colors = {
    primary: resolved.primaryColor,
    secondary: resolved.secondaryColor,
    tertiary: resolved.tertiaryColor,
  };

  const legendItems = [
    { color: colors.primary, label: "Bookings" },
    { color: colors.secondary, label: `Revenue ${scale.suffix}`.trim() },
    { color: colors.tertiary, label: "Travellers" },
  ];

  return (
    <div className="nh-panel" style={{ width: resolved.width }}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="nh-display-3">{title}</h2>
          <p className="nh-meta mt-2">{subtitle}</p>
        </div>

        <ChartLegend items={legendItems} className="mt-2" />
      </div>

      <div suppressHydrationWarning>
        <ResponsiveContainer width="100%" height={resolved.height}>
          <RechartsLineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primary} stopOpacity={0.9} />
                <stop offset="100%" stopColor={colors.secondary} stopOpacity={0.9} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={resolved.gridColor} vertical={false} />

            <XAxis
              dataKey="displayDate"
              tick={{
                fill: resolved.textColor,
                fontSize: 11,
                fontFamily: "var(--font-mono), monospace",
              }}
              axisLine={{ stroke: resolved.axisColor }}
              tickLine={false}
              dy={10}
              minTickGap={16}
            />

            <YAxis
              tick={{
                fill: resolved.textColor,
                fontSize: 11,
                fontFamily: "var(--font-mono), monospace",
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisNumber}
              width={48}
            />

            <Tooltip
              content={<ChartTooltip colors={colors} revenueScale={scale} />}
              cursor={
                <CustomChartCursor
                  primaryColor={colors.primary}
                  secondaryColor={colors.secondary}
                  gradientId={gradientId}
                />
              }
            />

            <Line
              type="monotone"
              dataKey="count"
              name="Bookings"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.primary, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: colors.primary, stroke: "#fff", strokeWidth: 2 }}
            />

            <Line
              type="monotone"
              dataKey="revenueNormalized"
              name={`Revenue ${scale.suffix}`.trim()}
              stroke={colors.secondary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.secondary, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: colors.secondary, stroke: "#fff", strokeWidth: 2 }}
            />

            <Line
              type="monotone"
              dataKey="totalPeople"
              name="Travellers"
              stroke={colors.tertiary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.tertiary, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: colors.tertiary, stroke: "#fff", strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
