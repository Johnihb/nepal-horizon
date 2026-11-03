"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import PageHero from "@/components/site/page-hero";
import { ErrorNote } from "@/components/site/states";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const error = params.get("error");
  const verified = params.get("verified") === "1";

  if (error) {
    return (
      <>
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <PageHero
            eyebrow="Field Office"
            index="02"
            title={
              <>
                That link did not <em>open</em>
              </>
            }
            lede="The verification link is invalid or has expired. Request a new one from the sign-in page."
          />
        </div>
        <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
          <div className="max-w-xl">
            <ErrorNote title="Verification failed" message={error} />
            <Link className="nh-btn nh-btn-ink nh-btn-sm mt-6" href="/login">
              Back to sign in
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (verified) {
    return (
      <>
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <PageHero
            eyebrow="Field Office"
            index="02"
            title={
              <>
                Email <em>verified</em>
              </>
            }
            lede="Your email is confirmed. Sign in to pick up where you left off."
          />
        </div>
        <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
          <Link className="nh-btn nh-btn-ink" href="/login">
            Sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <PageHero
          eyebrow="Field Office"
          index="02"
          title={
            <>
              Check your <em>inbox</em>
            </>
          }
          lede="We sent a verification link to your email. Open it to confirm your address, then sign in."
        />
      </div>
      <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
        <Link className="nh-btn nh-btn-ink" href="/login">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
