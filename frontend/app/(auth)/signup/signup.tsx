"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import PageHero from "@/components/site/page-hero";
import { authClient } from "@/lib/auth-client";
import { focusFirstError } from "@/lib/focus";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** lucide-react v1 dropped brand icons, so the GitHub mark is inlined. */
const GITHUB_MARK_PATH =
  "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 01-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27s-1.36.09-2 .27c-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 010 8c0-4.42 3.58-8 8-8Z";

const BEFORE_YOU_SET_OFF = [
  {
    label: "Your Own Details",
    body: "You set the name, the email and the password yourself. The field office never fills them in for you.",
  },
  {
    label: "Confirmed By Hand",
    body: "Every booking is read by a person in the field office before it is confirmed, dates and permits included.",
  },
  {
    label: "Nothing Charged Online",
    body: "No card is asked for here. The field office settles costs with you before the departure.",
  },
];

function GithubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={GITHUB_MARK_PATH} />
    </svg>
  );
}

/** better-auth hands back plain error objects, so read them defensively. */
function readError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function clearFieldError(field: "name" | "email" | "password") {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate() {
    const next: { name?: string; email?: string; password?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      next.name = "Tell us who is travelling.";
    } else if (trimmedName.length < 2) {
      next.name = "Your name needs at least two characters.";
    }

    if (!trimmedEmail) {
      next.email = "Enter an email the field office can reach you on.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = "That email does not look right. Check it for typos.";
    }

    if (!password) {
      next.password = "Choose a password.";
    } else if (password.length < 8) {
      next.password = "Passwords run to at least eight characters.";
    }

    setFieldErrors(next);
    focusFirstError(
      formRef.current,
      next.name ? "name" : next.email ? "email" : next.password ? "password" : undefined,
    );
    return !next.name && !next.email && !next.password;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!validate()) return;

    setPending(true);
    setFormError(null);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(readError(error, "We could not open your account. Check your details and try again."));
        return;
      }

      router.push("/packages");
      router.refresh();
    } catch (caught) {
      setFormError(readError(caught, "We could not reach the field office. Try again in a moment."));
    } finally {
      setPending(false);
    }
  }

  async function handleGithub() {
    if (socialPending) return;

    setSocialPending(true);
    setFormError(null);

    try {
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "http://localhost:3000/packages",
      });

      if (error) {
        setFormError(readError(error, "GitHub did not open your account. Try again in a moment."));
      }
    } catch (caught) {
      setFormError(readError(caught, "GitHub did not open your account. Try again in a moment."));
    } finally {
      setSocialPending(false);
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
              One account, every <em>journey</em>
            </>
          }
          lede="You set your own details. The field office confirms each booking by hand, then writes to you with the dates, the permits and the full itinerary."
        />
      </div>

      <div className="relative left-1/2 mt-[clamp(2.5rem,5vw,4.5rem)] w-screen -translate-x-1/2 px-[clamp(1.25rem,9vw,10.5rem)]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <section className="nh-panel max-w-xl">
            <p className="nh-eyebrow">Open An Account</p>
            <h2 className="nh-display-3 mt-5">Create Account</h2>
            <p className="nh-muted mt-4 leading-7">
              Your name, your email, your password. Nothing here is shared with anyone, and
              no card is asked for.
            </p>

            {formError ? (
              <div className="nh-alert nh-alert-error mt-7" role="alert">
                {formError}
              </div>
            ) : null}

            <form className="mt-9" onSubmit={handleSubmit} noValidate ref={formRef}>
              <div className="space-y-6">
                <div>
                  <label className="nh-label" htmlFor="signup-name">
                    Full Name
                  </label>
                  <input
                    className="nh-input"
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="As it should read on your permit"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearFieldError("name");
                    }}
                    aria-invalid={fieldErrors.name ? "true" : undefined}
                    aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
                  />
                  {fieldErrors.name ? (
                    <span className="nh-field-error" id="signup-name-error">
                      {fieldErrors.name}
                    </span>
                  ) : null}
                </div>

                <div>
                  <label className="nh-label" htmlFor="signup-email">
                    Email
                  </label>
                  <input
                    className="nh-input"
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearFieldError("email");
                    }}
                    aria-invalid={fieldErrors.email ? "true" : undefined}
                    aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                  />
                  {fieldErrors.email ? (
                    <span className="nh-field-error" id="signup-email-error">
                      {fieldErrors.email}
                    </span>
                  ) : null}
                </div>

                <div>
                  <label className="nh-label" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="nh-input pr-12"
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Eight characters or more"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError("password");
                      }}
                      aria-invalid={fieldErrors.password ? "true" : undefined}
                      aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-[color:var(--nh-page-muted)] transition-colors hover:text-[color:var(--nh-page-fg)]"
                      onClick={() => setShowPassword((shown) => !shown)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <span className="nh-field-error" id="signup-password-error">
                      {fieldErrors.password}
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
                {pending ? (
                  <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                ) : null}
                {pending ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <hr className="nh-rule my-9" />

            <button
              type="button"
              className="nh-btn nh-btn-ghost w-full"
              onClick={handleGithub}
              disabled={socialPending}
            >
              <GithubMark />
              {socialPending ? "Opening GitHub…" : "Continue with GitHub"}
            </button>

            <p className="nh-muted mt-8 text-[0.9rem] leading-7">
              Already travelling with us?{" "}
              <Link className="nh-link" href="/login">
                Sign in
              </Link>
            </p>
          </section>

          <aside className="max-w-md">
            <p className="nh-eyebrow">Before You Set Off</p>

            <ul className="mt-8">
              {BEFORE_YOU_SET_OFF.map((row) => (
                <li key={row.label} className="nh-border border-t py-5 last:border-b">
                  <p className="nh-meta">{row.label}</p>
                  <p className="nh-muted mt-2 text-[0.92rem] leading-7">{row.body}</p>
                </li>
              ))}
            </ul>

            <p className="nh-muted mt-9 text-[0.9rem] leading-7">
              Bookings are confirmed by the field office, not by this page. Once you have an
              account, every journey you request is written back to you by hand.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
