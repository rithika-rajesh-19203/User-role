import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * SETTINGS BAR — the bar at the top of the settings area. ZF-SETTINGS-BAR.md.
 *
 * ── IT REPLACES THE TOP BAR. THAT IS THE WHOLE DESIGN. ───────────────────────
 * §1: this is not a second bar stacked under the product chrome. Entering
 * settings swaps one full-width bar for another, and that swap is what tells the
 * user they have left the product and entered a configuration mode. Stacking
 * them would say the opposite — that settings is just another page.
 *
 * Two consequences the spec draws out, and both are load-bearing:
 *
 * · **The gutter is the page's column, not TopBar's 20.** ZF-SETTINGS-PAGE.md
 *   §2.1 amends the original reasoning: the bar was built to keep TopBar's
 *   leading edge so nothing shifted sideways, but TopBar is *gone* in settings,
 *   so the only alignment left that matters is with the page beneath. Content
 *   sits in the same centred 1292 column; the background stays full-bleed.
 * · **The height does NOT match.** 48 → 72, deliberately. A vertical change
 *   reads as a mode change, which is exactly the message.
 *
 * ── WHY IT OWNS THE SCROLL CONTAINER ─────────────────────────────────────────
 * `position: sticky` needs an unclipped scroll ancestor and a positioned parent
 * for the sentinel. A screen cannot supply either without a styled bare element,
 * which rule 4 rejects — correctly, because "the settings region scrolls and the
 * bar sticks to it" is a design decision. So the component takes `children` and
 * renders the region itself. It is the bar plus the scroll context the bar
 * requires, and there is no correct way to split those.
 *
 * ── THE THREE-TRACK GRID ─────────────────────────────────────────────────────
 * §3.1 is the thing that is easy to get wrong and hard to notice. The search is
 * centred on the BAR, not between the clusters: two `minmax(0, 1fr)` tracks
 * resolve equal by definition, so the middle track sits on the centre line
 * whatever the sides contain. A flex row with spacers puts it 5px off and makes
 * it DRIFT every time the title's length changes.
 *
 * `minmax(0, 1fr)` rather than `1fr`, and `min-w-0` on both the brand and the
 * title: a bare `1fr` takes its content as an automatic minimum, so the brand
 * refuses to shrink and paints over the search — measured at 1590px of brand
 * inside a 586px track, with the ellipsis hidden underneath the field.
 */
export interface SettingsBarProps {
  /** The settings area's `<h1>`. Truncates; the full string stays in `title`. */
  title?: string;
  /**
   * The product's own mark — an instance swap in Figma, a node here.
   *
   * §6 treats this as a BRAND ASSET: it does not inherit `currentColor`, does
   * not change in Dark, and must not be recoloured or swapped for a ZF icon.
   * A monochrome product glyph that DOES follow the theme is a deliberate
   * departure the caller makes, not something this component decides.
   */
  mark: ReactNode;
  /**
   * The organisation the settings belong to, under the title. Settings are
   * per-org, so which org you are configuring is not decoration — it is the
   * single most important qualifier on every destination below.
   */
  org?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showClose?: boolean;
  onSearch?: (query: string) => void;
  onClose: () => void;
  /**
   * WHICH SETTINGS LEVEL THIS BAR IS SITTING ON — and this is ONE axis, not
   * four props, which is the whole reason it exists.
   *
   * ZF-SETTINGS-NAV.md §2.3 files this as open item 60: level 1 overrides the
   * bar's corner radii and hides its rule on the instance, "fine for one
   * consumer and wrong for two". Four things change between the levels:
   *
   *   | | `flush` (level 0) | `floating` (level 1) |
   *   | gutter    | the page's 1292 column, 110 | the rail's first glyph, 22 |
   *   | radius    | none                        | `0 0 12 12`               |
   *   | rule      | shown                       | hidden (§2.3)             |
   *   | scrolling | owns the scroll container   | a static grid row         |
   *
   * All four are perfectly correlated — there is no drawn design with a flush
   * bar at a rail gutter, or a floating bar that also owns a scroller. By
   * CLAUDE.md's modelling test 4 ("does one value mean ignore another axis?")
   * that makes them one dimension with two values, not four booleans whose
   * sixteen combinations are mostly nonsense.
   *
   * §2.2 is why the gutter rides along rather than being its own prop: the rule
   * was never "the bar's gutter is 110", it is "the bar's left content aligns
   * with whatever is directly beneath it". Level 0 has a centred column
   * beneath, level 1 has a 240 rail. The gutter is a consequence of the dock,
   * not an independent choice.
   */
  dock?: 'flush' | 'floating';
  /**
   * Level 1's back control. Given, the title BECOMES the control — §3.4: the
   * mark and the divider survive, only the title changes. Omitted, the title
   * renders as the `<h1>` it is at level 0.
   */
  onBack?: () => void;
  /**
   * `floating` only. The bar no longer owns a scroller, so it cannot observe
   * its own sentinel — the shell owns the body scroller and reports upward.
   * This is data about someone else's scroll position, not a variant.
   */
  scrolled?: boolean;
  /** `floating` only, below `settings-nav`: reveals the rail as a drawer. */
  onToggleNav?: () => void;
  navOpen?: boolean;
  navToggleRef?: RefObject<HTMLButtonElement | null>;
  /**
   * Controls that sit before Close Settings — the org switcher and the account
   * button. Added for the role access app (v2); not in the Figma bar yet.
   */
  actions?: ReactNode;
  /** The settings content that scrolls under the bar. `flush` only. */
  children?: ReactNode;
  className?: string;
}

export function SettingsBar({
  title = 'All Settings',
  mark,
  org,
  searchPlaceholder = 'Search Settings',
  showSearch = true,
  showClose = true,
  onSearch,
  onClose,
  dock = 'flush',
  onBack,
  scrolled: scrolledProp,
  onToggleNav,
  navOpen = false,
  navToggleRef,
  actions,
  children,
  className,
}: SettingsBarProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [ownScrolled, setOwnScrolled] = useState(false);
  const searchId = useId();
  const floating = dock === 'floating';
  //  Floating has no scroller of its own, so the shell's report is the only
  //  source; flush observes its own sentinel and ignores the prop.
  const scrolled = floating ? Boolean(scrolledProp) : ownScrolled;

  /*  §5 — the shadow appears only once the content beneath has actually
      scrolled; a shadow at rest reads as a floating panel rather than a fixed
      header. Driven from a sentinel, because a `scroll` listener costs a
      callback on every frame of every scroll and this costs one observer.  */
  useEffect(() => {
    //  Floating reports from outside; there is no sentinel to observe.
    if (floating) return undefined;
    const el = sentinel.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => setOwnScrolled(!e.isIntersecting),
      { threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [floating]);

  /*  §9.2 — the target guard is not optional. A bare document listener fires
      wherever focus is, and `type="search"` already clears on Escape, so one
      press BOTH emptied the field and ejected the user from settings.  */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && typeof t.closest === 'function' && t.closest('[data-zf-settings-search]')) return;
      //  Escape belongs to the topmost layer. With a Modal, SidePanel or Menu
      //  open it closes THAT, and must not also eject the user from settings.
      //  Added for the role access app (v2).
      if (e.defaultPrevented) return;
      if (t && typeof t.closest === 'function' && t.closest('dialog, [role="menu"]')) return;
      if (document.querySelector('dialog[open], [role="menu"]')) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /*  Two things this component cannot fix but must not fail silently on.  */
  useEffect(() => {
    if (import.meta.env.PROD) return;
    //  §9.1 — `role="banner"` must be unique. If TopBar is still mounted, the
    //  page has two banners and the swap this component exists for did not
    //  happen.
    if (document.querySelectorAll('[role="banner"]').length > 1) {
      // eslint-disable-next-line no-console
      console.error(
        'SettingsBar: two banners on the page. The settings bar REPLACES TopBar — '
        + 'render one or the other, never both.',
      );
    }
    //  §5.1 — any ancestor with overflow hidden or clip becomes the sticky
    //  scrollport and, because it does not scroll, the bar never sticks. It
    //  scrolls off instead, while the sentinel still flips and paints a shadow
    //  on a bar that has already left.
    let el = floating ? null : (bar.current?.parentElement ?? null);
    while (el && el !== document.body) {
      const o = getComputedStyle(el).overflow;
      if (o.includes('hidden') || o.includes('clip')) {
        // eslint-disable-next-line no-console
        console.error(`SettingsBar: an ancestor has overflow:${o} — sticky will not work.`, el);
        break;
      }
      el = el.parentElement;
    }

    //  §5.1, the other way in: the scrollport is THIS element, so it also fails
    //  when this element does not scroll. A host that is not a flex box makes
    //  `flex-1` inert, the height falls back to `auto`, and the scrollport grows
    //  to fit — no overflow, no scroll, no sticky. Compare the two heights
    //  rather than the classes, because the cause can be anything that leaves
    //  the box unbounded.
    //  Floating does not own a scrollport, and must not: the shell's grid row
    //  is the whole point. Asserting there would fire on a correct build.
    const port = floating
      ? null
      : (bar.current?.closest('[data-zf-settings-scrollport]') as HTMLElement | null);
    if (port && port.scrollHeight <= port.clientHeight + 1 && port.clientHeight > window.innerHeight) {
      // eslint-disable-next-line no-console
      console.error(
        'SettingsBar: its scroll container is taller than the viewport, so it never '
        + 'scrolls and the bar cannot stick. Give the host a definite height.',
        port,
      );
    }
  }, [floating]);

  const FIELD = cn(
    'flex items-center gap-4 box-border w-topbar-search h-settings-field px-6',
    'rounded-md border transition-colors motion-reduce:transition-none',
    'bg-surface-sunken border-border-divider text-icon-subtle',
    //  §7.2 — `border/divider` IS `surface/pressed` (#E9EAF5, both modes), so a
    //  hover that changed only the fill rendered the field BORDERLESS. The hover
    //  border has to move to `border/default`.
    'hover:bg-surface-pressed hover:border-border-default hover:text-primary-default',
    'focus-within:bg-surface-default focus-within:text-primary-default',
    //  §8.1 — an outline, never a border swap: a 2px border eats 1px of the 36px
    //  field and reflows its contents on focus.
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
  );

  const header = (
  <header
    ref={bar}
    role="banner"
    data-zf-settings-bar
    data-state={scrolled ? 'scrolled' : 'rest'}
    className={cn(
      //  Full-bleed background, centred content — see the column note below.
      'box-border flex justify-center w-full h-settings-bar bg-surface-default',
      'transition-shadow duration-150 motion-reduce:transition-none',
      floating
        //  §2.3 — DOCKED. Flush to the viewport at the top, 2px clear of the
        //  panels below, so the corners are `0 0 12 12`: square where it
        //  meets the viewport, rounded where it meets the canvas.
        //
        //  Not `sticky`. It is grid row 1 of a `100dvh` shell that does not
        //  scroll, so there is nothing to stick to — and a sticky element in
        //  a non-scrolling container is where §5.1's failure comes from.
        ? cn('rounded-b-xl px-settings-bar-gutter',
          //  §2.3 — the 1px rule is OFF. It exists to separate the bar from
          //  content that touches it; here the 2px canvas gutter already
          //  does that, and a rule plus a gutter reads as a double line.
          //  The rule is a SHADOW, not a border and not an `::after`
          //  (ZF-SETTINGS-BAR.md §8.4 — a border knocks `items-center` off
          //  half a pixel), so killing it means no shadow, not `display:
          //  none`. The scrolled elevation stays: a floating bar still
          //  wants it.
          scrolled ? 'shadow-settings-scrolled' : 'shadow-none')
        : cn('sticky top-0 z-20 px-10',
          scrolled ? 'shadow-settings-scrolled' : 'shadow-settings-rest'),
    )}
  >
    {/*  §2.1 of ZF-SETTINGS-PAGE.md AMENDS this component.
         It was built at a flat 20px gutter, reasoning that the bar replaces
         TopBar and should keep its leading edge. That was decided without
         the settings page in front of it and it is wrong: the top bar this
         replaces is GONE, so the only thing left to align with is the page
         beneath — whose content sits in a centred 1292 column. The mock's
         own numbers agree, drawing the bar at 120 and the page at 110, two
         values trying to be one.

         The BACKGROUND still spans edge to edge. Only the content moves. */}
    <div
      className={cn(
        'grid items-center w-full grid-cols-settings',
        //  §2.2 — level 0 aligns to the page's centred 1292 column; level 1
        //  aligns to the rail, so the content spans the full width and the
        //  22px gutter on the header does the aligning. The three-track
        //  grid stays either way, which is what keeps search centred (§3.4
        //  lists it as the one thing that does not change between levels).
        !floating && 'max-w-settings-column',
      )}
    >
    {/*  BRAND. `min-w-0` + `max-w-full` + `overflow-hidden`, all three: the
         track clamps the width, `min-w-0` lets the flex item shrink below
         its content, and the clip is what makes the excess disappear rather
         than paint over the search. §8.3 rejects the mock's 562px clamp —
         it is derived from the reference width and overlaps by 220px at
         1024. */}
    <div className="col-start-1 justify-self-start flex items-center gap-5 min-w-0 max-w-full overflow-hidden">
      {/*  §6.6 — THE DRAWER TOGGLE, and it exists only where the drawer does.
           Below `settings-nav` the rail leaves the grid and becomes an
           overlay, so something has to reveal it; at and above, the rail is
           always on screen and a toggle would be a control for a state that
           cannot occur. `hidden` + `max-settings-nav:inline-grid` rather
           than an `aria-hidden` — a button that is off-screen but focusable
           is a tab stop to nowhere.

           `sidebar-collapse` and not a hamburger: there is no hamburger in
           the roster, and this is the same affordance `Nav` uses for the
           same job. A name is a specific glyph; reaching for the one that
           already means "show or hide the rail" beats drawing a second. */}
      {floating && onToggleNav ? (
        <button
          ref={navToggleRef}
          type="button"
          onClick={onToggleNav}
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Hide settings navigation' : 'Show settings navigation'}
          className={cn(
            'hidden max-settings-nav:inline-grid place-items-center flex-none',
            'size-settings-back rounded-md border-0 cursor-pointer',
            'bg-transparent text-icon-default',
            'transition-colors motion-reduce:transition-none',
            'hover:bg-surface-hover active:bg-surface-pressed',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
        >
          <Icon name="sidebar-collapse" size="md" tone="inherit" />
        </button>
      ) : null}
      {/*  THE MARK CARRIES THE BRAND COLOUR, not the text colour. §6 treats
           it as a brand asset — it should not inherit `currentColor` and
           should not flip with the mode. `brand/*` is exactly that: it
           follows `data-brand` so a red product gets a red mark, and
           brand.css declares no dark block at all, so it is
           mode-independent by construction. */}
      <span aria-hidden className="flex-none grid place-items-center size-10 text-brand-solid">
        {mark}
      </span>
      {/*  `self-stretch` rather than a height: with the org line present the
           rule spans both lines, without it just the title, and neither case
           needs a number. */}
      <span
        aria-hidden
        data-zf-settings-divider
        className="flex-none self-stretch w-px my-4 bg-border-divider"
      />
      {onBack ? (
        /*  §3.4 — `zf-settings-back`. A REAL button, not a styled link: it
            returns to level 0 within the settings surface, which is a state
            change and not a destination with a URL of its own.

            Hug × 32. The mock draws 34; `zf-settings-close` — its sibling
            in this same bar — ships 32, and ZF-SETTINGS-BAR.md §9 already
            rejected a fourth control height.

            THE BLUE CARET IS THE POINT. The label is `text/default` and the
            glyph is `primary/default`, so the "go back" affordance is
            carried by the caret — it is the only primary-coloured thing in
            the bar's left slot, which is why it reads as the action rather
            than as a heading. `Icon`'s own `tone` prop does that; passing a
            colour through `className` beside `tone="inherit"` is the
            cascade trap that killed four tones on the settings page.  */
        <button
          type="button"
          onClick={onBack}
          data-zf-settings-back
          className={cn(
            'min-w-0 box-border inline-flex items-center gap-4 cursor-pointer',
            'h-settings-back px-4 rounded-md border-0',
            'bg-surface-canvas text-text-default',
            'transition-colors motion-reduce:transition-none',
            'hover:bg-surface-hover active:bg-surface-pressed',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
        >
          <Icon name="chevron-left" size="md" tone="primary" className="flex-none" />
          <Text size="heading" weight="medium" title={title} className="truncate">
            {title}
          </Text>
        </button>
      ) : (
        <div className="min-w-0 flex flex-col justify-center">
          <Text as="h1" size="title" weight="medium" title={title} className="truncate">
            {title}
          </Text>
          {org ? (
            <Text size="body-sm" tone="secondary" title={org} className="truncate">
              {org}
            </Text>
          ) : null}
        </div>
      )}
    </div>

    {showSearch ? (
      <form
        role="search"
        data-zf-settings-search
        className={cn('col-start-2', FIELD)}
        onSubmit={(e) => e.preventDefault()}
      >
        <Icon name="search" size="md" tone="inherit" className="flex-none" />
        <label htmlFor={searchId} className="sr-only">Search settings</label>
        {/*  §7.1 — the placeholder is `text/secondary`, NOT
             `text/placeholder`. Measured on the fill it actually sits on,
             `text/placeholder` is 2.54:1 at rest and 2.39:1 on hover. The
             2.85 the audits quote is against white, which never occurs
             here: the only white-filled state is focus, and by then the text
             is a real value at `text/default`. */}
        <input
          id={searchId}
          type="search"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent border-0 outline-none p-0',
            'text-body text-text-default placeholder:text-text-secondary',
          )}
        />
      </form>
    ) : null}

    <div className="col-start-3 justify-self-end inline-flex items-center gap-4">
    {actions}
    {showClose ? (
      <button
        type="button"
        onClick={onClose}
        data-zf-settings-close
        className={cn(
          'box-border inline-flex items-center gap-4',
          'h-button-lg px-6 rounded-md border cursor-pointer whitespace-nowrap',
          'bg-surface-sunken border-border-divider text-body text-text-default',
          'transition-colors motion-reduce:transition-none',
          'hover:bg-danger-subtle hover:border-danger-border hover:text-danger-text',
          'active:bg-surface-pressed',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        )}
      >
        Close Settings
        {/*  Decorative: the label already says it. */}
        <Icon name="close" size="md" tone="danger" className="flex-none" />
      </button>
    ) : null}
    </div>
    </div>
  </header>
  );

  /*  §2.3 / open item 60 — FLOATING RETURNS THE BAR AND NOTHING ELSE.
      At level 1 the shell owns the layout: the bar is grid row 1, the rail and
      the body are row 3, and all three are siblings. Wrapping the bar in a
      scroll container here would make it row 1's only child AND a scroller
      inside a `100dvh` grid — the bar would scroll its own empty body while the
      panels beside it scrolled separately. `children` is deliberately not
      rendered: at level 1 there is nothing "under" the bar to render. */
  if (floating) return header;

  return (
    //  `relative` for the sentinel, and this element is the scroll container the
    //  sticky bar needs. `overflow-y-auto` here and nowhere between.
    //
    //  `h-full` AND `flex-1`, both, because the host is not guaranteed to be a
    //  flex box. `Settings` renders this straight into `#root`, which is a
    //  BLOCK — and flex properties on a block child are inert, so `flex-1`
    //  alone left the height at `auto`. The element still became a scroll
    //  container (`overflow-y-auto` does that unconditionally) but one whose
    //  scrollport always fits its content, so it never scrolled, the sticky bar
    //  had zero scroll range inside it, and the document scrolled instead —
    //  §5.1's exact failure, reached by a route the assertion below did not
    //  look for. `h-full` resolves against `#root`'s definite `height: 100%`;
    //  in a flex column `flex-1`'s `flex-basis: 0` wins and `h-full` is ignored.
    //  Correct under both parents, which is the point.
    <div
      data-zf-settings-scrollport
      className={cn('relative h-full flex-1 min-h-0 overflow-y-auto bg-surface-canvas', className)}
    >
      {/*  §5 — ABSOLUTE, not in flow. An in-flow 1px div puts the bar's top at
           y=1, so a strip of page background shows above a bar meant to reach
           the viewport edge, and the bar snaps up a pixel on first scroll. */}
      <div ref={sentinel} aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none" />
      {header}

      {children}
    </div>
  );
}
