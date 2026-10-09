import { generatedPaths } from './geometry.generated';

/**
 * THE ICON ROSTER — the names the system may ask for.
 * Source: design-refs/zf-icons.md, measured 2026-08-20.
 *
 * The Figma set is **51 icons — 47 standalone plus a 4-variant `icon / chevron`
 * set**, and this list is all 51: the 38 standalone names the md states, the 9 it
 * leaves unnamed, and `chevron` re-expanded from one component to four directions.
 *
 * The count closes exactly. 47 SVGs were exported from the page; 38 of them match
 * a name the md states and 9 do not, which is precisely the 47 - 38 the md's own
 * totals imply. Nothing is missing and nothing is invented.
 *
 * Adding a glyph is one SVG in design-refs/icons/ plus one line here.
 */
export const ICON_NAMES = [
  // ── chevron — one Figma component, four variants on a `Direction` axis.
  //    Four names here because a React component does not have variant axes the
  //    way a Figma component set does; `direction` would be a fifth prop on
  //    Icon for one glyph. md §7 wants every directional icon to adopt this
  //    model — still open, and it is a Figma-side modelling decision.
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',

  // ── arrows — sort indicators. NOT interchangeable with a chevron (§2.24.10).
  //    md §7: arrow-up and arrow-down are the SAME glyph with rotation 180, and
  //    should have been one Direction variant. Open item 17.
  'arrow-up', 'arrow-down', 'arrow-right',

  // ── actions
  'search', 'close', 'plus', 'plus-circle', 'edit', 'upload', 'settings', 'pin',
  'caret-down', 'sidebar-collapse',
  //  A deliberate line before the SVG, not a side effect of one appearing:
  //  `icons:sync` skips an export whose name it does not already know.
  'share', 'clone', 'lock', 'preference', 'autoscan', 'create-credit-note',
  'delete',
  //  NO GEOMETRY YET. On the roster so it renders the dashed placeholder —
  //  which is the tracking mechanism, not a thing to silence by picking a
  //  near-enough glyph. Drop `zfi-phone.svg` into design-refs/icons/ and
  //  `npm run icons:sync` fills it in with no other change.
  'phone',

  // ── status — every tone gets its own SHAPE, not just its own colour (§2.13.2)
  'info', 'check-circle', 'alert-circle', 'alert-triangle', 'x-circle',

  // ── views — the segmented control (§2.10.8)
  'card-view', 'list-view', 'table-view', 'board-view',

  // ── wizard / breadcrumb steps (§2.9, §2.19.5)
  'learn', 'configure', 'publish',

  // ── chrome
  'home', 'apps', 'admin', 'documents',

  // ── the date picker trigger. Added for the role access app (v2): drawn here
  //    to the house stroke until a Figma export replaces it.
  'calendar',

  // ── ERP modules — the sidebar rail. All eleven measured in md §5.5 / §12.
  'items', 'inventory', 'sales', 'purchases', 'timesheets', 'tax',
  'custom-modules', 'payroll', 'accountant',

  // ── the nine the md never names. See ICONS_ABSENT_FROM_MD.
  'attach', 'more', 'table-config', 'build', 'users', 'bell',
  'bank', 'reports', 'sparkle',

  // ── ADDED HERE, not measured anywhere. The roster IS the contract, so a new
  //    name is a deliberate line before any SVG can be ingested for it —
  //    `icons:sync` skips an export whose name it does not know rather than
  //    adding one as a side effect of a file appearing.
  //
  //    `filter` is the funnel beside a list view's overflow. It is in neither
  //    §3.1's 38 measured glyphs nor the nine in ICONS_ABSENT_FROM_MD, so
  //    nothing checks it and it renders a dashed placeholder until the export
  //    lands in design-refs/icons/. That placeholder is the point.
  'filter',

  //    zf-menu.md §3.7 — five glyphs AUTHORED for the menu, because the source
  //    drew them as loose FRAMEs of ungrouped vectors (`sort icon 1`,
  //    `import-statement 1`, `refresh list 1`) with `import` and `export` the
  //    same art mirrored. They exist in Figma now; the exports have not landed
  //    here yet, so all five render placeholders.
  //
  //    `check` is NOT `check-circle`. §5's `Kind=check` marks a row whose value
  //    is on, and a tick in a ring is a status glyph.
  'sort', 'import', 'export', 'refresh', 'check',

  //    A SOLID down caret, and the roster's third down-pointing glyph — which is
  //    not duplication, because the three are different weight classes and
  //    zf-icons.md §3.1 is entirely about weight:
  //
  //      chevron-down      stroked 1.25, derived   9.7 × 5.5 at a 16 slot
  //      caret-down        filled outline, ~1.0    8.1 × 4.6
  //      caret-down-bold   SOLID                  15.8 × 8.6
  //
  //    The page header's disclosure caret sits beside 18px Semi Bold and needs
  //    the third. It was using `chevron-down` at the `xl` slot to fake the
  //    weight, which is the workaround this replaces.
  'caret-down-bold',

  //    The grip on a draggable row. Not measured anywhere — there is no md for a
  //    reorder list — so it is a deliberate roster line with no export behind it
  //    and renders a dashed placeholder until one lands. That is survivable here
  //    ONLY because the handle is a hint rather than the mechanism: the whole
  //    control is a button, it reorders with the arrow keys, and drag is the
  //    pointer's shortcut to the same thing.
  'drag-handle',

  //    zf-action-bar.md §3.6. `mail` and `print` were AUTHORED there and the md
  //    prints their exact path data, so they are derived below rather than
  //    waiting on an export — the same standing the chevron has.
  //
  //    `pdf` is not in the md at all: §3.6 uses `icon / documents` for the third
  //    button and the reference image shows a PDF page, which is the correction
  //    the design owner has flagged. A deliberate roster line with no geometry,
  //    so the gap is on screen rather than papered over with a folder.
  'mail', 'print', 'pdf',

  // ── the rich-text toolbar. Six DELIBERATE roster lines with no export behind
  // them, so all six render the dashed placeholder until the SVGs land in
  // design-refs/icons/ — which is the tracking mechanism, not something to
  // silence by borrowing `attach` for `link` because the shapes rhyme.
  //
  // Bold, italic and underline are NOT here and never will be: they are
  // letterforms, not glyphs. Every editor draws them as a bold B, an italic I
  // and an underlined U, because the control is a sample of what it does. An
  // icon would be a picture of a letter where the letter itself is available,
  // and it would need a seventh, eighth and ninth export to say nothing more.
  'list-bullet', 'list-ordered', 'indent', 'outdent', 'link', 'unlink',

  // A deliberate roster line, added before the export could be ingested —
  // `icons:sync` skips a file whose name it does not already know, so a new
  // glyph is always a decision here first and a file second.
  //
  // The source carried a <clipPath> wrapping a full-bounds 16x16 <rect>. It
  // clips nothing on a 16 viewBox, and sync rejects <rect> outright because a
  // rect has no `d` — so it was dropped on the way in. Lossless, and it leaves
  // the export as the one path §5.5 asks for.
  'integration',

  // Two settings-group glyphs, authored NON-SQUARE — 15x16 and 12x16 — which is
  // fine and needs no normalising: `IconGeometry.viewBox` carries each glyph's
  // own box and `Icon` renders it instead of assuming 16, so they letterbox
  // centred in the square slot rather than sitting off to one side.
  //
  // Distinct roster names rather than replacing `admin` and `edit`: those two
  // are used elsewhere, and overwriting a shared glyph to suit one screen is how
  // an icon set stops meaning anything.
  'organization', 'customization',

  // Square 16, and authored as TWO paths — the bolt and the rounded frame.
  // `icons:sync` merges them into one `d` per §5.5's one-node-one-fill rule;
  // the frame is drawn as an outline (outer ring then inner, wound the other
  // way) so the nonzero fill still leaves it hollow after the merge.
  'automation',

  // Two more from the settings artwork. `online-payment` is the card glyph on the
  // Payments group — NOT a replacement for `bank`, which is the account/branch
  // idea and is used elsewhere. `general` is the ruled-document glyph.
  //
  // The other four exports in this batch — inventory, purchases, custom-modules
  // and sales — are REPLACEMENTS rather than additions: same names, newer
  // artwork, overwritten in design-refs/icons/. That reaches further than this
  // page, because Nav renders sales, purchases and inventory too. Intended: one
  // set, refreshed together.
  'online-payment', 'general',

  // A HEAVIER chevron, and a separate roster name rather than a `weight` prop on
  // `Icon`. zf-icons.md fixes the set at one stroke — 1.25, round cap and join —
  // and the whole value of that rule is that a hairline glyph never sits beside
  // a chunky one. A prop would let any caller opt out of it silently.
  //
  // The system already has this exact shape: `caret-down-bold` is the roster's
  // THIRD down-pointing glyph, and CLAUDE.md defends it as "not duplication,
  // because the three are different weight classes". This is that, for the
  // chevron.
  //
  // Used where the chevron is an AFFORDANCE rather than a label's companion —
  // the arrow revealed on a settings row, which has to read at a glance from
  // across the row. Do not reach for it beside text; that is what
  // `chevron-right` is for.
  'chevron-right-bold',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * Named in an earlier draft and REMOVED, because md §12.1 records them as two
 * icons that do not exist — they were listed in a stale Figma documentation
 * frame that had never been regenerated, alongside "ICONS 4" and a 2px stroke.
 *
 * Kept here rather than deleted silently: `eye` is the obvious glyph for a
 * password reveal and someone will reach for it. It has to be drawn first.
 */
export const RETIRED_ICON_NAMES = ['eye'] as const;

/**
 * THE NINE GLYPHS THE MD NEVER NAMES.
 *
 * All nine exist — an SVG was exported for every one, which is stronger evidence
 * than a mention would have been. What is missing is not the glyph but the
 * MEASUREMENT: `zf-icons.md` §3.1 lists which icons are stroked and at what
 * weight, and it has no row for any of these. So for these nine, and only these
 * nine, `icons:sync` cannot check a dropped export against the design — it
 * reports what it found instead of verifying it.
 *
 * Six of the nine were already in this roster before the md arrived, which is why
 * they were carried as unconfirmed. The other three — `bank`, `reports`,
 * `sparkle` — the roster did not know about at all, and `icons:sync` refused them
 * until they were added here. That is the rule working: the roster is the
 * contract, not a side effect of a file appearing in a folder.
 *
 * Worth a re-measure of the Figma page so §3.1 covers all 47 rather than 38.
 */
export const ICONS_ABSENT_FROM_MD = [
  'attach', 'more', 'table-config', 'build', 'users', 'bell',
  'bank', 'reports', 'sparkle',
] as const;

export interface IconGeometry {
  /** SVG path data. */
  d: string;
  /**
   * The glyph's own viewBox. Omitted for the 16 x 16 slot md §1.7 authors ZF
   * glyphs at, which is the default.
   *
   * Carried per glyph rather than assumed, because a replacement icon set is
   * almost never drawn at 16 — Lucide and Heroicons are 24. The rendered size
   * comes from the slot token either way; the viewBox only decides how the
   * glyph's own coordinates map into it, so getting it wrong crops or shrinks
   * the drawing rather than resizing it.
   */
  viewBox?: string;
  /**
   * Stroked glyphs need `strokeWidth`; filled ones omit it.
   *
   * md open item 36 / defect 6 is still the only thing left open on the icon
   * page, and it has a measurement behind it: `SCALE` scales a vector's geometry
   * but NOT its `strokeWeight`, so a stroked glyph in an 80px slot draws 80px of
   * path at a 16px weight and reads as a hairline. Filled glyphs survive intact.
   * 34 filled / 17 stroked in Figma. New glyphs should be filled.
   */
  strokeWidth?: number;
}

/**
 * ONE STROKE WEIGHT, and it is 1.25 — md defect 4, fixed in Figma 2026-08-20.
 *
 * The set carried four weights: 1.2 (ten icons), 1.25 (arrow-right, upload),
 * 1.5 (chevron) and 2.2857 (search — which is 16 / 7, the fingerprint of a glyph
 * authored in a 7px box and scaled up).
 *
 * 1.25 won on instance count: `upload` has 542 instances across the file and
 * `chevron` has 312, so 1.25 leaves the most-used icon untouched and moves the
 * ten at 1.2 by 0.05px, which is invisible. The md's own first draft picked 1.5
 * believing chevron was the most-instanced, and measurement reversed it.
 *
 * Round cap AND round join, on all 17.
 */
export const ICON_STROKE_WEIGHT = 1.25;

/**
 * The 17 stroked glyphs, per md §3.1. Recorded so `npm run icons:sync` can check
 * a dropped SVG against what Figma says it should be — a filled export landing on
 * a stroked name (or the reverse) means the wrong glyph was exported.
 */
export const STROKED_ICONS = [
  'alert-circle', 'alert-triangle', 'board-view', 'card-view', 'check-circle',
  'info', 'list-view', 'plus-circle', 'table-view', 'x-circle',
  'arrow-right', 'upload', 'search',
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
] as const;

/*
 * The chevron is DERIVED, not invented — the one glyph the md specifies
 * precisely enough to reconstruct. §1.7.1 gives a square corner, round cap and
 * join, rotated 45 degrees per direction; §2.23.10 fixes it at a 6x6 corner.
 *
 * A 6px leg at 45 degrees projects 6 / sqrt(2) = 4.2426 on each axis, so with
 * the stroke now at 1.25 it renders 5.4926 x 9.7352. (At the old 1.5 it was
 * 5.7426 x 9.9853, which is the figure §2.23.10 prints — the numbers below are
 * the PATH, which the stroke change does not move.)
 *
 * Superseded the moment a real chevron SVG lands: generatedPaths is spread last.
 */
/** The bold chevron's stroke. Named, so it cannot be read as a stray literal. */
const CHEVRON_BOLD_WEIGHT = 2;

const CHEVRON = {
  right: 'M 5.879 3.757 L 10.121 8 L 5.879 12.243',
  left: 'M 10.121 3.757 L 5.879 8 L 10.121 12.243',
  down: 'M 3.757 5.879 L 8 10.121 L 12.243 5.879',
  up: 'M 3.757 10.121 L 8 5.879 L 12.243 10.121',
} as const;

/*
 * `mail` and `print` were DERIVED here from zf-action-bar.md §3.6's authored
 * path data while no export existed. Both are gone: the real exports landed and
 * they are FILLED outlines, not 1.25px strokes — which is the correction the
 * design owner flagged against §3.6 in the first place.
 *
 * Two sources for one glyph is worse than a placeholder. A derived path kept
 * "as a fallback" behind a real export is a second definition nobody looks at,
 * and it comes back silently the day the SVG is renamed.
 *
 * The chevron stays, because no chevron export exists.
 */
const derivedPaths: Partial<Record<IconName, IconGeometry>> = {
  'chevron-down': { d: CHEVRON.down, strokeWidth: ICON_STROKE_WEIGHT },
  'chevron-up': { d: CHEVRON.up, strokeWidth: ICON_STROKE_WEIGHT },
  'chevron-left': { d: CHEVRON.left, strokeWidth: ICON_STROKE_WEIGHT },
  'chevron-right': { d: CHEVRON.right, strokeWidth: ICON_STROKE_WEIGHT },
  //  Same PATH, heavier stroke. 2 against the house 1.25 — the ratio
  //  `caret-down-bold` carries over `caret-down`, and enough to read as a
  //  different weight class rather than as a rendering wobble.
  'chevron-right-bold': { d: CHEVRON.right, strokeWidth: CHEVRON_BOLD_WEIGHT },
  //  Stroked at the house weight, on the 16 grid: a rounded body, the header
  //  rule and two binding rings. Local to the role access app (v2).
  calendar: {
    d: 'M3.5 3.5H12.5C13.0523 3.5 13.5 3.94772 13.5 4.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V4.5C2.5 3.94772 2.94772 3.5 3.5 3.5Z M2.5 6.5H13.5 M5.5 2.25V4.5 M10.5 2.25V4.5',
    strokeWidth: ICON_STROKE_WEIGHT,
  },
};

/**
 * Partial by design — an absent key is an unexported glyph, and `Icon` renders a
 * placeholder for it. Do not add a key with invented geometry to silence the
 * placeholder; the placeholder IS the tracking mechanism.
 *
 * A real export always beats the derived chevron, hence the spread order.
 */
export const iconPaths: Partial<Record<IconName, IconGeometry>> = {
  ...derivedPaths,
  ...(generatedPaths as Partial<Record<IconName, IconGeometry>>),
};

/** Names still awaiting a Figma export. Surfaced in the canon under Foundations/Icons. */
export const unexportedIcons = ICON_NAMES.filter((n) => !iconPaths[n]);

/**
 * Geometry that arrived under a name the roster does not have. The generator
 * refuses to emit these, so this should always be empty — it exists so that a
 * stale generated file cannot go unnoticed.
 */
export const unknownGeneratedIcons = Object.keys(generatedPaths)
  .filter((n) => !(ICON_NAMES as readonly string[]).includes(n));
