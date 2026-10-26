import type { AnalyticsPoint, AnalyticsRange } from "@/types/package";

export type { AnalyticsPoint, AnalyticsRange };

/** The reporting windows the Field Office can read. */
export const ANALYTICS_RANGES: readonly AnalyticsRange[] = ["days", "weeks", "months"];

/** The window the console opens on. */
export const DEFAULT_RANGE: AnalyticsRange = "days";

/** Narrow an untrusted query value to a real reporting window. */
export function isAnalyticsRange(value: string | null | undefined): value is AnalyticsRange {
  return value === "days" || value === "weeks" || value === "months";
}

/**
 * Style configuration for the LineChart component.
 * All fields are optional — sensible defaults are applied in chart-config.ts.
 */
export interface LineChartConfig {
  /** Bookings line (default: --nh-accent on ink, #6FC6CE) */
  primaryColor?: string;
  /** Revenue line (default: --nh-accent-2 on ink, #E7A25A) */
  secondaryColor?: string;
  /** Travellers line (default: --nh-mist on ink, #BDBDBD) */
  tertiaryColor?: string;
  /** Axis and legend label colour (default: #BDBDBD) */
  textColor?: string;
  /** Horizontal grid rule (default: rgba(255,255,255,0.16)) */
  gridColor?: string;
  /** Axis rule (default: rgba(255,255,255,0.24)) */
  axisColor?: string;
  /** Chart container height in px (default: 420) */
  height?: number;
  /** Chart container width — pass '100%' or a px value (default: '100%') */
  width?: number | string;
  /** Reporting window the points belong to (default: days) */
  range?: AnalyticsRange;
}

/**
 * Internal processed point used by the chart renderer.
 */
export interface FormattedDataPoint extends AnalyticsPoint {
  /** Short date label shown on the X-axis, e.g. "18 Jul" */
  displayDate: string;
  /** Full period label, e.g. "18 Jul 2026" or "Week of 13 Jul 2026" */
  fullDate: string;
  /** Revenue divided by the appropriate divisor for axis readability */
  revenueNormalized: number;
}

/**
 * Metadata about how revenue was normalized for the Y-axis.
 */
export interface RevenueScale {
  divisor: number;
  /** Label suffix, e.g. "(M)" or "(K)" */
  suffix: string;
}
