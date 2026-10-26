import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Nothing to show — say what is missing and what to do next. */
export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("nh-panel text-center", className)}>
      <p className="nh-eyebrow justify-center">{eyebrow}</p>
      <h2 className="nh-display-2 mx-auto mt-5 max-w-2xl">{title}</h2>
      {description ? (
        <p className="nh-muted mx-auto mt-4 max-w-xl text-[0.95rem] leading-7">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

/** Something went wrong — say what, and say what to do about it. */
export function ErrorNote({
  title = "That did not go through",
  message,
  action,
  className,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("nh-alert nh-alert-error", className)} role="alert">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Placeholder blocks while a request is in flight. */
export function LoadingBlock({
  rows = 3,
  label = "Loading…",
  className,
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="nh-panel nh-panel-flush overflow-hidden">
          <div className="nh-skeleton h-52 w-full" />
          <div className="space-y-3 p-6">
            <div className="nh-skeleton h-3 w-28" />
            <div className="nh-skeleton h-6 w-2/3" />
            <div className="nh-skeleton h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
