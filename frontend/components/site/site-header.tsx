"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/hooks/session";
import { authClient } from "@/lib/auth-client";

type NavLink = {
  href: string;
  label: string;
  /** Only shown to a signed-in traveller. */
  signedInOnly?: boolean;
  /** Only shown to an ADMIN — the console refuses everyone else. */
  adminOnly?: boolean;
  /** Hidden on narrow screens so the strip never clips. */
  narrow?: boolean;
};

const LINKS: NavLink[] = [
  { href: "/packages", label: "Journeys" },
  { href: "/bookings", label: "My Bookings", signedInOnly: true },
  // The staff pages drop out on narrow screens — the strip has no room for
  // five links and a clipped control is worse than a missing one.
  { href: "/dashboard", label: "Field Office", signedInOnly: true, adminOnly: true, narrow: true },
  { href: "/admin", label: "Console", signedInOnly: true, adminOnly: true, narrow: true },
  { href: "/admin/bookings", label: "Booking Queue", signedInOnly: true, adminOnly: true, narrow: true },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useSession();

  // The nav shows exactly the pages a person can open — the console refuses
  // anyone who is not an ADMIN, so it is not offered to them.
  const visible = LINKS.filter(
    (link) => (!link.signedInOnly || user) && (!link.adminOnly || isAdmin),
  );

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <header className="nh-page-nav">
      <div className="nh-page-nav-inner">
        <Link className="nh-mark-dark" href="/" aria-label="Nepal Horizon home">
          <span aria-hidden="true">NH</span>
          <span>NEPAL HORIZON</span>
        </Link>

        <nav className="nh-page-nav-links" aria-label="Primary">
          {visible.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.narrow ? "nh-nav-hide" : undefined}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}

          {/* Sign In is rendered even before the session resolves — the auth
              route is never the thing missing from the nav. */}
          {user ? (
            <button className="nh-nav-auth" type="button" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : (
            <Link className="nh-nav-auth" href="/login">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
