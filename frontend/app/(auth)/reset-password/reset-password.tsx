"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import PageHero from "@/components/site/page-hero";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
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
            lede="The reset link is missing or has expired. Request a new one from the sign-in page."
          />
        </div>
        <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
          <Link className="nh-btn nh-btn-ink" href="/forgot-password">
            Request a new link
          </Link>
        </div>
      </>
    );
  }

  function validate() {
    const next: { password?: string; confirm?: string } = {};
    if (!password) {
      next.password = "Choose a password.";
    } else if (password.length < 8) {
      next.password = "Passwords run to at least eight characters.";
    }
    if (!confirm) {
      next.confirm = "Repeat the password.";
    } else if (confirm !== password) {
      next.confirm = "The two passwords do not match.";
    }
    setFieldErrors(next);
    return !next.password && !next.confirm;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!validate()) return;

    setPending(true);
    setFormError(null);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });
      if (error) {
        setFormError(error.message || "We could not reset your password. The link may have expired.");
        return;
      }
      setDone(true);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "We could not reach the field office. Try again in a moment.",
      );
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <>
        <div className="relative left-1/2 w-screen -translate-x-1/2">
          <PageHero
            eyebrow="Field Office"
            index="02"
            title={
              <>
                Password <em>reset</em>
              </>
            }
            lede="Your password is updated. Sign in with the new one."
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
              Set a new <em>password</em>
            </>
          }
          lede="Choose a password of at least eight characters."
        />
      </div>

      <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
        <section className="nh-panel max-w-xl">
          {formError ? (
            <div className="nh-alert nh-alert-error mt-7" role="alert">
              {formError}
            </div>
          ) : null}

          <form className="mt-9" onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <label className="nh-label" htmlFor="reset-password">
                  New password
                </label>
                <input
                  className="nh-input"
                  id="reset-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Eight characters or more"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) setFieldErrors((c) => ({ ...c, password: undefined }));
                  }}
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                  aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
                />
                {fieldErrors.password ? (
                  <span className="nh-field-error" id="reset-password-error">
                    {fieldErrors.password}
                  </span>
                ) : null}
              </div>

              <div>
                <label className="nh-label" htmlFor="reset-confirm">
                  Repeat password
                </label>
                <input
                  className="nh-input"
                  id="reset-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat it"
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    if (fieldErrors.confirm) setFieldErrors((c) => ({ ...c, confirm: undefined }));
                  }}
                  aria-invalid={fieldErrors.confirm ? "true" : undefined}
                  aria-describedby={fieldErrors.confirm ? "reset-confirm-error" : undefined}
                />
                {fieldErrors.confirm ? (
                  <span className="nh-field-error" id="reset-confirm-error">
                    {fieldErrors.confirm}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              className="nh-btn nh-btn-ink mt-9 w-full"
              disabled={pending}
              aria-live="polite"
            >
              {pending ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <p className="nh-muted mt-8 text-[0.9rem] leading-7">
            <Link className="nh-link" href="/login">
              Back to sign in
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
