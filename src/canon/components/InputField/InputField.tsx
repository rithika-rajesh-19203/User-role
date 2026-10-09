import { useCallback, useRef } from 'react';
import type { InputHTMLAttributes, Ref } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';
import { DatePicker } from '../DatePicker/DatePicker';
import { applyFormat, MODE, type InputFormat } from './format';

export type { InputFormat };

/**
 * INPUT FIELD — design-refs/zf-input-field.md, the `Input Field/States` half.
 * **The input box only.**
 *
 * §1 is explicit about which of the two components to reach for: **`Field` by
 * default.** This one stays public because a few places need a bare box — a
 * table's inline edit cell, a search field in a toolbar — but anything on a form
 * wants the wrapper, "because that is what makes the label travel with the input
 * instead of being a sibling someone has to remember to add."
 *
 * ── 18 FIGMA VARIANTS COLLAPSE TO 2 ──────────────────────────────────────────
 * `States` (5) × `is_error` (2) × `Content` (2), minus Disabled+error = 18.
 *
 *   `States`  — Default / Hover / On-Click / Focus / Disabled are all native
 *               pseudo-classes on an `<input>`. §5 also measures that Hover and
 *               On-Click render IDENTICALLY, so the five options produce four
 *               appearances even in Figma.
 *   `Content` — placeholder vs value is not a variant in a real input. It is
 *               whether the element has a value, and `::placeholder` is the
 *               selector. §3.2 exists because a designer had to override the
 *               text colour by hand; a browser does it for free.
 *
 * That leaves `error`. Everything else is the DOM doing its job.
 *
 * ── THE ICONS DEFAULT OFF ────────────────────────────────────────────────────
 * §3: Figma had `Icon Left` and `Icon Right` defaulting to `true`, so a freshly
 * placed field arrived with two glyphs. Fixed there, and matched here. §1.1 also
 * settles that they are booleans and not variants — as variants they would have
 * multiplied 18 into 72.
 */

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  /**
   * What the field accepts. `text` (default) accepts anything; the rest filter
   * on the way in and set the matching mobile keyboard. `date` also MASKS —
   * typing `22032026` becomes `22/03/2026`. Never `type="number"`, and never
   * `type="date"` — see `InputFormat`.
   */
  format?: InputFormat;
  /** §3.3 — a real icon instance, 16 × 16, inheriting the theme. Off by default. */
  icon?: IconName;
  iconRight?: IconName;
  /**
   * A unit sitting inside the field's trailing edge — `%`, `USD`, `kg`.
   *
   * Inside the box and not beside it, because the unit belongs to the value: a
   * `%` floating to the right of the border reads as a separate control, and it
   * would not move when the field is resized by the grid.
   *
   * `aria-hidden`, and the accessible name must say it instead — "Advance
   * payment, percent". A screen reader that announces the number and then the
   * symbol as loose text gives the user two things to reassemble.
   */
  suffix?: string;
  /**
   * `format="date"` only — the calendar button at the trailing end. On by
   * default, so every date field gets one; `false` leaves the masked input bare
   * (a table cell, where the column is too narrow for it).
   */
  datePicker?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function InputField({
  error, icon, iconRight, suffix, disabled, format = 'text', onChange, className,
  datePicker = true, ref, ...rest
}: InputFieldProps) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  //  The picker needs the node and so may the caller — one callback feeds both.
  const setInput = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
  }, [ref]);
  const showPicker = format === 'date' && datePicker;
  //  §5: `Disabled + error` does not exist in either component, "and that is
  //  defensible — a control the user cannot edit cannot be corrected".
  const invalid = Boolean(error) && !disabled;

  return (
    <span
      ref={boxRef}
      className={cn(
        //  §4.1 / §7: height 34, padding and gap both space/5, radius md.
        'inline-flex items-center gap-5 h-control px-5 w-full',
        'rounded-md border bg-surface-default transition-colors',
        //  §6: the ring is an outline, not a child rectangle — "an outline needs
        //  no node, never affects layout, and follows the box at any size".
        //  Applied to the wrapper so the icons sit inside it.
        //
        //  TWO SIGNALS, TWO TRIGGERS. The BORDER turns `focus/ring` whenever the
        //  field is focused at all (`focus-within`) — that is the "this is the field
        //  I am typing in" cue, and a mouse user needs it as much as anyone. The
        //  RING is keyboard-only (`:has(:focus-visible)`), because a ring that also
        //  fires on click is what every `outline: none` in the wild is trying to
        //  delete — and deleting it takes the keyboard indicator with it. Splitting
        //  them keeps 2.4.7 intact and stops a click looking like an error.
        //  `Select` and `Textarea` already rang on `focus-visible`; this is what
        //  makes the three agree.
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
        disabled
          ? 'bg-surface-disabled border-border-disabled cursor-not-allowed'
          : invalid
            //  §4: error border AND the error focus ring are `danger/default`,
            //  6.09:1. The ring changes colour with the state, which is the one
            //  place this component overrides the system-wide focus treatment.
            //  The error border does NOT go blue on focus: red is the higher-priority
            //  message, and it has to survive the interaction that fixes it.
            ? 'border-danger-default has-focus-visible:outline-danger-default'
            //  §4.2 / §6: `border/control`, not `border/strong`. The whole
            //  border ramp tops out at 1.71:1 and 1.4.11 needs 3:1, so there was
            //  no correct choice available until this role existed.
            //  `focus/ring` is #3874EB — 4.32:1 on white, past the 3:1 that 1.4.11
            //  asks of a control boundary.
            //
            //  `not-focus-within:` on the HOVER is load-bearing, and measuring is the
            //  only way to know it: Tailwind emits `focus-within:border-*` at byte
            //  52584 and `hover:border-*` at 53570, both at specificity (0,2,0), so
            //  the later hover rule wins — and clicking into a field leaves the
            //  pointer ON it, which is exactly when both are true. The blue would
            //  have appeared only after moving the mouse away. `:not(:focus-within)`
            //  stops the hover rule matching at all once focused, so emission order
            //  stops mattering instead of happening to come out right.
            : cn('border-border-default not-focus-within:hover:border-border-hover',
              'focus-within:border-focus-ring has-focus-visible:outline-focus-ring'),
        className,
      )}
    >
      {icon ? <Icon name={icon} size="md" tone={disabled ? 'disabled' : 'subtle'} /> : null}
      <input
        ref={setInput}
        disabled={disabled}
        inputMode={MODE[format]}
        //  Filtered here and not on `keydown`: `change` is the one event that
        //  fires for typing, pasting, drag-and-drop and autofill alike. The
        //  caller receives the cleaned value, so a controlled field never holds
        //  a character the format forbids.
        onChange={format === 'text' ? onChange : (e) => {
          const el = e.target;
          const raw = el.value;
          const clean = applyFormat(raw, format);
          if (clean !== raw) {
            //  ── KEEP THE CARET WHERE THE USER LEFT IT ─────────────────────
            //  Rewriting `value` puts the caret at the end, so editing the
            //  MIDDLE of a masked date sends the cursor to the far right on
            //  every keystroke and the field can only be typed into from the
            //  end. Nobody edits a date that way twice.
            //
            //  Counted in DIGITS, not characters: the mask adds and removes
            //  separators around the caret, so a character index means
            //  something different before and after. Digits are what the user
            //  actually typed and the only stable thing to anchor to.
            const before = raw.slice(0, el.selectionStart ?? raw.length)
              .replace(/[^0-9]/g, '').length;
            let at = 0;
            let seen = 0;
            while (at < clean.length && seen < before) {
              if (/[0-9]/.test(clean[at])) seen += 1;
              at += 1;
            }
            el.value = clean;
            //  Synchronously, and before React re-renders — it will see the
            //  same value it is about to set and leave the node alone.
            el.setSelectionRange(at, at);
          }
          onChange?.(e);
        }}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-w-0 flex-1 bg-transparent outline-none text-body',
          'text-text-default',
          //  §4.3: NOT `text/placeholder`. That role is `neutral/1000` at
          //  2.85:1, below the 4.5:1 1.4.3 asks of text — "a role named
          //  text/placeholder that cannot be used for placeholder text is a
          //  trap". `text/tertiary` is neutral/1100 at 4.52:1 and passes whether
          //  or not placeholders are held to be exempt.
          'placeholder:text-text-tertiary',
          'disabled:text-text-disabled disabled:cursor-not-allowed',
        )}
        {...rest}
      />
      {iconRight && !showPicker ? <Icon name={iconRight} size="md" tone={disabled ? 'disabled' : 'subtle'} /> : null}
      {showPicker ? <DatePicker inputRef={inputRef} anchorRef={boxRef} disabled={disabled} /> : null}
      {suffix ? (
        //  Divided from the value, so a long number cannot run into its unit.
        //  `flex-none` — the unit never shrinks; the value does.
        <span
          aria-hidden
          className={cn(
            //  `-me-5` cancels the field's own trailing padding so the divider
            //  reaches the border; `px-5` puts the unit back off it.
            'flex-none self-stretch flex items-center px-5 -me-5 border-s border-border-default',
            'text-body-sm', disabled ? 'text-text-disabled' : 'text-text-secondary',
          )}
        >
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
