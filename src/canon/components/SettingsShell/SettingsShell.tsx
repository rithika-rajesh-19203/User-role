import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Divider } from '../Divider/Divider';
import { SettingsBar } from '../SettingsBar/SettingsBar';
import { cn } from '../../utils/cn';
import {
  countSettingsLinks, filterSettingsSections,
} from '../SettingsPage/filter';
import type { SettingsLink, SettingsSection } from '../SettingsPage/filter';
import { SettingsNav } from '../SettingsNav/SettingsNav';

/**
 * SETTINGS SHELL — level 1. ZF-SETTINGS-NAV.md §2.
 *
 * ── THE 2px GUTTER IS DOING REAL WORK ───────────────────────────────────────
 *
 *     2  +  240  +  2  +  1266  +  2  =  1512      exact
 *
 * 2px reads like a rounding error. It is the only thing separating three white
 * panels on a near-white canvas, and together with the 12px radius it is what
 * makes them read as panels rather than as one sheet with lines drawn on it.
 * The two values are a PAIR: a 12px radius at a 0px gutter is a sheet with
 * notched corners; a 2px gutter at a 0px radius is a sheet with hairlines. If
 * the gutter ever grows, the radius grows with it.
 *
 * ── WHAT MAKES THE PANELS SCROLL, AND WHAT DOES NOT (§6.2) ──────────────────
 * `minmax(0, 1fr)` on the panel row is DEFENSIVE, not load-bearing, and this is
 * worth stating because the opposite is the house reflex. A grid item that is
 * itself a scroll container already has an automatic minimum of zero (CSS Grid
 * §6.6) — and both row-3 items are one. The spec measured `1fr` and
 * `minmax(0, 1fr)` as byte-identical here. The scroll guard is
 * `overflow-y: auto` on the panels.
 *
 * It stays because it keeps working if someone later removes `overflow` from a
 * panel, and because it is the convention every other shrinkable track in this
 * repo uses. But the ship checklist no longer pretends it is the mechanism.
 *
 * ── LEVEL 0 → LEVEL 1 IS A RE-LAYOUT, NOT A NAVIGATION (§1) ─────────────────
 * Nothing is added at level 1: the SAME link array is re-presented. Level 0 is
 * a browse surface (five columns, scannable), level 1 a work surface (one
 * narrow rail, so the body gets 1266 of 1512). The bar does not move and the
 * canvas does not flash — only the bar's left slot changes and the body swaps.
 */

export interface SettingsShellProps {
  /** The same array `SettingsPage` renders as cards. §8.1 — one source. */
  sections: SettingsSection[];
  /** The leaf id for the current route. */
  currentId?: string;
  onNavigate?: (leaf: SettingsLink) => void;
  /** Back to level 0. The rail unmounts and the bar's left slot reverts. */
  onBack: () => void;
  /** Leaves the settings surface entirely. */
  onClose: () => void;
  /** The product mark, for the bar's left slot. */
  mark: ReactNode;
  /** The current page's title, shown in the back control. */
  title?: string;
  /** A page header — its own grid row, OUTSIDE the scroller. §6.3. */
  header?: ReactNode;
  /** Passed to the bar's `actions` slot. */
  barActions?: ReactNode;
  /** An action footer (Save / Cancel) — also its own row. */
  footer?: ReactNode;
  /** The scrolling body content. */
  children?: ReactNode;
  className?: string;
}

export function SettingsShell({
  sections,
  currentId,
  onNavigate,
  onBack,
  onClose,
  mark,
  title = 'Settings',
  header,
  barActions,
  footer,
  children,
  className,
}: SettingsShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');

  /*  §5 — THE BAR'S SEARCH FILTERS THE RAIL, and it filters it with the same
      function level 0 uses, from a module neither component owns. Two copies of
      "does this label match" would eventually disagree about case, trimming or
      whether a group title counts, and the user would see one level find a
      setting the other could not.

      It narrows IN PLACE and never navigates. Taking the user somewhere on the
      first keystroke destroys the overview they opened the rail for.  */
  const visible = filterSettingsSections(sections, query);
  const total = countSettingsLinks(visible);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navWrap = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  /*  Following a link must not leave the drawer sitting over the page it just
      navigated to. Adjusted during render rather than in an effect, for the
      same reason as `SettingsNav`'s open branch: an effect would paint the
      drawer over the new page for one frame before closing it, which is the
      flash the user notices most.  */
  const [seenId, setSeenId] = useState(currentId);
  if (seenId !== currentId) {
    setSeenId(currentId);
    setNavOpen(false);
  }

  /*  §7 — Escape closes and focus RETURNS TO THE TOGGLE. Returning focus is the
      half people skip; without it Escape drops the user at the top of the
      document and the drawer they just closed is unreachable by keyboard.

      Bound to the drawer, not to `document`: a bare document listener also
      fires from inside the bar's search input, where Escape already means
      "clear the field" — the same collision ZF-SETTINGS-BAR.md §9.2 found.  */
  useEffect(() => {
    if (!navOpen) return undefined;
    const el = navWrap.current;
    if (!el) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setNavOpen(false);
      toggleRef.current?.focus();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [navOpen]);

  /*  §2.3 — the bar's scrolled elevation. It no longer owns a scroller, so the
      body reports upward. A sentinel rather than a scroll listener: one
      observer against a callback on every frame of every scroll.  */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const closeNav = useCallback(() => setNavOpen(false), []);

  /*  THE DRAWER'S TRAP IS THE PLATFORM'S, APPLIED BY HAND.
      §7 says to reuse the trap `Modal` ships — and what `Modal` ships is the
      native `<dialog>` + `showModal()`, whose trap works by making everything
      outside the dialog inert. Swapping the rail for a `<dialog>` below 900
      would make one thing two different elements at two widths, so instead the
      same mechanism is applied directly: `inert` on the bar and the body while
      the drawer is open.

      This is strictly better than a hand-rolled trap. Every hand-written one in
      the wild gets `Shift+Tab` off the first element wrong, or forgets that
      `aria-hidden` still leaves children focusable. `inert` removes them from
      the tab order AND from the accessibility tree, in one attribute the
      browser implements.

      It applies at every width, which is correct: above 900 `navOpen` is never
      true, because the toggle that sets it is display:none there.  */
  const inertWhenDrawerOpen = navOpen || undefined;

  return (
    <div
      data-zf-settings-shell
      data-nav-open={navOpen || undefined}
      className={cn(
        'box-border grid h-dvh bg-surface-canvas',
        'grid-cols-settings-shell grid-rows-settings-shell',
        'max-settings-nav:grid-cols-settings-shell-narrow',
        className,
      )}
    >
      {/*  §7.3 — `position: fixed`, and NEVER `position: static` on focus.
           This shell is a grid, so `static` enrols the revealed link as a GRID
           ITEM; auto-placement drops it into row 2 / column 1, which is a
           2 x 2px gutter cell. The spec measured the result: rect 2x2 with a
           150px scrollWidth, 97% of its ink painted over by the bar, nav and
           body, and the focus ring drawn around a 2px box. WCAG 2.4.1 and
           2.4.7, both failed, by a rule that is fine in a non-grid layout.

           The lesson generalises past skip links: `static` is not a neutral
           reset, it enrols the element in whatever layout its parent runs. */}
      <a
        href="#zf-settings-body"
        className={cn(
          'fixed top-0 start-1 z-50 -translate-y-full focus-visible:translate-y-1',
          'box-border px-6 py-3 rounded-md no-underline',
          'bg-surface-default text-body font-medium text-primary-text',
          'shadow-settings-scrolled',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        )}
      >
        Skip to settings content
      </a>

      {/*  Row 1, full bleed. `dock="floating"` returns the bar alone — see the
           note on that prop for why the four differences are one axis. */}
      <div className="row-start-1 col-start-1 col-span-5 max-settings-nav:col-span-3" inert={inertWhenDrawerOpen}>
        <SettingsBar
          dock="floating"
          mark={mark}
          title={title}
          onBack={onBack}
          onClose={onClose}
          onSearch={setQuery}
          scrolled={scrolled}
          navOpen={navOpen}
          navToggleRef={toggleRef}
          actions={barActions}
          onToggleNav={() => setNavOpen((o) => !o)}
        />
      </div>

      {/*  Row 3 column 2 — until the drawer breakpoint, where it leaves the
           grid entirely and the body takes the whole width. */}
      <div
        ref={navWrap}
        className={cn(
          'row-start-3 col-start-2 min-h-0 grid',
          //  §6.6.1 — `inline-size` IS REQUIRED once this is fixed, and it is
          //  the kind of thing that is invisible in review. The rail is 240
          //  because grid column 2 is 240; the moment it stops being a grid
          //  item, `inset-inline-start` with no width falls back to
          //  shrink-to-fit — the spec measured 192.48px at three viewports,
          //  which drops the label box from 186 to 138 and throws away 47.5px
          //  of a width §3.3 already calls tight.
          //
          //  The general shape: any value a fixed element used to INHERIT from
          //  its layout parent has to be restated when you take it out of that
          //  layout.
          'max-settings-nav:fixed max-settings-nav:z-20',
          'max-settings-nav:w-settings-nav',
          'max-settings-nav:top-settings-drawer-top max-settings-nav:bottom-1 max-settings-nav:start-1',
          //  A white drawer over a white panel needs an edge of its own. §2's
          //  "no panel shadow" is about DOCKED panels, not a floating one.
          'max-settings-nav:shadow-settings-scrolled',
          'max-settings-nav:-translate-x-full max-settings-nav:transition-transform',
          'max-settings-nav:duration-150 motion-reduce:transition-none',
          navOpen && 'max-settings-nav:translate-x-0',
        )}
      >
        <SettingsNav sections={visible} currentId={currentId} onNavigate={onNavigate} />
      </div>

      {/*  §6.6 — the scrim. Only below the breakpoint, and only when open;
           `pointer-events-none` at rest so it cannot swallow clicks meant for
           the body. Decorative and redundant with Escape, so it is not a
           button — but it is not `aria-hidden` either, because it has no
           content to hide. */}
      <div
        onClick={closeNav}
        className={cn(
          'hidden max-settings-nav:block fixed inset-0 z-10 bg-overlay-scrim',
          'opacity-0 pointer-events-none transition-opacity duration-150',
          'motion-reduce:transition-none',
          navOpen && 'opacity-100 pointer-events-auto',
        )}
      />

      {/*  §7 — the result count in a POLITE live region. Assertive would
           interrupt the screen reader on every keystroke, which is exactly the
           behaviour that makes people turn live regions off. Rendered only
           while a query is active: an empty region that says "70 settings" on
           mount is noise, and a region that appears and disappears is not
           announced reliably, so it is the TEXT that changes, not the node. */}
      <div aria-live="polite" className="sr-only">
        {query.trim() ? `${total} ${total === 1 ? 'setting' : 'settings'} found` : ''}
      </div>

      <div
        id="zf-settings-body"
        tabIndex={-1}
        inert={inertWhenDrawerOpen}
        className={cn(
          'row-start-3 col-start-4 max-settings-nav:col-start-2',
          'box-border min-h-0 grid grid-rows-settings-body',
          'bg-surface-default rounded-xl',
          //  Clips content to the 12px radius. §6.3 measured what this does and
          //  does not break: sticky sticks FINE to a clipping scrollport — what
          //  kills it is an INTERMEDIATE clipping wrapper between the sticky
          //  element and the scroller it means to stick to, because it sticks
          //  to the wrapper and the wrapper scrolls away. Silently.
          //
          //  Which is why `header` is a grid row of its own, outside the
          //  scroller: there it needs no `sticky` at all and cannot be broken
          //  by a wrapper someone adds later.
          'overflow-hidden',
        )}
      >
        {/*  THE HEADER BAND. Its geometry lives here, not in the page, so every
             configuration page gets one identical band instead of ~90 pages
             each choosing their own padding.

             20 inline, 20 above the title and 10 below it, then a rule that
             runs EDGE TO EDGE. The asymmetric block padding is deliberate and
             is what the reference draws: the rule belongs to the title, so it
             sits closer to it than the title sits to the bar above.

             The rule is full-bleed rather than sharing the content's 20px
             edge. A rule is a structural division of the PANEL — it says
             "header ends, body begins" — and a division that stops short of
             the thing it divides reads as an underline on the title instead.
             The content edge and the panel edge are two different alignments
             and only the content's is shared. */}
        {header ? (
          <div className="row-start-1 flex flex-col">
            <div className="box-border flex items-center gap-6 px-10 pt-10 pb-5">
              {header}
            </div>
            <Divider gap="none" />
          </div>
        ) : null}

        {/*  ROW 2 EXPLICITLY, and this is a fix rather than tidying.
             `grid-rows` places children in source order, and `header` and
             `footer` are optional — so with neither passed (which is every page
             today) the scroller became child #1 and landed in row 1's `auto`
             track. Auto sizes to content, the body's `overflow-hidden` clipped
             the overflow, and the page simply could not be scrolled to the end.
             Naming the row makes the placement independent of which optional
             slots happen to be filled. */}
        <div className="row-start-2 relative min-h-0 overflow-y-auto overscroll-contain">
          <div ref={sentinel} aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none" />
          {/*  20 from the start edge and 20 from the rule above, matching the
               header's inline padding so the whole panel reads on one edge.
               The scroller — not this box — owns the overflow, so the padding
               scrolls with the content rather than clipping it. */}
          <div className="box-border ps-10 pt-10">{children}</div>
        </div>

        {footer ? <div className="row-start-3">{footer}</div> : null}
      </div>
    </div>
  );
}
