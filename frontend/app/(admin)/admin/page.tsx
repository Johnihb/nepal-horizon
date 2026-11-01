import SiteShell from "@/components/site/site-shell";
import AdminConsole from "./admin";

/** The console — the dark half of the material range. (admin)/layout.tsx gates it. */
export default function AdminPage() {
  return (
    <SiteShell tone="ink">
      <AdminConsole />
    </SiteShell>
  );
}
