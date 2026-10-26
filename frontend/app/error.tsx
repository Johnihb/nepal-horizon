"use client";

import { useEffect } from "react";

import { ErrorNote } from "@/components/site/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="nh-page">
      <main id="main" className="nh-page-main">
        <div className="mx-auto max-w-2xl">
          <p className="nh-eyebrow nh-eyebrow-row">
            <span>Field Office</span>
            <span className="nh-num">500</span>
          </p>
          <h1 className="nh-display-1 mt-8">
            Something
            <br />
            <em>Broke</em>
          </h1>
          <p className="nh-page-lede mt-6">
            The request did not get through. Reload and we will try again.
          </p>
          <div className="mt-9">
            <ErrorNote
              title="The request did not get through"
              message={error.message || "An unexpected error stopped this page."}
              action={
                <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={reset}>
                  Try Again
                </button>
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
