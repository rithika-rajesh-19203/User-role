import type { IconName } from '../../icons';

/**
 * THE SETTINGS LINK MODEL, AND THE ONE FILTER BOTH LEVELS USE.
 *
 * These types live here rather than in `SettingsPage.tsx` for two reasons.
 *
 * The first is Fast Refresh: a React component file that also exports a plain
 * function is not a valid refresh boundary, and every edit anywhere beneath it
 * falls back to a full invalidate. That already cost this repo three days of
 * degraded HMR through `InputField`'s `applyFormat`.
 *
 * The second is ZF-SETTINGS-NAV.md §8.1, and it is the real one. Level 0 renders
 * this array as cards and level 1 renders it as a rail; if the two ever diverge
 * the user has found a bug. Typing it once, in a module neither component owns,
 * is what makes divergence impossible rather than merely discouraged.
 */

export type SettingsTone = 'blue' | 'green' | 'orange' | 'red';

export interface SettingsLink {
  id: string;
  label: string;
  href: string;
}

export interface SettingsGroup {
  id: string;
  title: string;
  /** Level 0 only — the rail is caret and label, no colour and no glyph. */
  tone: SettingsTone;
  /** Level 0 only. */
  icon: IconName;
  links: SettingsLink[];
}

/**
 * A COLUMN AT LEVEL 0, AND NOTHING AT ALL AT LEVEL 1.
 *
 * A card carries no meaning of its own — it is where a group sits in a
 * five-track grid. Level 1 has one 240px track, so `SettingsNav` folds cards
 * away entirely and reads `cards.flatMap(c => c.groups)`. That is why the rail
 * takes this same `SettingsSection[]` rather than a second nav-shaped type: a
 * second type would need an adapter, and an adapter is the seam §8.1 is trying
 * to prevent.
 */
export interface SettingsCard {
  id: string;
  groups: SettingsGroup[];
}

export interface SettingsSection {
  id: string;
  title: string;
  cards: SettingsCard[];
}

/**
 * §6.2 of ZF-SETTINGS-PAGE.md — empty groups, cards and sections DISAPPEAR.
 * Filtering that only hides links leaves a page of empty tinted headers after a
 * two-character query, and at level 1 it would leave section labels with no
 * rows under them.
 *
 * A group whose TITLE matches keeps all of its links: someone typing "payroll"
 * wants the payroll group, not the zero links inside it whose labels happen to
 * contain the word.
 */
export function filterSettingsSections(
  sections: SettingsSection[],
  query?: string,
): SettingsSection[] {
  const q = query?.trim().toLowerCase();
  if (!q) return sections;

  return sections
    .map((section) => ({
      ...section,
      cards: section.cards
        .map((card) => ({
          ...card,
          groups: card.groups
            .map((group) => (
              group.title.toLowerCase().includes(q)
                ? group
                : { ...group, links: group.links.filter((l) => l.label.toLowerCase().includes(q)) }
            ))
            .filter((group) => group.links.length > 0),
        }))
        .filter((card) => card.groups.length > 0),
    }))
    .filter((section) => section.cards.length > 0);
}

export const countSettingsLinks = (sections: SettingsSection[]) =>
  sections.reduce((n, s) => n + s.cards.reduce(
    (m, c) => m + c.groups.reduce((k, g) => k + g.links.length, 0), 0), 0);
