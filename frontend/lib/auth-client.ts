import { createAuthClient } from "better-auth/react";

function resolveAuthBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_AUTH_URL;
  if (configured && configured !== "/") return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});