import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Inline, Stack, Tabs, Text } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { MY_APPROVALS } from "../data/approvals";
import type { ApprovalRequest } from "../data/approvals";
import UsersTab from "./users/UsersTab";
import ApprovalsTab from "./users/ApprovalsTab";
import ApproverReview from "./users/ApproverReview";
import InviteUserModal from "./users/InviteUserModal";

type Tab = "users" | "my-approvals";

/**
 * Settings → Users. Two tabs — the org's users, and the role requests the
 * signed-in user approves. A pending request opens the approver review in
 * the approvals tab, with its decision bar in the Frame's footer row.
 */
export default function UsersScreen(_props: ScreenProps) {
  const [tab, setTab] = useState<Tab>("users");
  const [inviteKey, setInviteKey] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(MY_APPROVALS);
  const [approvalStatus, setApprovalStatus] = useState("All Statuses");
  const [reviewId, setReviewId] = useState<string | null>(null);

  const pendingCount = approvals.filter((r) => r.status === "Pending Approval").length;
  const reviewItem = reviewId ? approvals.find((r) => r.id === reviewId) ?? null : null;

  function updateApprovalRequest(requestId: string, updates: Partial<ApprovalRequest>) {
    setApprovals((current) => current.map((request) => (
      request.id === requestId ? { ...request, ...updates } : request
    )));
  }

  function openInvite() {
    //  A fresh key per opening, so the form starts empty every time — v1
    //  unmounted its dialog on close and got that for free.
    setInviteKey((k) => k + 1);
    setShowInvite(true);
  }

  const header = (
    <Inline gap={4} justify="between" grow>
      <Text as="h1" size="heading" weight="medium">Users</Text>
      <Inline gap={4}>
        <Button icon="plus" onClick={openInvite}>Invite User</Button>
        <Button emphasis="secondary" icon="more" label="More actions for Users" />
      </Inline>
    </Inline>
  );

  const render = (panel: ReactNode, footer?: ReactNode) => (
    <Frame header={header} footer={footer}>
      <Stack gap={0} className="pe-10 pb-10">
        <Tabs
          label="Users"
          inset="none"
          value={tab}
          onChange={(next) => {
            //  Leaving the approvals tab closes any open review, as v1 did.
            setTab(next as Tab);
            setReviewId(null);
          }}
          items={[
            { id: "users", label: "Users" },
            {
              id: "my-approvals",
              label: "User Role Approvals",
              badge: pendingCount > 0 ? String(pendingCount) : undefined,
            },
          ]}
        >
          <Stack gap={0} className="pt-10">{panel}</Stack>
        </Tabs>
      </Stack>

      <InviteUserModal key={inviteKey} open={showInvite} onClose={() => setShowInvite(false)} />
    </Frame>
  );

  //  ONE return, and the Frame always at the same depth: the review wraps it
  //  (it owns the footer's decision state), so it wraps it in every state —
  //  with `request={null}` when no review is open.
  return (
    <ApproverReview
      request={tab === "my-approvals" ? reviewItem : null}
      onUpdateRequest={updateApprovalRequest}
      onBack={() => setReviewId(null)}
    >
      {({ body, footer }) => render(
        body ?? (tab === "users" ? <UsersTab /> : (
          <ApprovalsTab
            approvals={approvals}
            status={approvalStatus}
            onStatusChange={setApprovalStatus}
            onReview={setReviewId}
          />
        )),
        footer,
      )}
    </ApproverReview>
  );
}
