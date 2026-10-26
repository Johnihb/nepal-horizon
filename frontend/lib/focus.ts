/**
 * Move the caret to the first control that failed validation.
 *
 * Every form in the app keeps its errors in a plain object keyed by field
 * name, and every control carries that name — so the first key is the first
 * thing that needs attention.
 */
export function focusFirstError(
  form: HTMLFormElement | null,
  field: string | undefined,
): void {
  if (!form || !field) return;

  const control = form.querySelector<HTMLElement>(`[name="${field}"]`);
  control?.focus();
}
