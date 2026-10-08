import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Divider, Icon, InputField, Inline, Menu, Stack, Text } from "@canon";
import type { IconName, MenuEntry } from "@canon";

/**
 * Shared composition for the role screens. Nothing here styles anything — each
 * part is canon primitives arranged the same way on every screen, so the five
 * screens cannot drift apart.
 */

/**
 * The scrolling body. `SettingsShell` insets the body 20 from the start edge and
 * 20 from the header rule, but on neither of the other two sides — so without
 * the matching end and bottom inset a card runs into the panel's right edge and
 * the last row sits on its bottom one. Recorded as a canon gap.
 */
export function PageBody({ children, gap = 12 }: { children: ReactNode; gap?: 8 | 10 | 12 | 16 }) {
  return (
    <Stack gap={gap} className="pe-10 pb-10">
      {children}
    </Stack>
  );
}

/**
 * The Save / Cancel row for the `footer` slot. The same geometry `CreatePage`
 * gives its own footer — 72 tall, 20 inline, a rule across the top — which
 * `CreatePage` cannot supply here because it also brings a second scroller.
 */
export function FormFooter({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <Stack gap={0}>
      <Divider />
      <Inline gap={5} justify="between" className="h-create-footer px-10">
        <Inline gap={5}>{children}</Inline>
        {trailing ? <Inline gap={5}>{trailing}</Inline> : null}
      </Inline>
    </Stack>
  );
}

/** A finished-flow or empty state: one glyph, a heading, a line, the next actions. */
export function ResultState({
  icon, tone, title, message, children,
}: {
  icon: IconName;
  tone: "success" | "subtle";
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <Stack gap={10} align="center" className="py-20">
      <Icon name={icon} size="xl" tone={tone} />
      <Stack gap={2} align="center">
        <Text as="h2" size="subheading">{title}</Text>
        <Text tone="secondary">{message}</Text>
      </Stack>
      {children ? <Inline gap={5} wrap justify="center">{children}</Inline> : null}
    </Stack>
  );
}

/** A "← Parent" link above a page title. */
export function BackLink({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <Button emphasis="tertiary" size="sm" icon="chevron-left" onClick={onSelect}>
      {label}
    </Button>
  );
}

/**
 * A filter control: a secondary button that opens a menu of checkable values.
 * An empty selection means "no filter". v1 drew these as inert buttons; here
 * they filter the list.
 */
export function FilterMenu({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const entries: MenuEntry[] = options.map((o) => ({
    id: o,
    label: o,
    checked: selected.has(o),
    onSelect: () => {
      const next = new Set(selected);
      if (next.has(o)) next.delete(o);
      else next.add(o);
      onChange(next);
    },
  }));
  if (selected.size > 0) {
    entries.push({ separator: true }, { id: "clear", label: "Clear filter", onSelect: () => onChange(new Set()) });
  }
  return (
    <>
      <Button
        ref={setAnchor}
        emphasis="secondary"
        size="md"
        icon="filter"
        iconRight={<Icon name="caret-down" size="caret" tone="inherit" />}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selected.size > 0 ? `${label} (${selected.size})` : label}
      </Button>
      <Menu
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label={`Filter by ${label}`}
        align="start"
        entries={entries}
      />
    </>
  );
}

/**
 * The ⋯ on a row. One Menu per list, re-anchored to whichever row opened it —
 * the same Menu PurchaseOrders hangs off its header ⋯.
 */
export function useRowMenu() {
  const [state, setState] = useState<{ anchor: HTMLElement; id: string } | null>(null);
  return {
    activeId: state?.id ?? null,
    trigger: (id: string, name: string) => (
      <Button
        emphasis="tertiary"
        size="sm"
        icon="more"
        label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={state?.id === id}
        onClick={(e) => {
          const el = e.currentTarget;
          setState((s) => (s?.id === id ? null : { anchor: el, id }));
        }}
      />
    ),
    menu: (label: string, entries: MenuEntry[]) => (
      <Menu
        anchor={state?.anchor ?? null}
        open={state !== null}
        onClose={() => setState(null)}
        label={label}
        entries={entries}
      />
    ),
    close: () => setState(null),
  };
}

/**
 * A toolbar search box at the field-md width. `InputField` is `w-full` on its
 * own wrapper and `cn` does not merge classes, so a width passed to it would be
 * settled by stylesheet order — the width goes on a Stack around it instead.
 */
export function SearchField({
  value, onChange, placeholder,
}: { value: string; onChange: (next: string) => void; placeholder: string }) {
  return (
    <Stack gap={0} className="w-field-md">
      <InputField
        icon="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </Stack>
  );
}
