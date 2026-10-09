import {
  Banner, DescriptionList, Divider, Icon, Inline, SidePanel, Stack, StatusBadge, Surface, Text,
} from "@canon";
import { REQUEST_STATUS } from "../../data/requests";
import type { RoleRequestRecord } from "../../data/requests";

export interface RequestDetailPanelProps {
  open: boolean;
  /** The request being read. Kept after closing so the panel does not empty while it shuts. */
  request: RoleRequestRecord | null;
  onClose: () => void;
}

/** What the decision means for the requester, under the status badge. */
function Decision({ request }: { request: RoleRequestRecord }) {
  if (request.status === "Rejected" && request.rejectedReason) {
    return (
      <Banner tone="danger">
        <Text as="span" size="body-sm" weight="semibold" tone="inherit">Rejected reason: </Text>
        {request.rejectedReason}
      </Banner>
    );
  }
  if (request.status === "Approved") {
    return <Banner tone="success">This request was approved. {request.requestedRole} access is active for {request.validity === "No expiry" ? "an unlimited period" : request.validity}.</Banner>;
  }
  if (request.status === "Cancelled") {
    return <Banner tone="warning">You cancelled this request. Approvers can no longer act on it.</Banner>;
  }
  if (request.status === "Pending Approval") {
    return <Banner tone="info">This request is waiting for an approver's decision.</Banner>;
  }
  return null;
}

/**
 * v1's RequestDetailsSidebar. A row in My Role Requests opens it; the panel is
 * the canon `SidePanel` (scrim, focus trap, Escape and click-outside included).
 */
export default function RequestDetailPanel({ open, request: r, onClose }: RequestDetailPanelProps) {
  return (
    <SidePanel open={open && Boolean(r)} onClose={onClose} title={r ? r.id : "Role Request"} tintedHeader>
      {r ? (
        <Stack gap={10} className="p-10">
          <Stack gap={2}>
            <Text size="overline" tone="tertiary">Role Request</Text>
            <Text tone="secondary">View the request details and the latest decision.</Text>
          </Stack>

          {/* The summary card — role, who it is for, status, and the three facts
              a requester checks first. */}
          <Surface border="default" radius="card" pad={10}>
            <Stack gap={8}>
              <Inline gap={6} align="start" justify="between">
                <Inline gap={6} align="start" grow>
                  <Surface tone="sunken" radius="lg" pad={5} className="flex-none">
                    <Icon name="admin" size="lg" tone="primary" />
                  </Surface>
                  <Stack gap={1} className="min-w-0">
                    <Text as="h3" size="heading" weight="semibold" className="break-words">{r.requestedRole}</Text>
                    <Text tone="secondary">Requested for {r.requestedFor}</Text>
                  </Stack>
                </Inline>
                <StatusBadge status={REQUEST_STATUS[r.status]}>{r.status}</StatusBadge>
              </Inline>
              <Divider />
              <DescriptionList
                items={[
                  { label: "Submitted", value: r.submittedAt },
                  { label: "Validity", value: r.validity },
                ]}
              />
            </Stack>
          </Surface>

          <Decision request={r} />

          <Stack gap={6}>
            <Text as="h4" size="subheading">Request Details</Text>
            <DescriptionList
              items={[
                { label: "Requester", value: r.requester },
                { label: "Requester email", value: r.requesterEmail },
                { label: "Requested for", value: r.requestedFor },
                { label: "Current role", value: r.currentRole },
                { label: "Department", value: r.department },
                { label: "Validity", value: r.validity },
              ]}
            />
          </Stack>

          <Divider />

          <Stack gap={4}>
            <Inline gap={4}>
              <Icon name="documents" size="md" tone="muted" />
              <Text as="h4" size="subheading">Business Justification</Text>
            </Inline>
            <Text tone="secondary">{r.reason}</Text>
          </Stack>
        </Stack>
      ) : null}
    </SidePanel>
  );
}
