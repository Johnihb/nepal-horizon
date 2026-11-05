"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSession } from "@/hooks/session";

type Item = { label: string; href: string; hint?: string };

const ITEMS: Item[] = [
  { label: "Console — journeys", href: "/admin", hint: "list, create, edit" },
  { label: "Console — bookings", href: "/admin/bookings", hint: "settle the queue" },
  { label: "Field office", href: "/dashboard", hint: "analytics" },
  { label: "Journeys", href: "/packages", hint: "public ledger" },
  { label: "My bookings", href: "/bookings", hint: "your reservations" },
];

export function CommandPalette() {
  const { isAdmin } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, close]);

  useEffect(() => {
    if (open) {
      // Focus the input on the next frame so the portal is mounted.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  if (!isAdmin || !open) return null;

  function go(item: Item) {
    close();
    router.push(item.href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length === 0) return;
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = filtered[active];
      if (item) go(item);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh]"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[color:var(--nh-page-line)] bg-[color:var(--nh-page-bg)] shadow-2xl">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Search routes…"
          aria-label="Search routes"
          className="w-full border-b border-[color:var(--nh-page-line)] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <ul role="listbox" className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[color:var(--nh-page-muted)]">
              No matches.
            </li>
          ) : (
            filtered.map((item, index) => (
              <li
                key={item.href + item.label}
                role="option"
                aria-selected={index === active}
              >
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm transition-colors ${
                    index === active
                      ? "bg-[color:var(--nh-page-fg)] text-[color:var(--nh-page-bg)]"
                      : "text-[color:var(--nh-page-fg)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hint ? (
                    <span className="text-xs opacity-60">{item.hint}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-[color:var(--nh-page-line)] px-4 py-2 text-xs text-[color:var(--nh-page-muted)]">
          ↑↓ navigate · ↵ open · esc close
        </div>
      </div>
    </div>
  );
}
