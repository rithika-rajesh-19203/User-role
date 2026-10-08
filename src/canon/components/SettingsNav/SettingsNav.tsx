import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';
import type { SettingsLink, SettingsSection } from '../SettingsPage/filter';

/**
 * SETTINGS NAV — the level 1 rail. ZF-SETTINGS-NAV.md §3.
 *
 * ── THIS IS NOT A VARIANT OF `Nav` ──────────────────────────────────────────
 * The app's global rail and this one look related and are not. `Nav` ships a
 * 30px row at radius 6 with a collapsed mode, a logo well, a bottom toggle and
 * 24 measured variants; this is a 40px row at radius 8 with no collapse, no
 * chrome of its own, and two levels of nesting. Sharing a component would mean
 * a `mode` prop that switches nine geometry values at once — CLAUDE.md's
 * modelling test 2, and the answer is two components.
 *
 * What they DO share is the indent, deliberately: the 14px chevron gutter is
 * `chrome/nav-chev-slot`, the same token `Nav` uses, so the two rails in the
 * product indent identically. §3.1 asks for exactly that.
 *
 * ── ONE LINK SOURCE FOR BOTH LEVELS (§8.1) ──────────────────────────────────
 * `sections` is the same array `SettingsPage` renders as cards. Level 0 is a
 * browse surface, level 1 is a work surface, and nothing is added between them
 * — the rail IS level 0, folded into a tree. If the two ever disagree the user
 * has found a bug, so they must not be typed twice.
 *
 * ── WHY DISCLOSURE AND NOT `role="tree"` (§7.1) ─────────────────────────────
 * `tree` replaces Tab with a roving tabindex and arrow-key traversal, which is
 * right for a file explorer and surprising in a settings sidebar. It also
 * obliges every row to be a `treeitem`, which costs the `<a href>` that gives
 * leaves middle-click, copy-link and open-in-new-tab. Nested disclosures keep
 * all three.
 */

export interface SettingsNavProps {
  /**
   * THE SAME ARRAY `SettingsPage` TAKES. Not a nav-shaped copy of it.
   *
   * ZF-SETTINGS-NAV.md §8 defines a second set of types for level 1 —
   * `SettingsNavSection` / `SettingsNavGroup` / `SettingsNavLeaf` — and then
   * §8.1 argues the two levels must never diverge. Those two things are in
   * tension: a second type needs an adapter, and an adapter is exactly the
   * seam where divergence happens.
   *
   * So the rail reads `SettingsSection[]` and folds the cards away itself. It
   * can, because a card carries no meaning: it is where a group sits in level
   * 0's five-track grid, and level 1 has one track. `tone` and `icon` are
   * likewise level 0's — the rail row is a caret and a label (§3).
   */
  sections: SettingsSection[];
  /** The leaf id for the current route. */
  currentId?: string;
  /** Called with the leaf that was activated. Omit to let the `<a href>` win. */
  onNavigate?: (leaf: SettingsLink) => void;
  className?: string;
}

/*  §3.1 — ONE LEFT EDGE, AND IT IS DERIVED.
    Panel `px-2` (4) + row `px-8` (16) = 20, where the section label and every
    caret sit. Labels are 14 further on at 34, and that 14 is the chevron
    gutter — RESERVED ON LEAF ROWS TOO, even though they have no caret. That is
    what keeps group and leaf labels on one edge, and it is why §8.1 calls the
    empty span on a leaf load-bearing rather than an oversight: deleting it
    moves every leaf label 14px left.

    The rail is 240 and indenting children would cost horizontal space the
    labels need more — the label box is 186 and product-configurable names go
    through it.  */
/*  ── THE ROW'S THREE STATES ARE MUTUALLY EXCLUSIVE STRINGS, NOT OVERRIDES ───
    A row is resting, or its group is open, or it is the current page. Exactly
    one, always. So the state fills are picked, never layered — and that is a
    correctness fix, not a tidiness one.

    Layering them looked fine and was broken. `cn` is a plain joiner: it decides
    nothing. Two utilities at the same specificity are settled by the order
    Tailwind EMITTED them, which has no relationship to the order they appear in
    the class string. Measured in the built sheet, base beating current:

      bg-transparent            @35667  beat  bg-primary-default        @34455
      text-text-default         @46387  beat  text-primary-on-primary   @46087
      hover:bg-surface-hover    @62599  beat  hover:bg-primary-hover    @62363
      active:bg-surface-pressed @67724  beat  active:bg-primary-active  @67642

    Every one of those is the resting state winning over the current-page state.
    Together they meant the selected row lost its fill entirely and rendered
    `text/default` on whatever showed through — and `text/default` on
    `primary/default`, if the fill did win the race, is 3.24:1 and fails 1.4.3.

    THE RULE THAT FALLS OUT: `ROW_BASE` carries no colour property at all. Not
    the fill, not the label colour, not the outline colour — every one of those
    is owned by exactly one state string, so no element ever holds two
    candidates for the same property and there is nothing to arbitrate. Fixing
    only the fills, which is what a first pass does, leaves `color` and
    `outline-color` still racing; that is how the dark-label-on-blue survived a
    round of exactly this fix.

    A `!` would settle one instance and leave the shape intact. Adding a fourth
    state to this scheme keeps the property for free.  */
const ROW_BASE = cn(
  'box-border flex items-center w-full h-settings-nav-row px-8',
  'rounded-lg border-0 text-start no-underline cursor-pointer',
  //  `text-body` is the SIZE. The colour is not here — see below.
  'text-body',
  'transition-colors motion-reduce:transition-none',
  //  §6.5 — NEGATIVE OFFSET, and it is not a preference. At offset >= 0 an
  //  outline paints outside the border box, so even 0 eats into the 4px
  //  inter-row gap. Only a negative offset draws inward.
  //
  //  Width and offset only. The outline COLOUR belongs to the state, for the
  //  same reason the fill and the label colour do.
  'focus-visible:outline-2 focus-visible:-outline-offset-2',
);

/*  §4.4 — all three hovers in this component are faint (1.079, 1.064, 1.269,
    measured against our own tokens). That is NOT an accessibility failure:
    WCAG sets no floor for a hover fill, change detection under a moving
    pointer is far more sensitive than static discrimination, and hover is
    never the sole affordance — keyboard gets a real 2px ring, touch gets no
    hover at all.

    It still ships as `surface/hover` rather than something darker, for a
    reason that outranks the faintness: substituting `surface/sunken` here
    would collide with the open-group fill INSIDE this component, breaking a
    state distinction to fix a cosmetic one. `SettingsPage`'s links and `Menu`
    already ship `surface/hover` for the same row-on-white case, so a
    one-component substitution would strand this rail off-system on the day
    the token is corrected. Open item 64.  */
const ROW_REST = cn(
  'bg-transparent text-text-default',
  'hover:bg-surface-hover active:bg-surface-pressed',
  'focus-visible:outline-focus-ring',
);

/*  §4.2 — an OPEN group is tinted because it is the branch you are inside, and
    its hover goes to `surface/pressed` rather than `surface/hover`: otherwise
    hovering an open group would make it LIGHTER than at rest, which reads as a
    bug.  */
const ROW_OPEN = cn(
  'bg-surface-sunken text-text-default font-medium',
  'hover:bg-surface-pressed active:bg-surface-pressed',
  'focus-visible:outline-focus-ring',
);

/*  §4.1 / §4.3 — the current page. The ring CANNOT be `focus/ring` here:
    measured on our own tokens, `focus/ring` and `primary/default` are BOTH
    #3874EB in Light, so the ring is literally invisible — the focused selected
    row and the resting one render identically. In Dark they differ (#94B3F2 on
    #769BE7) but only at 1.31:1, which fails 1.4.11 and is invisible in practice
    too.

    `primary/on-primary` is 4.32:1 in Light and 6.57:1 in Dark. The general rule,
    for the other places this is still broken: a focus ring is only a focus ring
    against the fill it lands on, so on any FILLED control the ring is that
    fill's `on-` colour.  */
const ROW_CURRENT = cn(
  //  ── THE FILL IS `primary/hover`, NOT `primary/default`, AND THAT IS A RULE
  //  RATHER THAN A PREFERENCE ──────────────────────────────────────────────
  //  §4.1 draws the selected row as `primary/default`. Measured under
  //  `primary/on-primary` at this row's 13px:
  //
  //      primary/default  #3874EB   4.32:1   FAILS 1.4.3 (needs 4.5)
  //      primary/hover    #2762D9   5.48:1   passes
  //
  //  CLAUDE.md states the general form of this outright — "a fill that is
  //  about to hold text uses the /hover role, never /default" — and records
  //  that the family has landed on it three times already. This is the fourth,
  //  and the reason it keeps happening is that §4.3's own table quotes 4.32:1
  //  as a PASS. It is: for the focus RING, against 1.4.11's 3:1 for a non-text
  //  component. Reusing that number for the LABEL silently swaps the success
  //  criterion — 1.4.3 applies to text and wants 4.5. Same colour, two rules,
  //  and only one of them is met.
  //
  //  Dark is unaffected either way (6.57 on default, 8.62 on hover) — this is
  //  a Light-pane failure only, which is exactly how it survives review.
  'bg-primary-hover text-primary-on-primary font-medium',
  //  The cost, stated: the Light ramp is default → hover → active, so moving
  //  rest up one step leaves only `primary/active` above it and hover and
  //  pressed have to share it. §4 wants three monotonically darkening steps and
  //  this row now has two. That is the right trade — an unreadable label is a
  //  defect, a missing press flicker on the row you are already on is not — but
  //  it is a trade, not a free win. It resolves the day open item 50 adds a
  //  fourth step to the ramp.
  'hover:bg-primary-active active:bg-primary-active',
  //  §4.3 — the ring cannot be `focus/ring`: measured on our own tokens it and
  //  `primary/default` are BOTH #3874EB in Light, so the ring is invisible. In
  //  Dark they differ but only at 1.31:1, failing 1.4.11 too. Against this
  //  fill, `primary/on-primary` is 5.48:1 in Light and 8.62:1 in Dark.
  'focus-visible:outline-primary-on-primary',
);

/*  The reserved gutter. `chrome/nav-chev-slot` — the app rail's own token, so
    the two rails cannot drift apart. §3.1.  */
const CHEV = 'flex flex-none items-center w-nav-chev-slot';

const LABEL = cn(
  //  §3.3 — `min-w-0` on a flex child is INERT unless the parent lets it
  //  shrink; the flex default `min-width: auto` is what actually blocks it. The
  //  working combination is `flex-1` (which sets `min-width: 0` in Tailwind's
  //  shorthand) plus the explicit `min-w-0`, plus nowrap and ellipsis. Any one
  //  of the three missing and a long custom-module name widens the rail
  //  instead of truncating.
  'flex-1 min-w-0 truncate',
);

export function SettingsNav({ sections, currentId, onNavigate, className }: SettingsNavProps) {
  /*  Cards folded away — see the `sections` prop. One `flatMap`, and level 1
      stops caring about level 0's columns entirely.  */
  const folded = useMemo(
    () => sections.map((s) => ({ ...s, groups: s.cards.flatMap((c) => c.groups) })),
    [sections],
  );

  /*  §5 — the open branch is derived from the ROUTE, not from a click. A user
      who deep-links into a leaf must find its group already open; a user who
      clicks one must not see it close. Deriving it means both fall out of the
      same expression instead of being two code paths.  */
  const owningGroup = useMemo(
    () => folded
      .flatMap((s) => s.groups)
      .find((g) => g.links.some((c) => c.id === currentId))?.id ?? null,
    [folded, currentId],
  );
  /*  ADJUSTED DURING RENDER, NOT IN AN EFFECT.
      `openId` is derived-but-overridable: the route seeds it, a click replaces
      it. The obvious spelling is `useEffect(() => setOpenId(owningGroup))`,
      which is what the spec's own listing does — and it is wrong twice. It
      paints the old branch first and corrects it on a second pass, so a deep
      link visibly flashes the previous group open; and React 19's
      `set-state-in-effect` rule rejects it outright.

      Comparing against the last-seen value and adjusting during render is
      React's documented pattern for exactly this. React re-runs the component
      immediately, before committing anything to the DOM, so there is no extra
      paint — the branch is simply open on the first frame.  */
  const [openId, setOpenId] = useState<string | null>(owningGroup);
  const [seenGroup, setSeenGroup] = useState(owningGroup);
  if (seenGroup !== owningGroup) {
    setSeenGroup(owningGroup);
    setOpenId(owningGroup);
  }

  const currentRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    //  `nearest`, NOT `center` — an already-visible item must not jump.
    currentRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentId]);

  return (
    <nav
      aria-label="Settings"
      data-zf-settings-nav
      className={cn(
        'box-border flex flex-col gap-20 py-12 px-2',
        'bg-surface-default rounded-xl',
        //  §6.2 — `overflow-y: auto` IS the scroll guard. The grid track
        //  function is not: a grid item that is itself a scroll container
        //  already has an automatic minimum of zero (CSS Grid §6.6), so
        //  `minmax(0, 1fr)` and `1fr` measured byte-identical here. This line
        //  is the one doing the work.
        //
        //  Two longhands, never `overflow: clip auto` — that computes to
        //  `hidden auto` and silently turns the x axis into a scrollport.
        'min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain',
        className,
      )}
    >
      {folded.map((section) => (
        <div key={section.id} className="flex flex-col gap-6">
          {/*  §6.4.1 is an open item WE DO NOT HAVE. It warns that a `font:`
               shorthand token drops `text-transform` and `letter-spacing`, so
               `zf/overline` silently loses the upper-casing its name is about.
               Our type layer never ships a `font` shorthand — size,
               line-height and tracking are separate tokens and `Text` emits
               `uppercase` for `overline` itself. Nine styles' worth of a
               problem that cannot occur here. */}
          <Text
            as="h2"
            id={`zf-set-sec-${section.id}`}
            size="overline"
            tone="tertiary"
            className="block px-8"
          >
            {section.title}
          </Text>

          <ul
            aria-labelledby={`zf-set-sec-${section.id}`}
            className="list-none m-0 p-0 flex flex-col gap-2"
          >
            {section.groups.map((group) => {
              const open = openId === group.id;
              return (
                <li key={group.id} className="flex flex-col gap-2">
                  <button
                    type="button"
                    aria-expanded={open}
                    /*  §8 — EMITTED ONLY WHEN THE LIST EXISTS. §7.2 says a
                        collapsed group's children must not be rendered, so a
                        constant `aria-controls` dangles on every closed group:
                        the spec measured 9 of 10 IDREFs unresolvable. An
                        unresolvable IDREF is worse than none — it tells a
                        screen reader there is something to look at and then
                        does not provide it. */
                    aria-controls={open ? `zf-set-grp-${group.id}` : undefined}
                    onClick={() => setOpenId(open ? null : group.id)}
                    className={cn(ROW_BASE, open ? ROW_OPEN : ROW_REST)}
                  >
                    <span aria-hidden className={CHEV}>
                      {/*  §3.2 — the caret is the ONLY hierarchy cue: a group
                           row and its children are drawn at the same left
                           edge. §7.2 is the consequence.

                           SIZE AND WEIGHT ARE BOTH MEASURED, not chosen.
                           The mock draws 10x10, which is on neither the icon
                           ramp (12·14·16·20·24) nor the scale, so it rounds to
                           `xs` (12) — the nearest slot, per CLAUDE.md.

                           The weight is the part that was wrong first time.
                           An SVG scales its stroke with its viewport, so the
                           slot picks the weight too: the roster chevron is
                           1.25 in a 16 box, which at the 7.5 `caret` slot
                           renders a 0.59px line. Measured off the reference,
                           the drawn caret is ~1.4px. `chevron-right-bold`
                           (stroke 2) at 12 gives 1.50 — the only combination
                           on the ramp that lands there. At `caret` even the
                           bold is 0.94 and still too faint.

                           This deliberately diverges from `Nav`, which puts a
                           7.5 caret in this same slot. The SLOT is what §3.1's
                           shared-gutter argument is about — 14px, so both
                           rails put their labels on the same edge — and that
                           is preserved. The glyph inside it is free, and this
                           rail's caret is its ONLY hierarchy cue (§3.2), which
                           is not true of `Nav`'s. */}
                      <Icon
                        name="chevron-right-bold"
                        size="xs"
                        tone="default"
                        className={cn(
                          'transition-transform duration-150 motion-reduce:transition-none',
                          open && 'rotate-90',
                        )}
                      />
                    </span>
                    <span className={LABEL}>{group.title}</span>
                  </button>

                  {/*  NOT RENDERED when closed — §7.2. `hidden` would be the
                       safety net, but the rail has no visual indent, so the
                       DOM is the only thing carrying the hierarchy and a
                       hidden-but-present subtree is a real risk. */}
                  {open && group.links.length > 0 ? (
                    <ul
                      id={`zf-set-grp-${group.id}`}
                      className="list-none m-0 p-0 flex flex-col gap-2"
                    >
                      {group.links.map((leaf) => {
                        const current = leaf.id === currentId;
                        return (
                          <li key={leaf.id}>
                            <a
                              ref={current ? currentRef : undefined}
                              href={leaf.href}
                              aria-current={current ? 'page' : undefined}
                              onClick={onNavigate
                                ? (e) => { e.preventDefault(); onNavigate(leaf); }
                                : undefined}
                              className={cn(ROW_BASE, current ? ROW_CURRENT : ROW_REST)}
                            >
                              {/*  §8.1 — the reserved gutter, EMPTY. Not an
                                   oversight: deleting it moves every leaf
                                   label 14px left and breaks the one shared
                                   edge §3.1 builds. */}
                              <span aria-hidden className={CHEV} />
                              <span className={LABEL}>{leaf.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
