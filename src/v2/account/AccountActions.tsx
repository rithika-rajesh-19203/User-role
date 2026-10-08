import { useState } from "react";
import { Button } from "@canon";
import { ORG_NAME } from "../data/people";
import OrgPanel from "./OrgPanel";
import UserPanel from "./UserPanel";
import VersionMenu from "./VersionMenu";

export interface AccountActionsProps {
  onOpenMyRoleRequests: () => void;
  onOpenRequestAccess: () => void;
}

type Panel = "org" | "user" | null;

/**
 * The bar's two account controls, from v1's Header: the org switcher and the
 * account button. Each opens its `SidePanel`; only one is ever open, and both
 * close before navigating or opening the Request Role modal ("this panel
 * auto-closes when you navigate").
 */
export default function AccountActions({ onOpenMyRoleRequests, onOpenRequestAccess }: AccountActionsProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const close = () => setPanel(null);

  return (
    <>
      <VersionMenu />
      <Button
        emphasis="tertiary"
        size="md"
        iconRight={panel === "org" ? "chevron-up" : "chevron-down"}
        aria-haspopup="dialog"
        aria-expanded={panel === "org"}
        onClick={() => setPanel("org")}
      >
        {ORG_NAME}
      </Button>
      <Button
        emphasis="secondary"
        size="md"
        icon="users"
        label="Account"
        aria-haspopup="dialog"
        aria-expanded={panel === "user"}
        onClick={() => setPanel("user")}
      />

      <OrgPanel
        open={panel === "org"}
        onClose={close}
        onOpenMyRoleRequests={() => { close(); onOpenMyRoleRequests(); }}
      />
      <UserPanel
        open={panel === "user"}
        onClose={close}
        onOpenRequestAccess={() => { close(); onOpenRequestAccess(); }}
      />
    </>
  );
}
