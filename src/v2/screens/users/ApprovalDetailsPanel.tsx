import {
  Avatar, Banner, Divider, Icon, Inline, SidePanel, Stack, StatusBadge, Surface, Text,
} from "@canon";
import { formatAccessPeriod } from "../../data/approvals";
import type { ApprovalRequest } from "../../data/approvals";
import { APPROVAL_TONE } from "./status";
import { ReviewFact } from "./ReviewFact";

/**
 * v1's "approval details sidebar" — the read-only view of a request that has
 * already been decided. A SidePanel: supporting detail beside the list, which
 * the user does not have to answer before continuing.
 */
export default function ApprovalDetailsPanel({
  request,
  onClose,
}: {
  request: ApprovalRequest | null;
  onClose: () => void;
}) {
  return (
    <SidePanel open={request !== null} onClose={onClose} title={request?.id ?? "User Role Approval"}>
      {request ? (
        <Stack gap={10} className="p-10">
          <Stack gap={2}>
            <Text size="overline" tone="tertiary">User Role Approval</Text>
            <Text tone="secondary">View the request details and final decision context.</Text>
          </Stack>

          <Surface pad={8} radius="card" border="default">
            <Stack gap={8}>
              <Inline gap={6} align="start" justify="between">
                <Inline gap={6} align="start" className="min-w-0">
                  <Avatar name={request.requestedFor} size="md" />
                  <Stack gap={2} className="min-w-0">
                    <Text size="subheading" className="break-words">{request.access}</Text>
                    <Text tone="secondary">Requested for {request.requestedFor}</Text>
                  </Stack>
                </Inline>
                <StatusBadge status={APPROVAL_TONE[request.status]}>{request.status}</StatusBadge>
              </Inline>
              <Divider />
              <Stack gap={6}>
                <ReviewFact label="Submitted" value={request.submitted} />
                <ReviewFact label="Access period" value={formatAccessPeriod(request.accessPeriod)} />
              </Stack>
            </Stack>
          </Surface>

          <Surface pad={8} radius="card" border="default">
            <Stack gap={8}>
              <Text as="h3" size="subheading">Request Details</Text>
              <Inline gap={8} align="start">
                <ReviewFact label="Requester" value={request.by} helper={request.requesterEmail} />
                <ReviewFact label="Requested for" value={request.requestedFor} />
              </Inline>
              <ReviewFact label="Current role" value={request.currentRole} />

              <Divider />

              <Stack gap={4}>
                <Inline gap={4}>
                  <Icon name="documents" size="md" tone="subtle" />
                  <Text as="h3" size="subheading">Business Justification</Text>
                </Inline>
                <Text tone="secondary">{request.reason}</Text>
              </Stack>

              {request.status === "Rejected" && request.rejectedReason ? (
                <Banner tone="danger">
                  <Text as="span" size="body-sm" weight="semibold" tone="inherit">Rejected reason: </Text>
                  {request.rejectedReason}
                </Banner>
              ) : null}
            </Stack>
          </Surface>
        </Stack>
      ) : null}
    </SidePanel>
  );
}
