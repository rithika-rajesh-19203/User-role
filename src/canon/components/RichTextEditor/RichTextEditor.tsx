import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * RICH TEXT EDITOR — a formatted block of prose the user authors.
 *
 * Bold, italic, underline, two list kinds, indent and links. There is NO
 * block-format select: the design owner cut it, and a paragraph is what the
 * body already is. If headings are ever wanted here they come back as their
 * own toolbar group, not as a dropdown that has to be read back off the
 * document with `queryCommandValue` — which not every engine answers.
 *
 * ── THE ENGINE, AND WHY IT IS BEHIND A `value` / `onChange` API ──────────────
 * `contenteditable` driven by `document.execCommand`. `execCommand` is
 * deprecated on paper and implemented by every shipping browser, and it is the
 * only route to bold/italic/lists that costs no dependency. The alternative —
 * TipTap, Lexical, ProseMirror — is 90–150kB and a schema, which is a decision
 * about the product rather than about this component.
 *
 * So the surface is deliberately the same as `Textarea`'s: an HTML string in,
 * an HTML string out, `maxLength` counted in characters. Nothing above this
 * component knows what is driving it, and replacing the engine later touches
 * this file and no other.
 *
 * ── THE CARET PROBLEM ────────────────────────────────────────────────────────
 * A controlled `contenteditable` is not a controlled `<input>`. Writing
 * `innerHTML` on every render puts the caret back at position 0 on every
 * keystroke, so the user types their sentence backwards from the start. The DOM
 * is therefore written to ONLY when the incoming `value` differs from what the
 * element already holds — i.e. when the change came from outside, not from
 * typing. `useLayoutEffect` is wrong here for the same reason; the effect must
 * not run against the user's own edit at all.
 *
 * ── BOLD, ITALIC AND UNDERLINE ARE LETTERFORMS, NOT ICONS ────────────────────
 * They are drawn as a bold **B**, an italic *I* and an underlined U, because the
 * control is a sample of what it does — every editor does this, and it is the
 * one place where showing the effect is cheaper and clearer than drawing a
 * picture of it. The remaining six (`list-bullet`, `list-ordered`, `indent`,
 * `outdent`, `link`, `unlink`) are on the icon roster with no geometry yet, so
 * they render the dashed placeholder until the exports land. That placeholder is
 * the tracking mechanism and is not to be silenced by borrowing a glyph that
 * happens to rhyme.
 *
 * ── ACCESSIBILITY ────────────────────────────────────────────────────────────
 * · The body is `role="textbox" aria-multiline="true"` and takes `aria-label`
 *   or the `id` a `Field` label points at.
 * · Every toolbar control is a real `<button>` with `aria-pressed`, so its state
 *   is announced rather than only painted. The state is read back from
 *   `queryCommandState` on every selection change, not tracked locally — local
 *   state would drift the moment the caret moved into text that was already bold.
 * · The toolbar is a `role="toolbar"`, so a screen reader announces the group
 *   rather than eleven loose buttons.
 * · The counter is `aria-live="polite"` only within 10% of the limit. A counter
 *   announced on every keystroke is unusable.
 */

/** One formatting command. `state` is read back from the document, never stored. */
interface Cmd {
  id: string;
  label: string;
  command: string;
  value?: string;
  icon?: IconName;
  /** Rendered instead of an icon — the B / I / U letterforms. */
  glyph?: ReactNode;
  /** A one-shot action (link, unlink) rather than a toggle. */
  action?: boolean;
}


//  Grouped, and the groups are what the rules between them mark.
const GROUPS: Cmd[][] = [
  [
    { id: 'bold', label: 'Bold', command: 'bold', glyph: <span className="font-bold">B</span> },
    { id: 'italic', label: 'Italic', command: 'italic', glyph: <span className="italic font-medium">I</span> },
    { id: 'underline', label: 'Underline', command: 'underline', glyph: <span className="underline font-medium">U</span> },
  ],
  [
    { id: 'ul', label: 'Bulleted list', command: 'insertUnorderedList', icon: 'list-bullet' },
    { id: 'ol', label: 'Numbered list', command: 'insertOrderedList', icon: 'list-ordered' },
  ],
  [
    { id: 'indent', label: 'Increase indent', command: 'indent', icon: 'indent', action: true },
    { id: 'outdent', label: 'Decrease indent', command: 'outdent', icon: 'outdent', action: true },
  ],
  [
    { id: 'link', label: 'Insert link', command: 'createLink', icon: 'link', action: true },
    { id: 'unlink', label: 'Remove link', command: 'unlink', icon: 'unlink', action: true },
  ],
];

export interface RichTextEditorProps {
  /** The HTML. Controlled. */
  value: string;
  onChange: (html: string) => void;
  /** Counted in CHARACTERS of visible text, not bytes of HTML. */
  maxLength?: number;
  /** Show `used / maxLength` under the body. Requires `maxLength`. */
  counter?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Rows of body text before it scrolls. The frame does not grow without bound. */
  rows?: number;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export function RichTextEditor({
  value, onChange, maxLength, counter, placeholder, disabled, rows = 10,
  id, className, ...aria
}: RichTextEditorProps) {
  const auto = useId();
  const bodyId = id ?? auto;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [empty, setEmpty] = useState(!value);

  //  ONLY when the change came from outside. See the caret note in the header.
  useEffect(() => {
    const el = bodyRef.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
    setEmpty(!(el?.textContent ?? '').trim());
  }, [value]);

  //  Read the formatting state back OFF the document. Tracking it locally drifts
  //  the moment the caret moves into text that is already bold — the button
  //  would say "not bold" while the next keystroke comes out bold.
  const syncState = useCallback(() => {
    const el = bodyRef.current;
    if (!el || !el.contains(document.getSelection()?.anchorNode ?? null)) return;
    const next: Record<string, boolean> = {};
    for (const group of GROUPS) {
      for (const c of group) {
        if (c.action) continue;
        try { next[c.id] = document.queryCommandState(c.command); } catch { next[c.id] = false; }
      }
    }
    setActive(next);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', syncState);
    return () => document.removeEventListener('selectionchange', syncState);
  }, [syncState]);

  const emit = () => {
    const el = bodyRef.current;
    if (!el) return;
    setEmpty(!(el.textContent ?? '').trim());
    onChange(el.innerHTML);
  };

  const run = (command: string, arg?: string) => {
    if (disabled) return;
    //  Focus FIRST. `execCommand` operates on the document selection, and a
    //  toolbar click has already moved focus to the button — without this the
    //  command applies to nothing and looks like a dead control.
    bodyRef.current?.focus();
    try { document.execCommand(command, false, arg); } catch { /* unsupported: no-op */ }
    emit();
    syncState();
  };

  const used = (bodyRef.current?.textContent ?? '').length;
  const near = maxLength !== undefined && used >= maxLength * 0.9;

  const TOOL_BTN = cn(
    'grid place-items-center size-16 flex-none rounded-sm border-0 cursor-pointer',
    'text-body text-icon-default bg-transparent',
    'hover:bg-surface-hover hover:text-text-default',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
    'disabled:cursor-not-allowed disabled:text-icon-disabled disabled:bg-transparent',
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className={cn(
          'flex flex-col rounded-md border border-border-default overflow-hidden',
          'bg-surface-default',
          //  Same two signals as every other control: border on any focus, ring
          //  on keyboard focus only.
          'focus-within:border-focus-ring',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring',
          disabled && 'bg-surface-disabled border-border-disabled',
        )}
      >
        {/* ── THE TOOLBAR ─────────────────────────────────────────────────── */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          aria-controls={bodyId}
          className={cn(
            'flex items-center gap-4 flex-wrap px-5 py-4',
            'bg-surface-sunken border-b border-border-divider',
          )}
        >
          {GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-2 flex-none">
              {/*  A rule BETWEEN groups, so never before the first — with the
                   block-format select gone, group 0 now starts the row and a
                   leading rule would hang off the toolbar's left edge.
                   `border/divider` at 1.20:1 is decorative and exempt from
                   1.4.11; the gap carries the grouping either way. */}
              {gi > 0 ? (
                <span aria-hidden className="w-px h-12 mx-3 bg-border-divider" />
              ) : null}
              {group.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={disabled}
                  title={c.label}
                  aria-label={c.label}
                  //  Toggles report state; one-shot actions must NOT — an
                  //  `aria-pressed="false"` on "Insert link" claims it is a
                  //  switch that is currently off, which is a lie about the
                  //  control.
                  aria-pressed={c.action ? undefined : Boolean(active[c.id])}
                  onClick={() => {
                    if (c.command === 'createLink') {
                      const href = window.prompt('Link address');
                      if (href) run('createLink', href);
                      return;
                    }
                    run(c.command, c.value);
                  }}
                  className={cn(
                    TOOL_BTN,
                    //  The pressed fill is `primary/subtle` + `primary/text`, not
                    //  `primary/default`: this box is about to hold a letterform,
                    //  and `primary/default` under white is 4.32:1 — under 1.4.3.
                    !c.action && active[c.id] && 'bg-primary-subtle text-primary-text',
                  )}
                >
                  {c.glyph ?? <Icon name={c.icon as IconName} size="sm" tone="inherit" />}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── THE BODY ────────────────────────────────────────────────────── */}
        <div className="relative">
          {/*  The placeholder is a sibling, not `::before` on the editable
               element: content generated on a `contenteditable` gets selected,
               copied and sometimes typed into. `pointer-events-none` keeps the
               click going through to the text. */}
          {empty && placeholder ? (
            <span
              aria-hidden
              className="absolute inset-x-10 top-8 pointer-events-none text-body text-text-placeholder"
            >
              {placeholder}
            </span>
          ) : null}

          <div
            id={bodyId}
            ref={bodyRef}
            role="textbox"
            aria-multiline="true"
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={emit}
            onBlur={emit}
            onKeyUp={syncState}
            onMouseUp={syncState}
            onBeforeInput={(e) => {
              //  Enforce the limit at the INPUT, not after the fact. Truncating
              //  in `onChange` would fight the caret, and letting it overflow
              //  makes the counter a description of a rule nothing enforces.
              //  Deletions and formatting carry no `data`, so they always pass.
              if (maxLength === undefined) return;
              const adding = (e as unknown as { data?: string }).data?.length ?? 0;
              if (!adding) return;
              const sel = document.getSelection();
              const replacing = sel && !sel.isCollapsed ? sel.toString().length : 0;
              const now = (bodyRef.current?.textContent ?? '').length;
              if (now - replacing + adding > maxLength) e.preventDefault();
            }}
            className={cn(
              'px-10 py-8 outline-none overflow-y-auto',
              'text-body text-text-default',
              //  A list inside a `contenteditable` has to be re-taught its
              //  markers: the reset drops them, and `execCommand` emits real
              //  `<ul>`/`<ol>` that would otherwise render as bare paragraphs.
              '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-12 [&_ol]:ps-12',
              '[&_p]:m-0 [&_p+p]:mt-6 [&_blockquote]:border-s-2 [&_blockquote]:border-border-strong',
              '[&_blockquote]:ps-6 [&_blockquote]:m-0 [&_a]:text-text-link [&_a]:underline',
              disabled && 'cursor-not-allowed text-text-disabled',
            )}
            style={{ minHeight: `calc(${rows} * var(--zf-text-body-line-height))` }}
            {...aria}
          />

          {counter && maxLength !== undefined ? (
            <div className="flex justify-end px-10 pb-6">
              <Text size="body-sm" tone={near ? 'danger' : 'tertiary'}>
                {used} / {maxLength}
              </Text>
            </div>
          ) : null}
        </div>
      </div>

      {/*  Announced only near the limit. On every keystroke it is noise that
           makes the field unusable with a screen reader. */}
      <span role="status" aria-live="polite" className="sr-only">
        {near && maxLength !== undefined ? `${maxLength - used} characters remaining` : ''}
      </span>
    </div>
  );
}
