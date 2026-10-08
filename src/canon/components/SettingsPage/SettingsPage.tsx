import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';
import { countSettingsLinks, filterSettingsSections } from './filter';
import type { SettingsCard, SettingsGroup, SettingsLink, SettingsSection, SettingsTone } from './filter';

export type { SettingsCard, SettingsGroup, SettingsLink, SettingsSection, SettingsTone };

/**
 * SETTINGS PAGE — the directory that lands you in the settings area.
 * ZF-SETTINGS-PAGE.md.
 *
 * ── IT IS A NESTED LIST, NOT A GRID OF WIDGETS ───────────────────────────────
 * Section → card → group → link, and there is exactly ONE interactive element in
 * the whole page: the link row. Everything else is structure. That decides the
 * markup — a `<nav>` of nested lists, with `<h2>` per section and `<h3>` per
 * group, sitting under the bar's `<h1>`.
 *
 * ── THE TONE IS CATEGORICAL, NEVER STATUS ────────────────────────────────────
 * Four tones drawn from `chart/*`, and the reason is §4.1: a **red** "Taxes &
 * Compliance" header is indistinguishable from an error state, and an **orange**
 * "Setup" reads as a warning. Nothing on this page has a status — every one of
 * these is a category. `chart/*` is the categorical ramp, carries no semantic
 * weight, and extends to eight if the categories grow.
 *
 * Verified against our own palette: all four values match the spec exactly, and
 * the mock's four hand-picked tints ARE those values at 12%, to within 5/255 per
 * channel. So the tint is one rule applied to the ramp, not four more values.
 *
 * ── EVERY WIDTH IS A FRACTION ────────────────────────────────────────────────
 * §3.4, and the third time this has bitten in this system. The mock's 236px card
 * looks like it falls out of `1292 − 32`, but the section is border-box with a
 * 1px border, so its content box is **1258** and five fixed 236s overhang by 2.
 * The tracks are `repeat(5, minmax(0, 1fr))`, resolving to 235.6 at the
 * reference width. A number that came out of a mock's arithmetic belongs in a
 * track definition.
 */

export interface SettingsPageProps {
  sections: SettingsSection[];
  /**
   * Filters in place. §6: the page is a DIRECTORY, so typing narrows what is
   * visible — it never navigates, because taking the user somewhere on the first
   * keystroke destroys the overview they came for.
   */
  query?: string;
  /**
   * A link was activated. Level 0 → level 1 is the transition this drives: the
   * directory folds into the rail and the chosen page opens beside it.
   *
   * Optional, and the `<a href>` is a real fallback rather than a formality.
   * The rows stay links so middle-click, copy-link and open-in-new-tab keep
   * working, and a consumer with no client-side routing gets a page load
   * instead of a dead row.
   */
  onNavigate?: (link: SettingsLink) => void;
  /** Rendered above the sections, inside the same column — usually nothing. */
  children?: ReactNode;
  className?: string;
}

const TONE_BG: Record<SettingsTone, string> = {
  blue: 'bg-tone-blue',
  green: 'bg-tone-green',
  orange: 'bg-tone-orange',
  red: 'bg-tone-red',
};
const TONE_ICON: Record<SettingsTone, string> = {
  blue: 'text-chart-1',
  green: 'text-chart-4',
  orange: 'text-chart-5',
  red: 'text-chart-7',
};

export function SettingsPage({ sections, query, onNavigate, children, className }: SettingsPageProps) {
  const visible = useMemo(() => filterSettingsSections(sections, query), [sections, query]);
  const total = countSettingsLinks(visible);

  return (
    //  ONE nav landmark. Three would be noise for a single directory.
    <nav
      aria-label="Settings"
      className={cn(
        'grid justify-items-center gap-20 py-20 px-10 bg-surface-canvas',
        className,
      )}
    >
      {children}

      {visible.map((section) => (
        <section
          key={section.id}
          className={cn(
            //  `min(1292px, 100%)`, not a fixed width — below 1332 the column
            //  shrinks to the viewport minus the 20px floor.
            'box-border w-full max-w-settings-column',
            //  §3.2 — NO bottom padding. The cards end on the section's border,
            //  and that flush edge is what makes them read as sitting ON the
            //  page rather than in a box. The backdrop has faded out by then
            //  anyway, so padding there would be invisible.
            'pt-12 px-8 pb-0',
            //  NO BORDER. The Figma stroke is present but HIDDEN — F1F1FA,
            //  Outside, eye off — so the section is defined by its gradient and
            //  its shadow alone. ZF-SETTINGS-PAGE.md §3 and §9 both specify a
            //  1px border/default; the file is out of date on this one and the
            //  design owner confirmed the Figma.
            //
            //  It also removes a small inconsistency the spec created for
            //  itself: with a border, the section's content box was 1258 rather
            //  than 1260 (§3.4's whole argument). Without one they are the same
            //  number, though the tracks stay fractional regardless.
            'rounded-2xl',
            'bg-settings-section shadow-settings-card',
          )}
        >
          {/*  `regular`, stated: `heading` defaults to SEMIBOLD in `Text`, and
               the spec calls for `zf/heading/regular`. */}
          {/*  `ms-8` on top of the section's own `px-8`, so the heading sits at
               32 from the section edge while the cards stay at 16.

               ZF-SETTINGS-PAGE.md §9 normalised both to 16, on the grounds that
               "the mock's two insets disagree" and 16 is the one the grid
               arithmetic depends on. That reasoning holds for the CARDS — they
               are what the tracks measure — but the heading is not in the grid,
               so it was free to keep the mock's larger inset all along. This
               restores it. */}
          <Text as="h2" size="heading" weight="regular" className="block ms-8 mb-12">
            {section.title}
          </Text>

          <div
            className={cn(
              //  `items-stretch` is the default and is stated because it is
              //  load-bearing: `items-start` leaves a short card beside a
              //  nine-link one with a ragged bottom edge that reads as a fault.
              'grid gap-10 items-stretch',
              'grid-cols-settings-cards max-settings:grid-cols-settings-cards-narrow',
            )}
          >
            {section.cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  'box-border flex flex-col gap-8 p-2',
                  //  The card paints its OWN fill: the section's backdrop has
                  //  dissolved to nothing by the time it reaches here.
                  //  Radius 10 — `radius/card`, a NAMED role rather than a step,
                  //  because 10 is a retired radius. The spec deviates to 8
                  //  (`radius/lg`); the file draws 10 and the design owner
                  //  confirmed it.
                  //
                  //  `border/divider` is the lightest border role there is. The
                  //  file draws F1F1FA, which is lighter still — and is very
                  //  nearly `surface/sunken` (#F0F1FA), i.e. a FILL value being
                  //  used as a stroke. There is no border role that light, which
                  //  is open item 35 from the other end: the ramp has nothing
                  //  near 3:1 at the dark end and nothing this quiet at the
                  //  light end either.
                  'bg-surface-default rounded-card border border-border-divider',
                  'shadow-settings-card',
                )}
              >
                {card.groups.map((group) => (
                  <div key={group.id} className="flex flex-col gap-4">
                    {/*  A heading with a decorative glyph — no role, no
                         tabindex, no click handler. §3.1: its icon and every
                         link label below share ONE vertical edge, at card + 21
                         (1 border + 4 card padding + 16 inner). Both insets come
                         from the same `px-8`, so the border takes care of
                         itself and neither number is typed. */}
                    <h3
                      className={cn(
                        'flex items-center gap-4 min-w-0 h-settings-group-head m-0 px-8',
                        'rounded-md text-body font-semibold text-text-default',
                        'truncate',
                        TONE_BG[group.tone],
                      )}
                    >
                      {/*  THE TONE GOES ON A WRAPPER, and that is not stylistic.
                           `Icon` renders `cn(size, toneMap[tone], 'shrink-0',
                           className)`, so `tone="inherit"` emits `text-current`
                           and a colour passed via className lands beside it —
                           two `color` utilities at equal specificity, settled by
                           whichever Tailwind emitted last. Measured: `.text-current`
                           at byte 43922 against `.text-chart-1` at 43580, so
                           `text-current` won and every icon rendered the
                           heading's navy. All four tones were silently dead —
                           only the tint varied, which looks close enough to right
                           in a screenshot to survive review.

                           Colour the parent and let the glyph inherit: one
                           declaration, nothing to arbitrate. */}
                      <span className={cn('flex-none inline-grid', TONE_ICON[group.tone])}>
                        <Icon name={group.icon} size="md" tone="inherit" />
                      </span>
                      {group.title}
                    </h3>

                    {/*  §3.1 — the UA gives a <ul> 40px of padding-inline-start,
                         16px of margin-block and disc markers. Without this
                         reset the labels land at card + 61 instead of card + 21:
                         a 40px miss on the one alignment this card depends on,
                         plus bullets and a margin that breaks the 8px gap. */}
                    <ul className="list-none m-0 p-0">
                      {group.links.map((link) => (
                        <li key={link.id}>
                          <a
                            href={link.href}
                            data-zf-settings-link
                            onClick={onNavigate
                              ? (e) => {
                                //  Modified clicks belong to the browser. Ctrl,
                                //  Cmd, Shift and middle-click all mean "open
                                //  this somewhere else", and swallowing them is
                                //  the most common way a client-side router
                                //  breaks a link that still LOOKS like one.
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                                e.preventDefault();
                                onNavigate(link);
                              }
                              : undefined}
                            className={cn(
                              'group/link flex items-center h-settings-link px-8 rounded-sm no-underline',
                              'text-body text-text-default',
                              //  The label does NOT turn blue on hover. It stays
                              //  `text/default` and gains weight — blue would
                              //  read as "this one is selected" next to sixty
                              //  identical rows, where weight reads as "this one
                              //  is under the pointer". The arrow carries the
                              //  colour instead.
                              'hover:bg-surface-hover',
                              'active:bg-surface-pressed',
                              //  §5.3 — `-outline-offset-2`, not 0. An outline
                              //  paints outside the border box whatever the
                              //  offset, and the rows ABUT: at offset 0 the ring
                              //  band measured 345–385 against a 347–383 row,
                              //  overlapping each neighbour by 2px. Inset is the
                              //  only value that reaches zero encroachment, and
                              //  nothing clips it.
                              'focus-visible:outline-2 focus-visible:-outline-offset-2',
                              'focus-visible:outline-focus-ring',
                            )}
                          >
                            <span
                              className={cn(
                                'min-w-0 truncate',
                                'group-hover/link:font-semibold',
                                'group-focus-visible/link:font-semibold',
                              )}
                            >
                              {link.label}
                            </span>
                            {/*  The affordance that says this row goes somewhere.
                                 Revealed on hover and on keyboard focus, and it
                                 KEEPS ITS SPACE either way: an arrow that only
                                 occupies the row when visible re-truncates the
                                 label under the pointer, so names shorten as you
                                 move down the list. Same reason ReorderList
                                 reveals its grip with opacity rather than
                                 mounting it. */}
                            {/*  `lg` (20) rather than `sm` (14), and that is the
                                 only lever there is: the chevron is STROKED at
                                 ICON_STROKE_WEIGHT, and the icon system fixes
                                 that at one weight — 1.25, round cap and join —
                                 across every stroked glyph. There is no weight
                                 prop, deliberately.

                                 The slot raises both at once, because an SVG
                                 scales its stroke with its viewport: on a 16
                                 viewBox, 14 renders the stroke at 1.09px and 20
                                 at 1.56 — 43% heavier as well as 43% larger.

                                 The WEIGHT comes from `chevron-right-bold`, a
                                 separate roster glyph at stroke 2 against the
                                 house 1.25 — the same move `caret-down-bold`
                                 makes, and the only one that does not let every
                                 other caller opt out of the one-weight rule.
                                 At the 20 slot that renders 2.5px. */}
                            {/*  `tone="primary"` and not a colour className:
                                 with `tone="inherit"` the Icon emits
                                 `text-current`, and a colour passed alongside it
                                 is a second `color` utility at equal specificity
                                 — the exact collision that silently killed the
                                 group-header tones earlier in this file. Using
                                 the component's own tone leaves one declaration
                                 and nothing to arbitrate. */}
                            <Icon
                              name="chevron-right-bold"
                              size="lg"
                              tone="primary"
                              className={cn(
                                'flex-none ms-auto ps-4 opacity-0',
                                'group-hover/link:opacity-100 group-focus-visible/link:opacity-100',
                                'transition-opacity duration-150 motion-reduce:transition-none',
                              )}
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/*  Announced politely, and focus never moves on a keystroke. */}
      <span role="status" aria-live="polite" className="sr-only">
        {total} {total === 1 ? 'setting' : 'settings'}
      </span>
    </nav>
  );
}
