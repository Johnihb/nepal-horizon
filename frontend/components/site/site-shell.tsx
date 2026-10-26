import { cn } from "@/lib/utils";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";

type SiteShellProps = {
  children: React.ReactNode;
  /** `ink` flips the page to the dark half of the material range. */
  tone?: "paper" | "ink";
};

/** The frame every page outside the landing route sits in. */
export default function SiteShell({ children, tone = "paper" }: SiteShellProps) {
  return (
    <div className={cn("nh-page", tone === "ink" && "nh-page--ink")}>
      <a className="nh-skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
