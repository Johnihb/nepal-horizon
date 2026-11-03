"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import PageHero from "@/components/site/page-hero";
import { authClient } from "@/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError("Enter an email the field office can reach you on.");
      return false;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError("That email does not look right. Check it for typos.");
      return false;
    }
    setFieldError(null);
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!validate()) return;

    setPending(true);
    setFormError(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "http://localhost:3000/reset-password",
      });
      if (error) {
        setFormError(error.message || "We could not send the reset link. Try again in a moment.");
        return;
      }
      setSent(true);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "We could not reach the field office. Try again in a moment.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <PageHero
          eyebrow="Field Office"
          index="02"
          title={
            <>
              Reset your <em>password</em>
            </>
          }
          lede="Enter the email on your account and we will send you a link to set a new password."
        />
      </div>

      <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
        <section className="nh-panel max-w-xl">
          {sent ? (
            <>
              <p className="nh-eyebrow">Link sent</p>
              <h2 className="nh-display-3 mt-5">Check your inbox</h2>
              <p className="nh-muted mt-4 leading-7">
                If an account exists for {email.trim()}, a reset link is on its way. It expires
                shortly, so use it soon.
              </p>
              <Link className="nh-btn nh-btn-ink nh-btn-sm mt-9" href="/login">
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p className="nh-eyebrow">Forgot Password</p>
              <h2 className="nh-display-3 mt-5">Request a reset</h2>

              {formError ? (
                <div className="nh-alert nh-alert-error mt-7" role="alert">
                  {formError}
                </div>
              ) : null}

              <form className="mt-9" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="nh-label" htmlFor="forgot-email">
                    Email
                  </label>
                  <input
                    className="nh-input"
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (fieldError) setFieldError(null);
                    }}
                    aria-invalid={fieldError ? "true" : undefined}
                    aria-describedby={fieldError ? "forgot-email-error" : undefined}
                  />
                  {fieldError ? (
                    <span className="nh-field-error" id="forgot-email-error">
                      {fieldError}
                    </span>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="nh-btn nh-btn-ink mt-9 w-full"
                  disabled={pending}
                  aria-live="polite"
                >
                  {pending ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="nh-muted mt-8 text-[0.9rem] leading-7">
                Remembered it?{" "}
                <Link className="nh-link" href="/login">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
