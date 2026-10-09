import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * DATE PICKER — the calendar behind a date field's trailing button.
 *
 * Added for the role access app (v2). `zf-design-cannon.md` names a date picker
 * (`shadow-modal` is "modal, date picker") but no spec for one has landed, so
 * this is built from the parts the canon already measures: `Button` for the
 * month controls, the 2px spacing ramp for the grid, `surface/hover` and
 * `primary/hover` for the day states, `shadow/modal` for the panel.
 *
 * ── IT WRITES INTO THE FIELD, IT DOES NOT REPLACE IT ─────────────────────────
 * The masked DD/MM/YYYY input stays the source of truth; typing still works.
 * Picking a day sets the input's value and dispatches a real `input` event, so
 * the caller's `onChange` fires exactly as if the date had been typed — no
 * second value channel, no prop the caller has to wire.
 *
 * ── THE TOP LAYER, NOT A z-INDEX ─────────────────────────────────────────────
 * The panel is a `popover="manual"`. Date fields live inside Modals and
 * SidePanels, whose bodies scroll and clip; a positioned child would be cut off
 * at the dialog's edge. The top layer escapes every overflow and every
 * transform, and still stacks above the dialog it was opened from.
 */

export interface DatePickerProps {
  /** The DD/MM/YYYY input this picker reads from and writes to. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The field box the calendar hangs under. */
  anchorRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');
const sameDay = (a: Date | null, b: Date | null) => Boolean(a && b)
  && a!.getFullYear() === b!.getFullYear() && a!.getMonth() === b!.getMonth() && a!.getDate() === b!.getDate();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Same day in another month, clamped — 31 Jan + 1 month is 28/29 Feb, not 3 Mar. */
const addMonths = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};
const today = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

function parse(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null;
}
const format = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const spoken = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Six Monday-first weeks covering the month — always 42 cells, so the panel never changes height. */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - lead + i));
}

/** Sets the input the way typing would, so React's onChange sees it. */
function writeValue(input: HTMLInputElement, text: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const GAP = 4;
const EDGE = 8;

export function DatePicker({ inputRef, anchorRef, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);
  const [focus, setFocus] = useState<Date>(today);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openPicker = () => {
    const current = parse(inputRef.current?.value ?? '');
    setSelected(current);
    setFocus(current ?? today());
    moveFocus.current = true;
    setOpen(true);
  };

  const place = useCallback(() => {
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!panel || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    //  End-aligned under the field — the trigger is at the field's right end.
    let left = r.right - w;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - w - EDGE));
    //  Flips above when there is no room below, as a native picker does.
    const below = r.bottom + GAP;
    const top = below + h > window.innerHeight - EDGE && r.top - GAP - h >= EDGE ? r.top - GAP - h : below;
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }, [anchorRef]);

  //  Show in the top layer, then place — the size is only known once shown.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    if (open) {
      if (typeof panel.showPopover === 'function' && !panel.matches(':popover-open')) panel.showPopover();
      place();
    } else if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
    return undefined;
  }, [open, place]);

  //  Roving focus: after opening or moving, the focused day takes real focus.
  useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    panelRef.current?.querySelector<HTMLButtonElement>('[data-zf-day-focus="true"]')?.focus();
  }, [open, focus]);

  //  Follow the field while anything scrolls; close on a press outside.
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => place();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [open, place, close]);

  const choose = (d: Date) => {
    if (inputRef.current) writeValue(inputRef.current, format(d));
    close(true);
  };

  const go = (d: Date) => {
    moveFocus.current = true;
    setFocus(d);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    //  Escape belongs to the calendar while it is open: preventDefault stops the
    //  Modal / SidePanel around it from cancelling, and stops SettingsBar
    //  reading it as "leave settings".
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    }
    const onDay = (e.target as HTMLElement).hasAttribute('data-zf-day');
    if (!onDay) return;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      Home: () => addDays(focus, -((focus.getDay() + 6) % 7)),
      End: () => addDays(focus, 6 - ((focus.getDay() + 6) % 7)),
      PageUp: () => addMonths(focus, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focus, e.shiftKey ? 12 : 1),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      go(move());
    }
  };

  const days = monthGrid(focus.getFullYear(), focus.getMonth());
  const now = today();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label="Choose date"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openPicker())}
        className={cn(
          //  `-me-2` pulls the glyph's hit area toward the border so the glyph
          //  itself lines up where `iconRight` would sit.
          'flex-none inline-flex items-center justify-center p-1 -me-2 rounded-sm border-0 bg-transparent',
          'text-text-secondary hover:text-text-default hover:bg-surface-hover',
          'transition-colors motion-reduce:transition-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          'disabled:text-text-disabled disabled:cursor-not-allowed disabled:hover:bg-transparent',
          open && 'text-primary-text',
        )}
      >
        <Icon name="calendar" size="md" tone="inherit" />
      </button>

      <div
        ref={panelRef}
        popover="manual"
        role="dialog"
        aria-label="Choose date"
        onKeyDown={onKeyDown}
        className={cn(
          //  Undo the UA popover box: it centres itself with `inset: 0; margin: auto`.
          'fixed inset-auto m-0 p-6 border-0 overflow-visible',
          'bg-surface-default text-text-default rounded-lg shadow-modal',
          !open && 'hidden',
        )}
      >
        {open ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Button emphasis="tertiary" size="sm" icon="chevron-left" label="Previous month"
                onClick={() => go(addMonths(focus, -1))} />
              <span aria-live="polite" className="text-body font-semibold">
                {MONTHS[focus.getMonth()]} {focus.getFullYear()}
              </span>
              <Button emphasis="tertiary" size="sm" icon="chevron-right" label="Next month"
                onClick={() => go(addMonths(focus, 1))} />
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <span key={d} aria-hidden className="size-16 inline-flex items-center justify-center text-caption text-text-tertiary">
                  {d}
                </span>
              ))}
              {days.map((d) => {
                const inMonth = d.getMonth() === focus.getMonth();
                const isSelected = sameDay(d, selected);
                const isToday = sameDay(d, now);
                const isFocus = sameDay(d, focus);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    data-zf-day
                    data-zf-day-focus={isFocus}
                    tabIndex={isFocus ? 0 : -1}
                    aria-label={spoken(d)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => choose(d)}
                    className={cn(
                      'box-border size-16 inline-flex items-center justify-center rounded-md border text-body',
                      'transition-colors motion-reduce:transition-none',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                      //  A fill holding text uses /hover, never /default (4.32:1).
                      isSelected
                        ? 'bg-primary-hover border-primary-hover text-primary-on-primary font-medium hover:bg-primary-active'
                        : cn(
                          'bg-transparent hover:bg-surface-hover',
                          isToday ? 'border-primary-border text-primary-text font-semibold' : 'border-transparent',
                          !isToday && (inMonth ? 'text-text-default' : 'text-text-tertiary'),
                        ),
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between gap-4">
              <Button emphasis="tertiary" size="sm" onClick={() => choose(now)}>Today</Button>
              <Button emphasis="tertiary" size="sm" onClick={() => close(true)}>Cancel</Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
