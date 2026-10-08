import type { ReactNode } from "react";
import { Stack, Text } from "@canon";

/**
 * One labelled fact on an approval — overline label, the value, an optional
 * helper line. Components only, so this file stays a Fast Refresh boundary.
 */
export function ReviewFact({ label, value, helper }: { label: string; value: ReactNode; helper?: string }) {
  return (
    <Stack gap={2} className="min-w-0 flex-1">
      <Text size="overline" tone="tertiary">{label}</Text>
      <Text weight="medium" className="break-words">{value}</Text>
      {helper ? <Text size="caption" tone="secondary" className="break-all">{helper}</Text> : null}
    </Stack>
  );
}

export default ReviewFact;
