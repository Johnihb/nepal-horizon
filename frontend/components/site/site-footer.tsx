import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="nh-page-footer">
      <Link className="nh-mark-dark" href="/" aria-label="Nepal Horizon home">
        <span aria-hidden="true">NH</span>
        <span>NEPAL HORIZON</span>
      </Link>
      <p>Mountain journeys, Nepal</p>
      <a href="mailto:hello@nepalhorizon.travel">hello@nepalhorizon.travel</a>
    </footer>
  );
}
