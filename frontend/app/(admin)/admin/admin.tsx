"use client";

import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, RefObject } from "react";

import PageHero from "@/components/site/page-hero";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { usePackagePagination } from "@/hooks/get";
import {
  useCreatePackage,
  useDeletePackage,
  useUpdatePackage,
  useUploadImages,
} from "@/hooks/post";
import { useSession } from "@/hooks/session";
import { toApiError } from "@/lib/api";
import { focusFirstError } from "@/lib/focus";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PackagePayload, TravelPackage, UploadedImage } from "@/types/package";

/** The statement that opens the console. One italicised word, as always. */
function ConsoleHero() {
  return (
    <PageHero
      eyebrow="Console"
      index="01"
      title={
        <>
          Every Journey, <em>Edited</em> Here
        </>
      }
      lede="Publish a departure, correct a price, retire a route. Everything you change in here is what a traveller reads on the journeys page."
    />
  );
}

/** The grant the role statement. Run it in the database, then sign in again. */
const GRANT_ADMIN = `UPDATE "user" from USER to SuperPowerfulAcessedOne';`;

type Draft = {
  name: string;
  location: string;
  description: string;
  price: string;
};

type PendingImage = UploadedImage & {
  /** True when the photograph was already on the journey before this edit. */
  existing: boolean;
};

const EMPTY_DRAFT: Draft = { name: "", location: "", description: "", price: "" };

/**
 * The console. The gate lives above it: no session sends the traveller to the
 * sign-in page, and a session without the ADMIN role is told how to get it.
 */
export default function AdminConsole() {
  const { user, isAdmin, isPending } = useSession();

  if (isPending) {
    return (
      <>
        <ConsoleHero />
        <div className="nh-page-main">
          <LoadingBlock rows={2} label="Checking your session…" />
        </div>
      </>
    );
  }

  if (!user) redirect("/login");

  if (!isAdmin) {
    return (
      <>
        <ConsoleHero />
        <div className="nh-page-main">
          <div className="nh-alert nh-alert-info">
            <p className="font-semibold">The console is for the field office.</p>
            <p className="mt-1">
              You are signed in as{" "}
              <span className="nh-accent break-all">{user.email}</span>, but this account
              does not carry the ADMIN role, so the console stays closed. The role lives on
              the user row — grant it in the database:
            </p>
            <pre className="nh-panel mt-5 overflow-x-auto font-mono text-xs leading-6 text-[color:var(--nh-page-fg)]">
              {GRANT_ADMIN}
            </pre>
            <p className="mt-4 text-[0.82rem] opacity-75">
              Sign out and back in afterwards — the role is read with the session.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConsoleHero />
      <Suspense
        fallback={
          <div className="nh-page-main">
            <LoadingBlock rows={3} label="Loading journeys…" />
          </div>
        }
      >
        <Console email={user.email} />
      </Suspense>
    </>
  );
}

/** The page before this one, or null when this is the first. */
function retreatHref(page: number): string | null {
  if (page <= 0) return null;
  return page === 1 ? "/admin" : `/admin?page=${page - 1}`;
}

/** The page after this one, or null when this is the last. */
function nextHref(nextPage: number | null): string | null {
  return nextPage === null ? null : `/admin?page=${nextPage}`;
}

/** The working half of the console: the ledger of journeys, and the editor. */
function Console({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  const { data, error, isError, isLoading, isFetching, refetch } = usePackagePagination(page);

  const journeys = data?.packages ?? [];
  const nextPage = data?.nextPage ?? null;

  const [editing, setEditing] = useState<TravelPackage | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const editorRef = useRef<HTMLElement>(null);

  const photographs = journeys.reduce((total, journey) => total + (journey.media?.length ?? 0), 0);
  const cheapest = journeys.length
    ? formatMoney(Math.min(...journeys.map((journey) => journey.price)))
    : "—";

  /** Bring the editor into view and put the caret in its first field. */
  function focusEditor() {
    window.requestAnimationFrame(() => {
      const editor = editorRef.current;
      editor?.scrollIntoView({ behavior: "instant", block: "nearest" });
      editor?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
    });
  }

  function startNew() {
    setEditing(null);
    setDraftCount((count) => count + 1);
    focusEditor();
  }

  function startEdit(journey: TravelPackage) {
    setEditing(journey);
    focusEditor();
  }

  return (
    <div className="nh-page-main">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="nh-eyebrow">Journeys</p>
          <h2 className="nh-display-2 mt-4">
            The <em>Ledger</em>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <p className="nh-meta break-all">Signed in as {email}</p>
          <Link className="nh-btn nh-btn-ghost nh-btn-sm" href="/admin/bookings">
            Booking Queue
          </Link>
          <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={startNew}>
            New Journey
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="nh-stat">
          <span className="nh-stat-label">Journeys on this page</span>
          <span className="nh-stat-value nh-num">{journeys.length}</span>
        </div>
        <div className="nh-stat">
          <span className="nh-stat-label">Photographs on this page</span>
          <span className="nh-stat-value nh-num">{photographs}</span>
        </div>
        <div className="nh-stat">
          <span className="nh-stat-label">Cheapest from</span>
          <span className="nh-stat-value">{cheapest}</span>
        </div>
      </div>

      <div className="mt-12">
        {isError ? (
          <ErrorNote
            title="The ledger did not open"
            message={toApiError(error).message}
            action={
              <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={() => refetch()}>
                Try Again
              </button>
            }
          />
        ) : isLoading ? (
          <LoadingBlock rows={3} label="Loading journeys…" />
        ) : journeys.length === 0 ? (
          <EmptyState
            eyebrow="No journeys"
            title={
              <>
                Nothing is <em>open</em> right now.
              </>
            }
            description="The ledger is empty. Publish the first departure and it will appear on the journeys page straight away."
            action={
              <button type="button" className="nh-btn nh-btn-ink nh-btn-sm" onClick={startNew}>
                Add the First Journey
              </button>
            }
          />
        ) : (
          <>
            <div className="nh-table-wrap">
              <table className="nh-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Location</th>
                    <th scope="col">Price</th>
                    <th scope="col">Images</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((journey) => {
                    const cover = journey.media?.find((media) => media.url);
                    const count = journey.media?.length ?? 0;

                    return (
                      <tr key={journey.id}>
                        <td>
                          <span className="block">{journey.name}</span>
                          <span className="nh-meta block">Added {formatDate(journey.createdAt)}</span>
                        </td>
                        <td>{journey.location}</td>
                        <td className="nh-num whitespace-nowrap">{formatMoney(journey.price)}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            {cover ? (
                              <span className="nh-frame block h-11 w-11 shrink-0">
                                <img src={cover.url} alt="" width={44} height={44} />
                              </span>
                            ) : (
                              <span
                                className="nh-frame nh-band-ink block h-11 w-11 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span className="nh-meta nh-num">{count}</span>
                          </div>
                        </td>
                        <td>
                          <RowActions journey={journey} onEdit={() => startEdit(journey)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <nav
              className="mt-10 flex items-center justify-between border-t border-[color:var(--nh-page-line)] pt-8"
              aria-label="Journey pagination"
            >
              {retreatHref(page) ? (
                <Link className="nh-btn nh-btn-ghost nh-btn-sm" href={retreatHref(page) as string}>
                  ← Retreat
                </Link>
              ) : (
                <span className="nh-btn nh-btn-ghost nh-btn-sm opacity-40" aria-disabled="true">
                  ← Retreat
                </span>
              )}

              <span className="nh-meta hidden sm:inline">
                Page {page + 1}
                {nextPage !== null ? ` of ${nextPage + 1}+` : ""}
              </span>

              {nextHref(nextPage) ? (
                <Link className="nh-btn nh-btn-ghost nh-btn-sm" href={nextHref(nextPage) as string}>
                  Next journey →
                </Link>
              ) : (
                <span className="nh-btn nh-btn-ghost nh-btn-sm opacity-40" aria-disabled="true">
                  Next journey →
                </span>
              )}
            </nav>

            {isFetching ? (
              <p className="nh-meta mt-4" role="status">
                Refreshing…
              </p>
            ) : null}
          </>
        )}
      </div>

      <JourneyEditor
        key={editing ? editing.id : `new-${draftCount}`}
        journey={editing}
        onCancel={() => setEditing(null)}
        editorRef={editorRef}
      />
    </div>
  );
}

/**
 * The two actions on a journey. Deleting asks twice — the first click only
 * arms the confirmation, it never calls the API.
 */
function RowActions({
  journey,
  onEdit,
}: {
  journey: TravelPackage;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const remove = useDeletePackage(journey.id);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="nh-btn nh-btn-danger nh-btn-sm"
          disabled={remove.isPending}
          onClick={() =>
            remove.mutate(undefined, {
              onSuccess: () => setConfirming(false),
            })
          }
        >
          {remove.isPending ? "Deleting…" : "Confirm Delete"}
        </button>

        <button
          type="button"
          className="nh-btn nh-btn-ghost nh-btn-sm"
          disabled={remove.isPending}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>

        {remove.isError ? (
          <span className="nh-field-error" role="alert">
            {toApiError(remove.error).message}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={onEdit}>
        Edit
      </button>
      <button
        type="button"
        className="nh-btn nh-btn-danger nh-btn-sm"
        onClick={() => setConfirming(true)}
      >
        Delete
      </button>
    </div>
  );
}

/**
 * The editor. When a journey is being edited its photographs are loaded into
 * the pending list first — the API replaces the whole set on save, so an image
 * left out of the payload would be silently deleted.
 */
function JourneyEditor({
  journey,
  onCancel,
  editorRef,
}: {
  journey: TravelPackage | null;
  onCancel: () => void;
  editorRef: RefObject<HTMLElement | null>;
}) {
  const [draft, setDraft] = useState<Draft>(() => ({
    name: journey?.name ?? "",
    location: journey?.location ?? "",
    description: journey?.description ?? "",
    price: journey ? String(journey.price) : "",
  }));

  const [images, setImages] = useState<PendingImage[]>(() =>
    (journey?.media ?? []).map((media) => ({
      url: media.url,
      public_id: media.public_id,
      existing: true,
    })),
  );

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [apiFields, setApiFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  /** What the journey looked like when the editor opened — the dirty baseline. */
  const [baseline] = useState(() => ({
    name: journey?.name ?? "",
    location: journey?.location ?? "",
    description: journey?.description ?? "",
    price: journey ? String(journey.price) : "",
    images: (journey?.media ?? []).map((media) => media.public_id).join("|"),
  }));

  const create = useCreatePackage();
  const update = useUpdatePackage(journey?.id ?? "");
  const upload = useUploadImages();

  const saving = create.isPending || update.isPending;

  /** True when the draft no longer matches the journey it was opened on. */
  const dirty =
    draft.name !== baseline.name ||
    draft.location !== baseline.location ||
    draft.description !== baseline.description ||
    draft.price !== baseline.price ||
    images.map((image) => image.public_id).join("|") !== baseline.images;

  /** Cancelling throws the draft away, so an edited journey asks first. */
  function handleCancel() {
    if (!dirty) {
      onCancel();
      return;
    }

    setConfirmingCancel(true);
  }

  /** The API answers with one message per field — `images.0.url` and friends. */
  function fieldError(name: string): string | undefined {
    if (apiFields[name]) return apiFields[name];

    const nested = Object.entries(apiFields).find(([key]) => key.startsWith(`${name}.`));
    if (nested) return nested[1];

    return localErrors[name];
  }

  function clearError(field: keyof Draft) {
    setLocalErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

    setApiFields((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateField(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    clearError(field);
  }

  function removeImage(publicId: string) {
    setImages((current) => current.filter((image) => image.public_id !== publicId));
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    input.value = "";

    if (!files.length) return;

    try {
      const result = await upload.mutateAsync(files);

      setImages((current) => [
        ...current,
        ...result.uploaded.map((image) => ({ ...image, existing: false })),
      ]);

      if (result.failed > 0) {
        setNotice({
          tone: "error",
          text: `${result.failed} file${result.failed === 1 ? "" : "s"} did not upload. Check the file and try again.`,
        });
      }
    } catch (error) {
      setNotice({ tone: "error", text: toApiError(error).message });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setApiFields({});

    const name = draft.name.trim();
    const location = draft.location.trim();
    const price = Number(draft.price);

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Give the journey a name.";
    else if (name.length < 2) errors.name = "The name needs at least two characters.";
    if (!location) errors.location = "Say where the journey runs.";
    else if (location.length < 2) errors.location = "The location needs at least two characters.";
    if (!draft.price.trim()) errors.price = "Set the price per person.";
    else if (!Number.isFinite(price) || price <= 0)
      errors.price = "The price must be greater than zero.";

    setLocalErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstError(formRef.current, Object.keys(errors)[0]);
      return;
    }

    const payload: PackagePayload = {
      name,
      location,
      price,
      images: images.map((image) => ({ public_id: image.public_id, url: image.url })),
    };

    const description = draft.description.trim();
    if (description) payload.description = description;

    try {
      if (journey) {
        await update.mutateAsync(payload);
        setNotice({ tone: "ok", text: "The journey has been updated." });
      } else {
        await create.mutateAsync(payload);
        setNotice({ tone: "ok", text: "The journey has been published." });
        setDraft(EMPTY_DRAFT);
        setImages([]);
      }
    } catch (error) {
      const api = toApiError(error);
      const fields = api.fields ?? {};
      setApiFields(fields);
      setNotice({ tone: "error", text: api.message });

      const first = Object.keys(fields)[0];
      if (first) focusFirstError(formRef.current, first.split(".")[0]);
    }
  }

  return (
    <section ref={editorRef} className="nh-panel mt-16" aria-labelledby="journey-editor-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="nh-eyebrow">{journey ? "Editing" : "New"}</p>
          <h2 id="journey-editor-heading" className="nh-display-3 mt-4">
            {journey ? (
              <>
                Correct this <em>journey</em>
              </>
            ) : (
              <>
                Add a <em>journey</em>
              </>
            )}
          </h2>
        </div>

        {journey ? (
          confirmingCancel ? (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="nh-btn nh-btn-danger nh-btn-sm" onClick={onCancel}>
                Discard Changes
              </button>
              <button
                type="button"
                className="nh-btn nh-btn-ghost nh-btn-sm"
                onClick={() => setConfirmingCancel(false)}
              >
                Keep Editing
              </button>
            </div>
          ) : (
            <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={handleCancel}>
              Cancel Edit
            </button>
          )
        ) : null}
      </div>

      {notice ? (
        <div
          className={cn(
            "nh-alert mt-8",
            notice.tone === "ok" ? "nh-alert-ok" : "nh-alert-error",
          )}
          role={notice.tone === "ok" ? "status" : "alert"}
        >
          {notice.text}
        </div>
      ) : null}

      <form
        ref={formRef}
        className="mt-8 grid gap-6 md:grid-cols-2"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label className="nh-label" htmlFor="journey-name">
            Name
          </label>
          <input
            id="journey-name"
            name="name"
            type="text"
            className="nh-input"
            autoComplete="off"
            value={draft.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={fieldError("name") ? true : undefined}
            aria-describedby={fieldError("name") ? "journey-name-error" : undefined}
            placeholder="Annapurna Circuit"
          />
          {fieldError("name") ? (
            <span className="nh-field-error" id="journey-name-error">
              {fieldError("name")}
            </span>
          ) : null}
        </div>

        <div>
          <label className="nh-label" htmlFor="journey-location">
            Location
          </label>
          <input
            id="journey-location"
            name="location"
            type="text"
            className="nh-input"
            autoComplete="off"
            value={draft.location}
            onChange={(event) => updateField("location", event.target.value)}
            aria-invalid={fieldError("location") ? true : undefined}
            aria-describedby={fieldError("location") ? "journey-location-error" : undefined}
            placeholder="Pokhara → Annapurna"
          />
          {fieldError("location") ? (
            <span className="nh-field-error" id="journey-location-error">
              {fieldError("location")}
            </span>
          ) : null}
        </div>

        <div>
          <label className="nh-label" htmlFor="journey-price">
            Price per person
          </label>
          <input
            id="journey-price"
            name="price"
            type="number"
            className="nh-input"
            inputMode="numeric"
            min="1"
            step="1"
            value={draft.price}
            onChange={(event) => updateField("price", event.target.value)}
            aria-invalid={fieldError("price") ? true : undefined}
            aria-describedby={fieldError("price") ? "journey-price-error" : undefined}
            placeholder="2400"
          />
          {fieldError("price") ? (
            <span className="nh-field-error" id="journey-price-error">
              {fieldError("price")}
            </span>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="nh-label" htmlFor="journey-description">
            Description
          </label>
          <textarea
            id="journey-description"
            name="description"
            className="nh-input"
            rows={5}
            maxLength={255}
            value={draft.description}
            onChange={(event) => updateField("description", event.target.value)}
            aria-invalid={fieldError("description") ? true : undefined}
            aria-describedby={fieldError("description") ? "journey-description-error" : undefined}
            placeholder="Twelve days on the ridge, three camps, two passes."
          />
          {fieldError("description") ? (
            <span className="nh-field-error" id="journey-description-error">
              {fieldError("description")}
            </span>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="nh-label" htmlFor="journey-images">
            Images
          </label>
          <input
            id="journey-images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="nh-input"
            disabled={upload.isPending}
            aria-invalid={fieldError("images") ? true : undefined}
            aria-describedby={fieldError("images") ? "journey-images-error" : undefined}
            onChange={handleFiles}
          />

          <p className="nh-meta mt-3">
            {journey
              ? "Saving replaces the whole set — remove a photograph here and it is deleted from the journey."
              : "Photographs travel straight to the image host. The first one leads the listing."}
          </p>

          {fieldError("images") ? (
            <span className="nh-field-error" id="journey-images-error">
              {fieldError("images")}
            </span>
          ) : null}

          {images.length ? (
            <ul className="mt-6 flex flex-wrap gap-5">
              {images.map((image, index) => (
                <li key={image.public_id} className="w-32">
                  <div className="nh-frame aspect-square">
                    <img
                      src={image.url}
                      alt={`${journey?.name ?? "New journey"} — photograph ${index + 1}`}
                      width={128}
                      height={128}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <span className={cn("nh-badge mt-3", image.existing ? "nh-badge-neutral" : "")}>
                    {image.existing ? "Existing" : "New"}
                  </span>

                  <button
                    type="button"
                    className="nh-btn nh-btn-danger nh-btn-sm mt-3 w-full"
                    onClick={() => removeImage(image.public_id)}
                    aria-label={`Remove photograph ${index + 1}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nh-muted mt-4 text-sm">No photographs yet.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="nh-btn nh-btn-ink" disabled={saving}>
            {saving ? "Saving…" : journey ? "Save Changes" : "Publish Journey"}
          </button>
        </div>
      </form>
    </section>
  );
}
