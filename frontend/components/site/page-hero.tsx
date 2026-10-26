import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  /** Ledger position — the number that tells the reader where they are. */
  index: string;
  title: React.ReactNode;
  lede?: string;
  actions?: React.ReactNode;
  className?: string;
};

/** The opening band of every page: a ledger index, then the statement. */
export default function PageHero({
  eyebrow,
  index,
  title,
  lede,
  actions,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("nh-page-hero", className)}>
      <div className="nh-page-hero-inner">
        <p className="nh-eyebrow nh-eyebrow-row">
          <span>{eyebrow}</span>
          <span className="nh-num">{index}</span>
        </p>

        <h1 className="nh-display-1 mt-8 max-w-4xl">{title}</h1>

        {lede ? <p className="nh-page-lede mt-6">{lede}</p> : null}

        {actions ? <div className="mt-9 flex flex-wrap items-center gap-4">{actions}</div> : null}
      </div>
    </section>
  );
}
