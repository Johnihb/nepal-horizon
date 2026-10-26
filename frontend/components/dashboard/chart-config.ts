import type {
  AnalyticsPoint,
  AnalyticsRange,
  FormattedDataPoint,
  LineChartConfig,
  RevenueScale,
} from "./types";
import { DEFAULT_RANGE } from "./types";

// ─── Design tokens ─────────────────────────────────────────────────────────

/**
 * Nepal Horizon palette, tuned for the dark (`nh-page--ink`) shell the console
 * sits on.
 *
 * Three series only — teal encodes bookings, ochre revenue, mist travellers.
 * Everything else is ink, paper and hairline rules.
 *
 * These are the ink shell's own tokens, so the chart cannot drift away from
 * the page it is drawn on: `--nh-accent` (#6FC6CE), `--nh-accent-2`
 * (#E7A25A) and `--nh-mist` (#BDBDBD). Measured against the near-black ground
 * they land at 12.0:1, 10.4:1 and 11.0:1 — every one of them clears the 3:1
 * a data line needs, where the paper-shell accents would not. The rules sit
 * at 24% and 16% white so the grid reads as a rule rather than a glow, and
 * the labels sit at #BDBDBD.
 */
export const DEFAULT_CONFIG = {
  primaryColor: "#6FC6CE", // --nh-accent on ink — bookings
  secondaryColor: "#E7A25A", // --nh-accent-2 on ink — revenue
  tertiaryColor: "#BDBDBD", // --nh-mist on ink — travellers
  textColor: "#BDBDBD", // axis + legend labels
  gridColor: "rgba(255,255,255,0.16)", // hairline rule
  axisColor: "rgba(255,255,255,0.24)", // --nh-page-line on ink
  surfaceColor: "#111111", // --nh-charcoal, the raised dark surface
  height: 420,
  width: "100%",
} as const;

// ─── Number and money formatting ───────────────────────────────────────────

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const COUNT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DECIMAL = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Axis values at a thousand and above — "1.2K", "1.2M". */
const COMPACT = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Money, in whole dollars — the API returns revenue as an integer. */
export function formatMoney(value: number): string {
  return MONEY.format(Number.isFinite(value) ? value : 0);
}

/** Whole numbers — bookings and travellers. */
export function formatCount(value: number): string {
  return COUNT.format(Number.isFinite(value) ? value : 0);
}

/** Numbers that may carry a fraction — normalized revenue, axis values. */
export function formatNumber(value: number): string {
  return DECIMAL.format(Number.isFinite(value) ? value : 0);
}

/** Compact axis value: 1_200_000 reads as 1.2M. */
export function formatAxisNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";

  // Below a thousand the plain number reads better; above it, the locale's own
  // compact notation takes over — 1.2K, 1.2M — rather than a hand-rolled suffix.
  if (Math.abs(value) < 1_000) return formatNumber(value);

  return COMPACT.format(value);
}

// ─── Date formatting ───────────────────────────────────────────────────────

// The API returns ISO datetimes at midnight UTC, so every formatter pins the
// time zone — otherwise a reader west of Greenwich sees the day before.
const AXIS_DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const FULL_DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const AXIS_MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});

const FULL_MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Parse an API timestamp, or null when it cannot be read. */
export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Short label for the X-axis. */
export function formatAxisDate(date: Date, range: AnalyticsRange): string {
  return range === "months" ? AXIS_MONTH.format(date) : AXIS_DAY.format(date);
}

/** Medium label — "18 Jul 2026", "Jul 2026". */
export function formatShortDate(date: Date, range: AnalyticsRange): string {
  return range === "months" ? FULL_MONTH.format(date) : FULL_DAY.format(date);
}

/** Full label for the raw-points table. */
export function formatPointDate(date: Date, range: AnalyticsRange): string {
  if (range === "months") return FULL_MONTH.format(date);
  if (range === "weeks") return `Week of ${FULL_DAY.format(date)}`;
  return FULL_DAY.format(date);
}

// ─── Revenue normalization ─────────────────────────────────────────────────

/**
 * Determines the divisor and display suffix for revenue values
 * so the Y-axis remains human-readable regardless of scale.
 */
export function getRevenueScale(data: AnalyticsPoint[]): RevenueScale {
  const maxRevenue = data.reduce(
    (max, item) => (Number.isFinite(item.revenue) ? Math.max(max, item.revenue) : max),
    0,
  );

  if (maxRevenue >= 1_000_000) {
    return { divisor: 1_000_000, suffix: "(M)" };
  }
  if (maxRevenue >= 1_000) {
    return { divisor: 1_000, suffix: "(K)" };
  }
  return { divisor: 1, suffix: "" };
}

// ─── Data transformation ───────────────────────────────────────────────────

/**
 * Transforms raw API data into chart-ready records.
 * Parses ISO date strings, formats display labels, and normalizes revenue.
 */
export function formatChartData(
  data: AnalyticsPoint[],
  scale: RevenueScale,
  range: AnalyticsRange = DEFAULT_RANGE,
): FormattedDataPoint[] {
  return data.map((item) => {
    const date = toDate(item.timestamp);
    return {
      ...item,
      displayDate: date ? formatAxisDate(date, range) : "—",
      fullDate: date ? formatPointDate(date, range) : "Unknown period",
      revenueNormalized: Math.round((item.revenue / scale.divisor) * 100) / 100,
    };
  });
}

// ─── Resolved config helper ────────────────────────────────────────────────

/**
 * Merges user-supplied config with defaults.
 * Returns a fully resolved, non-optional config object.
 */
export function resolveConfig(config?: LineChartConfig) {
  return {
    primaryColor: config?.primaryColor ?? DEFAULT_CONFIG.primaryColor,
    secondaryColor: config?.secondaryColor ?? DEFAULT_CONFIG.secondaryColor,
    tertiaryColor: config?.tertiaryColor ?? DEFAULT_CONFIG.tertiaryColor,
    textColor: config?.textColor ?? DEFAULT_CONFIG.textColor,
    gridColor: config?.gridColor ?? DEFAULT_CONFIG.gridColor,
    axisColor: config?.axisColor ?? DEFAULT_CONFIG.axisColor,
    height: config?.height ?? DEFAULT_CONFIG.height,
    width: config?.width ?? DEFAULT_CONFIG.width,
    range: config?.range ?? DEFAULT_RANGE,
  };
}
