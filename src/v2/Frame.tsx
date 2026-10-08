import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { SettingsShell } from "@canon";
import type { SettingsShellProps } from "@canon";

/** Everything about the shell that App owns. A screen only supplies its own regions. */
export type FrameChrome = Omit<SettingsShellProps, "header" | "footer" | "children" | "className">;

export const FrameContext = createContext<FrameChrome | null>(null);

export interface FrameProps {
  /** The page title row: its own grid row above the scroller, so it never scrolls away. */
  header?: ReactNode;
  /** A Save / Cancel row pinned under the body. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * Every v2 screen renders inside this. It is `SettingsShell` with App's chrome
 * already applied, so each screen only supplies a header, a body and an
 * optional footer. Every screen renders the same element type here, so React
 * keeps the bar and the rail mounted while the body changes.
 */
export default function Frame({ header, footer, children }: FrameProps) {
  const chrome = useContext(FrameContext);
  if (!chrome) throw new Error("Frame must render inside FrameContext");
  return (
    <SettingsShell {...chrome} header={header} footer={footer}>
      {children}
    </SettingsShell>
  );
}
