import { useMemo } from "react";
import { Button, Inline, Stack, Surface, Text } from "@canon";
import { getEmailSuggestions } from "../data/people";
import type { UserRow } from "../data/people";

export interface EmailSuggestionsProps {
  query: string;
  onSelect: (user: UserRow) => void;
  /** Focus moved onto a suggestion — the field's pending blur-dismiss must be cancelled. */
  onFocus: () => void;
  /** Focus left a suggestion. */
  onBlur: () => void;
}

/**
 * v1's EmailSuggestionList: users whose email matches what has been typed.
 *
 * CANON GAP — there is no combobox/autocomplete. `Menu` moves focus into its
 * panel when it opens, which would steal the caret on every keystroke, and
 * `Select` cannot take free text. So the matches are a raised `Surface` of
 * tertiary `Button`s under the field. `onMouseDown` keeps focus in the input
 * so the field's blur does not dismiss the list before the click lands, and
 * keyboard focus moving onto a suggestion cancels the field's blur-dismiss.
 */
export default function EmailSuggestions({ query, onSelect, onFocus, onBlur }: EmailSuggestionsProps) {
  const matches = useMemo(() => getEmailSuggestions(query), [query]);
  if (matches.length === 0) return null;

  return (
    <Surface border="default" radius="md" elevation="popover" pad={6}>
      <Stack gap={3}>
        {matches.map((user) => (
          <Inline key={user.email} gap={4} justify="between">
            <Button
              emphasis="tertiary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onFocus={onFocus}
              onBlur={onBlur}
              onClick={() => onSelect(user)}
            >
              {user.email}
            </Button>
            <Text as="span" size="body-sm" tone="secondary" truncate>{user.name}</Text>
          </Inline>
        ))}
      </Stack>
    </Surface>
  );
}
