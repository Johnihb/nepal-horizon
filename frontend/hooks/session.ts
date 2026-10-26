"use client";

import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/types/package";

/**
 * The signed-in traveller. The API returns `role` on the session user even
 * though it is not part of the generated type, so it is surfaced here once.
 */
export function useSession() {
  const query = authClient.useSession();

  return {
    ...query,
    user: query.data?.user as SessionUser | undefined,
    isAdmin: (query.data?.user as SessionUser | undefined)?.role === "ADMIN",
  };
}
