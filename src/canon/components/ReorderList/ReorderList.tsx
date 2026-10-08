import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * REORDER LIST — an ordered list of things the user is authoring, where the
 * order is part of the content.
 *
 * ── WHY IT IS A COMPONENT AND NOT A LIST IN A SCREEN ─────────────────────────
 * The behaviour it carries is the entire reason. `ColumnConfig` had to invent
 * all of it because there was nothing to copy, and its own header says so:
 * *"the drag behaviour is invented because there is nothing to copy"*. Writing
 * it a second time for the clause list would have meant two implementations of
 * pointer capture, two midpoint hit-tests and two sets of arrow-key handlers,
 * drifting apart from the day the second one landed. This is that logic, once.
 *
 * ── DRAG IS THE SHORTCUT, NOT THE MECHANISM ──────────────────────────────────
 * A list that only reorders by dragging is a 2.1.1 failure — there is no
 * keyboard path to the result at all. So the grip is a real `<button>`, it is in
 * the tab order, and **↑/↓ move the row** whether or not a pointer exists.
 * Dragging moves the same state through the same function.
 *
 * `setPointerCapture`, not HTML5 `draggable`: `draggable` cannot be made to work
 * on touch, needs a drag image nobody wants, and reports the element under the
 * cursor rather than where the pointer actually is. Capture gives one stream of
 * coordinates from press to release, which is what the midpoint test needs.
 *
 * Every move is announced into a polite live region. A sighted user sees the row
 * move; without this a keyboard user pressing ↓ gets silence, which is
 * indistinguishable from a dead key.
 *
 * ── HOVER-REVEALED CONTROLS KEEP THEIR SPACE ─────────────────────────────────
 * The grip and the remove button are `opacity-0` until the row is hovered or the
 * control itself is focus-visible. Two things that follows from:
 *
 * · **`opacity`, never `display` or a conditional render.** A control that
 *   unmounts leaves the tab order, so a keyboard user tabbing through the list
 *   would find the remove button appearing and vanishing under them. `opacity-0`
 *   with `focus-visible:opacity-100` keeps it reachable and makes it visible the
 *   instant it is reached — which is also what stops it being a 2.1.1 failure of
 *   its own.
 * · **It keeps its box either way**, so no row reflows on hover and the labels
 *   do not shuffle sideways as the pointer moves down the list.
 */
export interface ReorderItem {
  id: string;
  label: string;
  /**
   * Pinned to the front, cannot be moved, and cannot be removed. Locked rows
   * are a FLOOR, not a wall — see `move()`.
   */
  locked?: boolean;
}

export interface ReorderListProps<T extends ReorderItem = ReorderItem> {
  items: T[];
  /** The whole next order. Controlled — this component owns no copy of it. */
  onReorder: (next: T[]) => void;
  /** Names the list for a screen reader. Required: a bare `<ul>` announces nothing. */
  label: string;
  /**
   * The row whose content is being edited elsewhere — the equivalent of
   * `MiniList`'s `activeId`. Makes each row a button.
   *
   * NOT the same idea as selection: this is the one being READ, and clicking a
   * row navigates to it. There is no bulk-action concept here.
   */
  activeId?: string;
  onActivate?: (id: string) => void;
  /** Adds a remove control, revealed on hover or focus. Omit for no removal. */
  onRemove?: (id: string) => void;
  /** Prefix each row with its 1-based position. Renumbers as rows move. */
  numbered?: boolean;
  /** Between the grip and the label — `ColumnConfig`'s checkbox goes here. */
  leading?: (item: T, index: number) => ReactNode;
  /** After the label, before the remove control. */
  trailing?: (item: T, index: number) => ReactNode;
  className?: string;
}

export function ReorderList<T extends ReorderItem = ReorderItem>({
  items, onReorder, label, activeId, onActivate, onRemove, numbered,
  leading, trailing, className,
}: ReorderListProps<T>) {
  const [dragIx, setDragIx] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  //  Where the movable region starts. Locked rows are pinned to the front, so it
  //  is simply how many there are.
  const firstFree = items.filter((r) => r.locked).length;

  const move = (from: number, to: number) => {
    if (items[from]?.locked) return;
    //  CLAMPED into the free region rather than refused at its edge. Refusing
    //  makes a locked row a WALL — nothing can be dragged past it in either
    //  direction and the arrow keys go dead there with no explanation. Pinning
    //  locked rows to the top turns the wall into a floor, and a floor is a
    //  boundary a user can feel by pushing against it.
    const target = Math.min(Math.max(to, firstFree), items.length - 1);
    if (target === from) return;
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(target, 0, row);
    onReorder(next);
    setAnnounce(`${row.label}, position ${target + 1} of ${items.length}`);
  };

  //  Which row the pointer is over, by midpoint. Measured live rather than from
  //  a cached height, because a label can wrap and the rows are not all equal.
  const rowUnder = (y: number) => {
    for (let i = 0; i < rowRefs.current.length; i += 1) {
      const el = rowRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
    }
    return rowRefs.current.length - 1;
  };

  //  Revealed on row hover, and on its OWN focus — never on the row's focus.
  //  Tabbing to the grip must not also light up the remove button next to it.
  const REVEAL = cn(
    'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100',
    'transition-opacity duration-150 motion-reduce:transition-none',
  );
  //  `size-12` — 24px, which is EXACTLY the minimum target 2.5.8 asks for and
  //  no more. It was 32 while the grip was hover-revealed and cost nothing at
  //  rest; now that it is always on screen, 32 put the label 40 in from the
  //  container's edge and the list read as indented from the heading above it.
  const ICON_BTN = cn(
    'grid flex-none place-items-center size-12 p-0 border-0 rounded-sm bg-transparent',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <ul aria-label={label} className="flex flex-col m-0 p-0 list-none">
        {items.map((item, ix) => {
          const active = activeId !== undefined && item.id === activeId;
          return (
            <li
              key={item.id}
              ref={(el) => { rowRefs.current[ix] = el; }}
              className={cn(
                //  ONE CONTINUOUS LIST, ruled between rows — not a stack of
                //  cards. `py-4` is 8 above and below a 20px line box.
                //
                //  `ps-0`: the row starts on its container's own left edge, so
                //  the grip lines up with whatever sits above the list — the tab
                //  strip, in the clause screen. Anything else makes the list look
                //  indented from a heading it belongs to.
                'group/row flex items-center gap-4 ps-0 pe-5 py-4 box-border',
                'transition-colors',
                //  The rule goes on every row but the last, so the list does not
                //  end on a line that separates it from nothing.
                'not-last:border-b not-last:border-border-divider',
                //  `primary/subtle` — the same light blue the info banner and the
                //  editor's pressed toolbar button use. NOT `surface/selected`,
                //  which is 1.02:1 in Dark: the mini list already had to route
                //  around that role for exactly this job.
                active ? 'bg-primary-subtle' : 'hover:bg-surface-hover',
                //  The row being dragged, so the pointer has something to follow.
                dragIx === ix && 'bg-surface-pressed',
              )}
            >
              {/* THE HANDLE — a button, in the tab order, and the keyboard's way in. */}
              <button
                type="button"
                aria-label={`Reorder ${item.label}. Use the up and down arrow keys.`}
                disabled={item.locked}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') { e.preventDefault(); move(ix, ix - 1); }
                  if (e.key === 'ArrowDown') { e.preventDefault(); move(ix, ix + 1); }
                }}
                onPointerDown={(e) => {
                  if (item.locked) return;
                  //  Capture, so the stream keeps arriving once the pointer
                  //  leaves the handle — which it does immediately, since
                  //  dragging a row means moving away from where the press began.
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDragIx(ix);
                }}
                onPointerMove={(e) => {
                  if (dragIx === null) return;
                  const over = rowUnder(e.clientY);
                  if (over !== dragIx) { move(dragIx, over); setDragIx(over); }
                }}
                onPointerUp={() => setDragIx(null)}
                onPointerCancel={() => setDragIx(null)}
                className={cn(
                  ICON_BTN, 'text-icon-default',
                  //  ALWAYS VISIBLE. It was hover-revealed to keep the rows
                  //  quiet, but the grip is the only thing on the row that
                  //  advertises the list can be reordered at all — hidden, the
                  //  affordance only exists for someone who already knows it is
                  //  there. Remove stays on hover: that one is destructive, and
                  //  eleven of them down the side of a list is noise.
                  item.locked ? 'cursor-default opacity-0' : 'cursor-grab active:cursor-grabbing',
                )}
              >
                {/*  `sm` (14), not the default 16 — the grip is six solid dots
                     filling its box top to bottom, so at the default slot it
                     reads as the heaviest thing in a row it is only a hint for. */}
                <Icon name="drag-handle" size="sm" tone="inherit" />
              </button>

              {leading?.(item, ix)}

              {/*  The label is a BUTTON when the list drives something, and plain
                   text when it does not. Not a button with `onClick` undefined:
                   a control that looks pressable and does nothing is worse than
                   text, and it would sit in the tab order saying nothing. */}
              {onActivate ? (
                <button
                  type="button"
                  onClick={() => onActivate(item.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex-1 min-w-0 flex items-baseline gap-4 text-start',
                    'p-0 border-0 bg-transparent cursor-pointer rounded-sm',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                  )}
                >
                  {/*  The number takes the row's colour too — "5." in grey
                       beside a blue "Returns & Refunds" reads as two different
                       things rather than one label. */}
                  {numbered ? (
                    <Text
                      as="span" size="body" tone={active ? 'link' : 'secondary'}
                      weight="medium" className="flex-none tabular-nums"
                    >
                      {ix + 1}.
                    </Text>
                  ) : null}
                  {/*  `link`, which is `primary/text` at 5.92:1 — NOT
                       `primary/default`, which is 4.32 under white and fails
                       1.4.3 for 13px text. The same distinction the list view's
                       identifying column had to make.

                       Weight carries it as well as colour, because colour alone
                       is a 1.4.1 failure: the active row would be indicated by
                       hue and nothing else. */}
                  <Text
                    as="span" size="body" tone={active ? 'link' : 'default'}
                    weight="medium" className="truncate"
                  >
                    {item.label}
                  </Text>
                </button>
              ) : (
                <span className="flex-1 min-w-0 flex items-baseline gap-4">
                  {numbered ? (
                    <Text
                      as="span" size="body" tone="secondary"
                      weight="medium" className="flex-none tabular-nums"
                    >
                      {ix + 1}.
                    </Text>
                  ) : null}
                  <Text as="span" size="body" weight="medium" className="truncate">{item.label}</Text>
                </span>
              )}

              {trailing?.(item, ix)}

              {onRemove && !item.locked ? (
                <button
                  type="button"
                  aria-label={`Remove ${item.label}`}
                  onClick={() => {
                    onRemove(item.id);
                    setAnnounce(`${item.label} removed`);
                  }}
                  className={cn(
                    ICON_BTN, REVEAL, 'cursor-pointer',
                    //  `icon/default` at rest, `danger/text` on hover. Not red at
                    //  rest: eleven red controls down the side of a list reads as
                    //  eleven errors. The colour arrives with the intent.
                    'text-icon-default hover:text-danger-text',
                  )}
                >
                  <Icon name="delete" size="sm" tone="inherit" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/*  Reorder and removal both announce here. Without it, ↓ on the grip is
           silent and indistinguishable from a key that does nothing. */}
      <span role="status" aria-live="polite" className="sr-only">{announce}</span>
    </div>
  );
}
