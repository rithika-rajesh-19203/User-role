import { useState } from "react";
import { Button, Icon, Menu } from "@canon";
import type { MenuEntry } from "@canon";
import { VERSIONS, switchVersion, versionFromUrl } from "../../versioning/versions";

/** The UI version switcher, in the bar beside the org button. */
export default function VersionMenu() {
  const current = versionFromUrl(window.location.search);
  const active = VERSIONS.find((v) => v.id === current)!;
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const entries: MenuEntry[] = VERSIONS.map((v) => ({
    id: v.id,
    label: `${v.label} · ${v.description}`,
    checked: v.id === current,
    onSelect: () => (v.id === current ? setOpen(false) : switchVersion(v.id)),
  }));

  return (
    <>
      <Button
        ref={setAnchor}
        emphasis="secondary"
        size="md"
        iconRight={<Icon name="caret-down" size="caret" tone="inherit" />}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`UI version ${active.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        {active.label}
      </Button>
      <Menu
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        label="UI version"
        align="end"
        entries={entries}
      />
    </>
  );
}
