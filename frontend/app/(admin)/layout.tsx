"use client";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { useSession } from "@/hooks/session";

/**
 * The console gate. Client-side, so it costs nothing after the first session
 * read — the header already holds that query, so moving between console pages
 * is free. Signed-out visitors never get here (proxy.ts sends them to /login).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isPending } = useSession();

  // Ink backdrop, not a white flash: the console is the dark half of the range.
  if (isPending) return <div className="nh-page nh-page--ink" aria-busy="true" />;

  if (!isAdmin) redirect("/packages");

  return <>{children}</>;
}
