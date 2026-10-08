import { useState } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { Text } from '../../primitives/Text';
import { cn } from '../../utils/cn';

/**
 * TEXTAREA — the multi-line `InputField`.
 *
 * Every number comes from `zf-input-field.md` through that component: the same
 * border, radius, focus ring, disabled treatment and `text/tertiary`
 * placeholder. Nothing is measured twice. What differs is only what has to:
 *
 * **It has no height, it has rows.** An input is `chrome/control` — 34 — and a
 * textarea is `rows × line-height` plus the same block padding. `rows` is the
 * native attribute, so the browser does the arithmetic against whatever font is
 * actually rendering rather than against one we assumed.
 *
 * **`py-control-pad` is the input's own 7.** Derived as
 * `(chrome/control − body line-height) / 2`, and shared with `FormRow`'s label
 * offset — one number, so a one-row textarea is exactly an input's height and
 * its first line sits exactly where an input's value does.
 *
 * ── RESIZE ──────────────────────────────────────────────────────────────────
 * `resize: vertical`, never `both` and never `none`.
 *
 * · **not `none`** — a user who has written six lines into a three-line box has
 *   a good reason to want to see them, and taking the grip away is taking away
 *   the only fix they have. It is also the one place a form legitimately lets
 *   the user change the layout.
 * · **not `both`** — horizontal resize breaks the grid. The control is 3 of 12
 *   columns minus the 30px inset, and a user-dragged width would put this
 *   field's trailing edge somewhere no other field's is, permanently.
 */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  /** Starting height in lines. The user can grow it from there. */
  rows?: number;
  error?: boolean;
  /**
   * Show `used / maxLength` under the field. Requires `maxLength`.
   *
   * It is `aria-hidden` and paired with a polite live region that only speaks
   * near the limit: a counter announced on every keystroke is unusable, and one
   * never announced lets a screen-reader user type past a cap they cannot see.
   */
  counter?: boolean;
}

export function Textarea({
  rows = 3, error, counter, disabled, maxLength, value, defaultValue, className, ...rest
}: TextareaProps) {
  const [internal, setInternal] = useState(String(defaultValue ?? ''));
  //  Controlled or not — the counter has to read the same string the user sees,
  //  and a caller that passes `value` owns it.
  const shown = value !== undefined ? String(value) : internal;
  const used = shown.length;
  const near = maxLength !== undefined && used >= maxLength * 0.9;

  const field = (
    <textarea
      rows={rows}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={cn(
        'block w-full box-border px-5 py-control-pad',
        'rounded-md border bg-surface-default transition-colors',
        'text-body text-text-default',
        //  §4.3 — NOT `text/placeholder`. That role is 2.85:1, below the 4.5
        //  1.4.3 asks of text; the md calls a role named text/placeholder that
        //  cannot be used for placeholder text "a trap". `text/tertiary` is 4.52.
        'placeholder:text-text-tertiary',
        //  Vertical only — see above.
        'resize-y',
        //  §6 — the ring is an OUTLINE, not a child rectangle: it needs no node,
        //  never affects layout, and follows the box at any size. Which matters
        //  more here than on an input, because this box changes size.
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        disabled
          ? 'bg-surface-disabled border-border-disabled text-text-disabled cursor-not-allowed resize-none'
          : error
            //  §4 — the error border AND the error ring are `danger/default`,
            //  6.09:1. The one place this family overrides the system-wide ring.
            ? 'border-danger-default focus-visible:outline-danger-default'
            //  See `InputField`: border on any focus, ring on keyboard focus only,
            //  and hover gated on `not-focus` so the cascade cannot decide which of
            //  the two border colours a focused-and-hovered control gets.
            : cn('border-border-default not-focus:hover:border-border-hover',
              'focus:border-focus-ring focus-visible:outline-focus-ring'),
        className,
      )}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      maxLength={maxLength}
      onChange={(e) => {
        if (value === undefined) setInternal(e.target.value);
        rest.onChange?.(e);
      }}
      {...rest}
    />
  );

  if (!counter || maxLength === undefined) return field;

  return (
    <div className="w-full">
      {field}
      {/* Right-aligned under the field, so it sits at the end of the line the
          user is filling rather than at the start of one they are not. */}
      <div className="flex justify-end mt-2">
        <Text as="span" size="caption" tone={near ? 'danger' : 'tertiary'} aria-hidden>
          {used} / {maxLength}
        </Text>
      </div>
      {/* Announced only in the last tenth. `polite`, so it waits for a pause
          rather than interrupting the sentence being typed. */}
      <span aria-live="polite" className="sr-only">
        {near ? `${maxLength - used} characters remaining` : ''}
      </span>
    </div>
  );
}
