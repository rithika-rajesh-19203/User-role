/**
 * The UI version history. Each version is a self-contained app with its own
 * stylesheet, loaded on its own, so two versions never share CSS.
 *
 * To add a version: create `src/vN/main.tsx` exporting `mount`, add an entry
 * here, and add its loader in `src/main.tsx`.
 */
export interface UiVersion {
  id: "v1" | "v2";
  label: string;
  description: string;
}

export const VERSIONS: UiVersion[] = [
  { id: "v2", label: "v2.0", description: "ZF Design Canon UI" },
  { id: "v1", label: "v1.0", description: "Original UI" },
];

export const LATEST_VERSION: UiVersion["id"] = "v2";

const PARAM = "v";

/** `?v=1` or `?v=v1` selects a version; anything else falls back to the latest. */
export function versionFromUrl(search: string): UiVersion["id"] {
  const raw = new URLSearchParams(search).get(PARAM)?.toLowerCase();
  const id = raw && !raw.startsWith("v") ? `v${raw}` : raw;
  return VERSIONS.some((v) => v.id === id) ? (id as UiVersion["id"]) : LATEST_VERSION;
}

/** Full reload, so only the chosen version's stylesheet is ever on the page. */
export function switchVersion(id: UiVersion["id"]) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, id.slice(1));
  window.location.assign(url.toString());
}
