import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nh-page">
      <a className="nh-skip" href="#main">
        Skip to content
      </a>
      <main id="main" className="flex-1">
        <section className="nh-page-hero">
          <div className="nh-page-hero-inner">
            <p className="nh-eyebrow nh-eyebrow-row">
              <span>Off Route</span>
              <span className="nh-num">404</span>
            </p>
            <h1 className="nh-display-1 mt-8 max-w-3xl">
              This Path
              <br />
              Is <em>Closed</em>
            </h1>
            <p className="nh-page-lede mt-6">
              The page you were looking for is not on the map. The journeys are.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link className="nh-btn nh-btn-ink" href="/packages">
                Browse Journeys
              </Link>
              <Link className="nh-btn nh-btn-ghost" href="/">
                Back To The Front
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
