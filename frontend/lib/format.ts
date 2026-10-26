/** Shared formatters — never hand-format money or dates. */

export function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  // "en-GB" so a date reads the same way on a journey page and on the ledger —
  // the chart already speaks this date.
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}
