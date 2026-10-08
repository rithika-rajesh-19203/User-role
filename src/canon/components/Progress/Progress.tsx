import { cn } from '../../utils/cn';

/**
 * PROGRESS — a determinate bar. How far along a thing is, as a fraction.
 *
 * ZF-UPLOAD.md §11 introduces it as a new system primitive, and the reason it is
 * a primitive rather than a part of `Upload` is stated there: *"Nothing in ZF
 * drew determinate progress. Built as its own primitive so the next component
 * that needs one does not draw a second."*
 *
 * ── IT IS DETERMINATE ONLY, AND THAT IS A DECISION ───────────────────────────
 * There is no indeterminate mode. An indeterminate bar is a different component
 * wearing the same shape: it animates forever, it cannot answer "how far", and
 * its accessible form is `aria-valuenow` OMITTED rather than set — which is a
 * different contract, not a different value. Open item 51 lists it as unbuilt
 * along with sizes and a label slot; it stays unbuilt until something needs it.
 *
 * ── THE FLOOR IS LOAD-BEARING ────────────────────────────────────────────────
 * `min-inline-size` is 48. §14.5 measured what happens without it: the bar is
 * the only shrinkable item in a flex meta row, so it absorbs the whole cost of a
 * long percent string — at 90 characters it was 3.72px wide, and at 120 (which a
 * localized byte string reaches) it hit 0 and pushed 140px of text past the row's
 * right border, unclipped. *"A progress bar that can reach 0px is worse than no
 * progress bar: it reads as 'nothing is happening' at exactly the moment
 * something is."*
 *
 * ── ACCESSIBILITY ────────────────────────────────────────────────────────────
 * `role="progressbar"` with `aria-valuenow`/`min`/`max` and a label naming what
 * is progressing. **Never `aria-live`** — §10: a percentage announced on every
 * tick is unusable. The value is there to be polled, not pushed.
 *
 * In forced colors both the track and the fill are backgrounds, and backgrounds
 * flatten — the bar vanishes entirely. It gets an explicit border and a
 * `Highlight` fill so the shape survives (§14.3).
 */
export interface ProgressProps {
  /** 0–100. Clamped, because a caller dividing by a zero total should not paint outside the track. */
  value: number;
  /**
   * Names what is progressing — "Uploading receipt-08.pdf", never "Progress".
   * Required: a bar with no name announces as "progress bar" and a number.
   */
  label: string;
  /**
   * `default` while it runs, `success` when it finishes, `danger` when it fails.
   * Colour is never the only signal — the caller always has the row's own state
   * and its meta text carrying the same fact.
   */
  tone?: 'default' | 'success' | 'danger';
  className?: string;
}

const TONE = {
  default: 'bg-primary-default',
  success: 'bg-success-default',
  danger: 'bg-danger-default',
} as const;

export function Progress({ value, label, tone = 'default', className }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      //  The forced-colors hook. `Highlight` and `CanvasText` are system colours
      //  with no token and no utility, and an arbitrary value would fail rule 1
      //  — correctly, because they are colours. `index.css` carries the real
      //  `@media (forced-colors: active)` rule off this attribute, which is the
      //  same mechanism `MiniList` uses for its selected row.
      data-zf-progress=""
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'h-2 rounded-full overflow-hidden bg-surface-sunken',
        //  `flex-1` so it takes the room a flex row has left, `min-w-progress-min`
        //  so "what it has left" can never be nothing. Both, or neither works.
        'flex-1 min-w-progress-min',
        className,
      )}
    >
      {/*  No radius of its own — the track clips it.

           `transition-all`, not a width-only transition: Tailwind ships no width
           preset, and the arbitrary form is a raw value rule 1 rejects. The only
           two properties that ever change on this element are the width and the
           tone's background, so `all` covers exactly those two. */}
      <div
        className={cn(
          'h-full transition-all duration-200 ease-linear motion-reduce:transition-none',
          TONE[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
