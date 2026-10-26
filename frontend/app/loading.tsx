import { LoadingBlock } from "@/components/site/states";

export default function Loading() {
  return (
    <div className="nh-page">
      <main id="main" className="nh-page-main">
        <LoadingBlock rows={2} label="Loading…" />
      </main>
    </div>
  );
}
