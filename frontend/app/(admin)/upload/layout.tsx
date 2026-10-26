import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

/** The gate: no session, no page. */
export default async function UploadLayout({ children }: { children: ReactNode }) {
  const response = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!response?.data?.user) redirect("/login");

  return <>{children}</>;
}
