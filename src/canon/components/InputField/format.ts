import type { InputHTMLAttributes } from 'react';

/**
 * INPUT FORMATTING — a pure module, and that separation is not cosmetic.
 *
 * `applyFormat` used to be exported from `InputField.tsx`. A React component
 * file that also exports a plain function is not a valid Fast Refresh boundary,
 * so Vite could not hot-update it: every edit anywhere in the tree logged
 * `hmr invalidate ... "applyFormat" export is incompatible` and fell back to a
 * FULL invalidate of the module graph beneath it. Three days of that is how a
 * long-lived tab drifts out of sync with the source on disk.
 *
 * Types were never the problem — `export type` is erased. A runtime export is.
 * So the function lives here, `InputField` and `ProductTable` both import it,
 * and both files export components and nothing else.
 */

/**
 * WHAT THE FIELD WILL ACCEPT. The characters are filtered on the way in, so a
 * paste cannot get past it either — `change` fires after a paste, which is why
 * this is done there rather than on `keydown`.
 *
 * ── AND WHY NONE OF THEM IS `type="number"` ─────────────────────────────────
 * It is the obvious answer and it is wrong for every one of these:
 *
 * · a scroll wheel over a focused number input **changes the value**, silently,
 *   while the user is scrolling the page past it;
 * · it drops leading zeros, so an account number or a pin cannot be typed;
 * · its spinners are unstyleable and add furniture to a 34px control;
 * · and it accepts `e`, `+` and `-` anywhere, so `1e5` is a "valid number" —
 *   which is exactly the class of thing this prop exists to stop.
 *
 * `type="text"` with `inputMode` gets the right mobile keyboard without any of
 * that, and the filter does what `type="number"` only appears to.
 *
 * ── AND `date` IS NOT `type="date"` EITHER ──────────────────────────────────
 * · its picker is painted by the OS and cannot be made to match the 34px field
 *   beside it, the same reason `Select` is not a native `<select>`;
 * · **its displayed format follows the browser's locale**, so the same stored
 *   value reads `22/03/2026` to one user and `03/22/2026` to another — and the
 *   placeholder saying `DD/MM/YYYY` would be a lie for half of them;
 * · its value is always ISO `YYYY-MM-DD`, which is a second format for every
 *   consumer to convert, and a third once someone forgets.
 *
 * A masked text field shows exactly one format to everybody and hands back
 * exactly the string the placeholder promised.
 */
export type InputFormat = 'text' | 'numeric' | 'decimal' | 'tel' | 'date';

const FILTER: Record<InputFormat, RegExp | null> = {
  text: null,
  numeric: /[^0-9]/g,
  //  One dot, and it may lead. `-` only at the start, so `1-2` cannot happen.
  decimal: /[^0-9.-]/g,
  //  §: the punctuation a phone number is actually written with.
  tel: /[^0-9+()\-\s]/g,
  //  Handled by `maskDate`, which needs the digits and nothing else.
  date: null,
};

export const MODE: Record<InputFormat, InputHTMLAttributes<HTMLInputElement>['inputMode']> = {
  text: undefined, numeric: 'numeric', decimal: 'decimal', tel: 'tel', date: 'numeric',
};

/**
 * `DD/MM/YYYY`, built from the digits.
 *
 * ── THE SEPARATOR IS LAZY, AND THAT IS THE WHOLE TRICK ──────────────────────
 * A slash is only added when a digit FOLLOWS it. Append it eagerly — `22` →
 * `22/` — and backspace becomes a trap: the user deletes the slash, the mask
 * puts it straight back, and the field cannot be emptied from the right.
 *
 * Deriving the whole string from the digits rather than editing it in place is
 * what makes that work. There is no state in which the separators are wrong,
 * because they are never kept — only the digits are.
 */
function maskDate(digits: string): string {
  const d = digits.slice(0, 8);
  return d.slice(0, 2)
    + (d.length > 2 ? `/${d.slice(2, 4)}` : '')
    + (d.length > 4 ? `/${d.slice(4)}` : '');
}

/**
 * Exported so a bare cell input — `ProductTable`'s — treats a value identically.
 * Named `apply` and not `filter` because `date` MASKS as well as strips.
 */
export function applyFormat(value: string, format: InputFormat): string {
  if (format === 'date') return maskDate(value.replace(/[^0-9]/g, ''));
  const re = FILTER[format];
  if (!re) return value;
  let out = value.replace(re, '');
  if (format === 'decimal') {
    //  Keep the FIRST dot and the LEADING minus; drop the rest. Doing it by
    //  regex alone cannot express "one of these, in this position".
    const neg = out.startsWith('-');
    const [head, ...tail] = out.replace(/-/g, '').split('.');
    out = (neg ? '-' : '') + head + (tail.length ? `.${tail.join('')}` : '');
  }
  return out;
}
