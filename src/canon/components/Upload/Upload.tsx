import { useId, useRef, useState } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import { Icon } from '../../icons';
import { Progress } from '../Progress/Progress';
import { SplitButton } from '../SplitButton/SplitButton';
import { Inline, Stack, Text } from '../../primitives';
import type { MenuEntry } from '../Menu/Menu';
import { cn } from '../../utils/cn';

/**
 * UPLOAD — a file drop zone, a source picker and the list of what landed.
 * ZF-UPLOAD.md.
 *
 * ── THE DROP TARGET IS NEVER THE ONLY WAY IN ─────────────────────────────────
 * §1.1, and it decides the whole architecture. Pointer drag has no keyboard
 * equivalent — not a poor one, *none*. So the **trigger button is the primary
 * path**, driving a real `<input type="file">`, and the drop zone is a
 * convenience layered on top. A `<div>` with `onDrop` and a click handler is
 * unusable by keyboard and by screen reader, and *"it will pass a casual review
 * because it works fine with a mouse."*
 *
 * ── THE FOUR DRAG BUGS (§8) ──────────────────────────────────────────────────
 * 1. `preventDefault` on **`dragover` AND `dragenter`**. The browser's default
 *    for a dropped file is to navigate to it; without it on `dragover`, `drop`
 *    never fires at all and the zone silently does nothing.
 * 2. `dragleave` fires crossing out of EVERY descendant — the hint, the button.
 *    A bare `setOver(false)` makes the zone strobe as the pointer moves down the
 *    content, so this keeps a depth counter. (`pointer-events: none` on the
 *    children is the other fix and it is worse: it kills the trigger.)
 * 3. Only react to a drag carrying files. Dragging selected text fires the same
 *    events. And during `dragenter`/`dragover` the file list is NOT readable for
 *    security — `types` is all you get, so size and type validation cannot
 *    happen until `drop`.
 * 4. The zone's click must skip clicks that landed on a control, or the button
 *    opens the picker twice and the second call is swallowed as a non-user
 *    gesture, which looks random.
 *
 * ── WHERE A REJECTION GOES (§9.2) ────────────────────────────────────────────
 * A file over the cap never becomes a row. It has no id, no progress and nothing
 * to retry — retrying would just re-reject it. So a client rejection puts the
 * ZONE in `error`, and only a failure in flight becomes a row with a retry.
 * Conflating them gives a list of rows the user can only delete and a retry
 * button that does nothing.
 *
 * ── DISABLED IS ALMOST INVISIBLE, AND THAT IS NOT THIS COMPONENT'S FAULT ─────
 * Verified against our own tokens, both of §10.1's facts hold exactly:
 * `border/disabled` on `surface/disabled` is **1.06:1**, and `surface/disabled`
 * is the SAME VALUE as `surface/sunken` in both modes — so the disabled fill is
 * pixel-identical to the rest fill. The border is therefore `border/strong`, and
 * even that is only **1.52:1**, under the 3:1 non-text threshold. Open item 49;
 * not fixable inside this component.
 */

export type UploadFileState = 'queued' | 'uploading' | 'complete' | 'error';

export interface UploadFile {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  state: UploadFileState;
  /** Bytes sent so far, while uploading. */
  sent?: number;
  /** Why it failed — shown in `danger/text` on the meta line. */
  error?: string;
  /** "PDF", "PNG" — shown on `complete`. */
  kind?: string;
}

export interface UploadProps {
  title?: string;
  hint?: string;
  /** Maps straight to `input[accept]`. */
  accept?: string;
  multiple?: boolean;
  /** Bytes. A file over this is rejected to the ZONE, never to the list. */
  maxSize?: number;
  /** `compact` once files are listed — a 280px zone is dead space by then. */
  size?: 'default' | 'compact';
  disabled?: boolean;
  files: UploadFile[];
  /**
   * Extra rows on the trigger's caret menu — an in-app document store, a cloud
   * provider. "From My Desktop" is always first and is supplied here.
   */
  sources?: MenuEntry[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  className?: string;
}

type ZoneState = 'rest' | 'drag-over' | 'disabled' | 'error';

const ZONE: Record<ZoneState, string> = {
  //  Dashed `primary/default`. §5: ship `border: 1px dashed` and let the UA pick
  //  the pattern — Chromium's 1px dashed is within a pixel of the mock's 3-3, and
  //  the SVG technique that guarantees it hard-codes the stroke colour, so it
  //  cannot theme. The token has to stay on `border-color`.
  //
  //  `surface/sunken` and not the mock's #FAFAFD, which is 1.04:1 on white — on a
  //  white card that fill would do nothing at all.
  rest: cn('bg-surface-sunken border-primary-default',
    'hover:bg-surface-pressed hover:border-primary-hover'),
  //  SOLID here, plus a 3px halo. The halo is a ring, not an elevation — the
  //  census stays at three tiers.
  'drag-over': 'bg-primary-subtle border-solid border-primary-default shadow-upload-halo',
  //  `border/strong`, NOT `border/disabled` — see the header.
  disabled: 'bg-surface-disabled border-border-strong cursor-not-allowed',
  error: 'bg-danger-subtle border-danger-border',
};

const BADGE_TONE: Record<ZoneState, string> = {
  rest: 'text-primary-default',
  'drag-over': 'text-primary-default',
  disabled: 'text-icon-disabled',
  error: 'text-danger-default',
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export function Upload({
  title = 'Drag & drop files to upload',
  hint = 'or choose a source below',
  accept, multiple = true, maxSize,
  size = 'default', disabled, files, sources,
  onAdd, onRemove, onRetry, onCancel, className,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  //  §8.2 — a COUNTER, not a flag. `dragleave` fires on every descendant
  //  boundary, so a bare reset strobes the zone as the pointer crosses the hint.
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const errorId = useId();

  const state: ZoneState = disabled ? 'disabled'
    : over ? 'drag-over'
      : rejected ? 'error' : 'rest';

  //  §8.3 — during a drag the file list is unreadable for security. `types` is
  //  the only thing available, so nothing can be validated before `drop`.
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files');

  const take = (list: File[]) => {
    const ok: File[] = [];
    for (const f of list) {
      if (maxSize && f.size > maxSize) {
        setRejected(`${f.name} is larger than ${formatBytes(maxSize)}`);
        continue;
      }
      ok.push(f);
    }
    //  §7 — `error` is TRANSIENT. It clears on the next successful add, because
    //  "a zone stuck in red because of a file the user already gave up on is
    //  worse than no message".
    if (ok.length) { setRejected(null); onAdd(ok); }
  };

  const open = () => inputRef.current?.click();

  const compact = size === 'compact';

  return (
    <Stack gap={0} className={className}>
      <div
        //  §14.4 — `relative` is load-bearing, not tidiness. The clip-hidden
        //  input is `absolute`, and with no positioned ancestor its containing
        //  block is the INITIAL containing block. On a flat page the static
        //  position happens to land it inside the zone, which is why it survives
        //  review; put the zone in a scroll container — which §3.1 explicitly
        //  invites — and the input stays pinned while the zone moves away. At
        //  scrollTop 800 the md measured it 939px outside. Browsers scroll a
        //  focused element into view, so focusing it would jump the page.
        className={cn(
          'relative grid place-items-center box-border w-full',
          'px-12 border border-dashed rounded-md transition-colors',
          'motion-reduce:transition-none',
          //  §3.1 — a FLOOR plus padding, never a hard height. 420 is the mock's
          //  canvas, not a measurement.
          compact
            ? cn('py-8', rejected ? 'min-h-upload-zone-compact-error' : 'min-h-upload-zone-compact')
            : 'py-20 min-h-upload-zone',
          ZONE[state],
          !disabled && 'cursor-pointer',
        )}
        //  §8.4 — a click that landed on the trigger must not also reach here,
        //  or the picker opens twice and the second call is swallowed.
        onClick={(e: MouseEvent) => {
          if (disabled) return;
          if ((e.target as HTMLElement).closest('button, a, input, label')) return;
          open();
        }}
        onDragEnter={(e) => {
          if (disabled || !hasFiles(e)) return;
          e.preventDefault();
          depth.current += 1;
          setOver(true);
        }}
        onDragOver={(e) => {
          //  THE ONE THAT MATTERS. Without preventDefault here, `drop` never
          //  fires and the zone silently does nothing.
          if (disabled || !hasFiles(e)) return;
          e.preventDefault();
        }}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) { depth.current = 0; setOver(false); }
        }}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          depth.current = 0;
          setOver(false);
          take(Array.from(e.dataTransfer.files));
        }}
      >
        {/*  §10.2 — CLIPPED, never `display:none` and never `hidden`: both remove
             it from the tab order AND the accessibility tree, and `opacity:0;
             width:0` leaves a zero-size target some browsers skip.

             `tabIndex={-1}` with the button driving it, because a visually
             hidden input that takes focus shows focus NOWHERE on screen. The
             button is what users tab to; the input is plumbing. */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          aria-describedby={rejected ? errorId : undefined}
          //  `sr-only` IS §10.2's recipe — absolute, 1px, clipped, `-m-px`,
          //  `white-space: nowrap`, no border. Spelling it out by hand risked a
          //  class that does not exist failing silently, which is how the
          //  clipping quietly stops happening and the input renders at 1px in
          //  the corner of the zone.
          className="sr-only"
          onChange={(e) => {
            take(Array.from(e.target.files ?? []));
            //  §13.1 — without this, picking the SAME file twice in a row fires
            //  no change event the second time: the value has not changed, so
            //  nothing happens and the UI looks frozen.
            e.target.value = '';
          }}
        />

        <Stack gap={0} align="center" className="max-w-upload-content text-center">
          <div
            aria-hidden
            className={cn(
              //  `box-border` — it has a border, and without this it renders 50
              //  rather than 48.
              'box-border grid place-items-center rounded-full',
              'bg-surface-default border border-border-divider',
              BADGE_TONE[state],
              compact ? 'size-20 mb-6' : 'size-upload-badge mb-10',
            )}
          >
            {/*  20, from the `lg` slot. The mock's 13.48 x 16 is a path
                 measurement — ZF icons are set by box, not by path. */}
            <Icon name="arrow-up" size="lg" tone="inherit" />
          </div>

          <Text size={compact ? 'subheading' : 'heading'} weight="medium" tone={disabled ? 'disabled' : 'default'}>
            {title}
          </Text>
          <Text size="body" tone={disabled ? 'disabled' : 'secondary'} className="mt-2">
            {hint}
          </Text>

          {/*  §9.2's home for a client rejection, and `role="alert"` so it is
               read when it appears rather than only when focus reaches it. */}
          {rejected ? (
            <Text id={errorId} role="alert" size="body-sm" tone="danger" className="mt-3">
              {rejected}
            </Text>
          ) : null}

          <div className={compact ? 'mt-6' : 'mt-10'}>
            <SplitButton
              icon="upload"
              emphasis="primary"
              disabled={disabled}
              onSelect={open}
              entries={[
                { id: 'desktop', label: 'From My Desktop', onSelect: open },
                ...(sources ?? []),
              ]}
            >
              Upload Files
            </SplitButton>
          </div>
        </Stack>
      </div>

      {files.length > 0 ? (
        <UploadList
          files={files}
          onRemove={onRemove}
          onRetry={onRetry}
          onCancel={onCancel}
        />
      ) : null}
    </Stack>
  );
}

/**
 * The list. §9.3 — a real `<ul>`/`<li>`, which gives a screen reader the count
 * for free ("list, 3 items") — exactly what the visual head duplicates.
 *
 * Not exported: it is only ever rendered by `Upload`, and an export with no
 * second caller is an API surface with no reader.
 */
function UploadList({ files, onRemove, onRetry, onCancel }: {
  files: UploadFile[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <Stack gap={4} className="mt-8">
      <Inline gap={4} align="center">
        <Text size="body" weight="medium">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </Text>
        <button
          type="button"
          onClick={() => files.forEach((f) => onRemove(f.id))}
          className={cn(
            'ms-auto p-0 border-0 bg-transparent cursor-pointer rounded-sm',
            'text-body text-primary-text hover:underline',
            'focus-visible:underline',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
        >
          Remove all
        </button>
      </Inline>

      {/*  §14.1 — `grid-cols-1` is LOAD-BEARING and comes FIRST. Without an
           explicit track the implicit column is sized to the row's min-content
           contribution, the row is never squeezed, and every `min-w-0` below is
           dead code that reads as if it were working. The md measured it: a
           78-character filename gave a 682.58px row inside a 680px list, with
           `scrollWidth === clientWidth` — no ellipsis — and deleting the
           `min-inline-size: 0` produced a byte-identical result. */}
      <ul aria-label="Selected files" className="grid grid-cols-1 gap-4 m-0 p-0 list-none">
        {files.map((f) => <UploadRow key={f.id} file={f} {...{ onRemove, onRetry, onCancel }} />)}
      </ul>
    </Stack>
  );
}

/** One file. 56 tall in EVERY state — the bar lives inside the 16px meta band. */
function UploadRow({ file, onRemove, onRetry, onCancel }: {
  file: UploadFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const uploading = file.state === 'uploading';
  const failed = file.state === 'error';
  const pct = file.sent && file.size ? Math.round((file.sent / file.size) * 100) : 0;

  const meta = uploading ? `${formatBytes(file.sent ?? 0)} of ${formatBytes(file.size)} · ${pct}%`
    : file.state === 'queued' ? 'Waiting to upload…'
      : failed ? (file.error ?? 'Upload failed')
        : `${formatBytes(file.size)}${file.kind ? ` · ${file.kind}` : ''}`;

  const ICON_BTN = cn(
    'grid place-items-center size-12 flex-none p-0 border-0 rounded-sm bg-transparent cursor-pointer',
    'text-icon-default hover:text-text-default',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
  );

  return (
    <li
      className={cn(
        'flex items-center gap-6 box-border h-upload-row px-6',
        'bg-surface-default border rounded-md',
        failed ? 'border-danger-border' : 'border-border-default',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid place-items-center flex-none size-16 rounded-md',
          failed ? 'bg-danger-subtle text-danger-default' : 'bg-surface-sunken text-icon-default',
        )}
      >
        <Icon name="documents" size="md" tone="inherit" />
      </span>

      {/*  §14.1 — a flex item's default `min-width` is `auto`, its content size,
           so a long filename pushes the trailing buttons off the row instead of
           truncating. */}
      <div className="flex-1 min-w-0">
        {/*  §14.2 — truncated text has no tooltip of its own, and `title` is the
             only way a user ever sees the full filename. */}
        <Text size="body" weight="medium" title={file.name} className="block truncate">
          {file.name}
        </Text>

        {/*  §14.5 — the band clamps and hides, because the bar is the only
             shrinkable item in it and absorbs the whole cost of a long percent
             string. Measured: at 120 characters — which a localized byte string
             reaches — the bar hit 0 and 140px of text sat outside the row,
             unclipped, with the row height still a perfect 56. */}
        <div className="flex items-center gap-4 h-8 mt-2 min-w-0 overflow-hidden">
          {uploading ? (
            <>
              <Progress value={pct} label={`Uploading ${file.name}`} />
              <Text size="body-sm" tone="secondary" className="flex-initial min-w-0 truncate">
                {meta}
              </Text>
            </>
          ) : (
            <Text size="body-sm" tone={failed ? 'danger' : 'secondary'} className="truncate">
              {meta}
            </Text>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
        {/*  DECORATIVE, and `aria-hidden` rather than a control: the same fact is
             already in the meta text. Only retry and remove are buttons. */}
        {file.state === 'complete' ? (
          <span data-zf-upload-ok className="grid place-items-center size-8 text-success-default">
            <Icon name="check-circle" size="md" tone="inherit" />
          </span>
        ) : null}

        {failed ? (
          <button
            type="button"
            onClick={() => onRetry(file.id)}
            aria-label={`Retry ${file.name}`}
            className={cn(ICON_BTN, 'text-primary-default hover:text-primary-hover')}
          >
            <Icon name="refresh" size="md" tone="inherit" />
          </button>
        ) : null}

        {/*  §10 — every row action names its FILE. "Remove" alone, eight times
             down a list, tells a screen-reader user nothing. */}
        <button
          type="button"
          onClick={() => (uploading ? onCancel(file.id) : onRemove(file.id))}
          aria-label={`${uploading ? 'Cancel' : 'Remove'} ${file.name}`}
          className={ICON_BTN}
        >
          <Icon name="close" size="md" tone="inherit" />
        </button>
      </div>
    </li>
  );
}
