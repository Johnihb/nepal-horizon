import SiteShell from "@/components/site/site-shell";
import AdminConsole from "./admin";

/**
 * The console — the dark half of the material range. The role gate lives in
 * the console itself: no session sends the traveller to sign in, and a
 * session without the ADMIN role is told exactly how to get it.
 */
export default function AdminPage() {
  return (
    <SiteShell tone="ink">
      <AdminConsole />
    </SiteShell>
  );
}
