import { useState } from "react";
import {
  Button, Inline, Select, Stack, StatusBadge, Table, Text,
} from "@canon";
import type { TableColumn } from "@canon";
import { APPROVAL_STATUS_OPTIONS, formatAccessPeriod } from "../../data/approvals";
import type { ApprovalRequest } from "../../data/approvals";
import { APPROVAL_TONE } from "./status";
import ApprovalDetailsPanel from "./ApprovalDetailsPanel";

/**
 * "User Role Approvals" — every request the signed-in user approves. A pending
 * request opens the full review (owned by the screen, because its decision bar
 * lives in the Frame's footer); a decided one opens the details side panel.
 */
export default function ApprovalsTab({
  approvals,
  status,
  onStatusChange,
  onReview,
}: {
  approvals: ApprovalRequest[];
  /** Lifted so the filter survives a round trip through the review. */
  status: string;
  onStatusChange: (next: string) => void;
  onReview: (requestId: string) => void;
}) {
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = approvals.filter((request) => status === "All Statuses" || request.status === status);
  const detail = detailId ? approvals.find((request) => request.id === detailId) ?? null : null;

  function open(request: ApprovalRequest) {
    if (request.status === "Pending Approval") onReview(request.id);
    else setDetailId(request.id);
  }

  const columns: TableColumn<ApprovalRequest>[] = [
    {
      id: "request",
      header: "Request",
      cell: (request) => (
        <Stack gap={1} className="py-5">
          <Text
            as="button"
            size="caption"
            weight="medium"
            tone="link"
            className="cursor-pointer text-start hover:underline"
            onClick={() => open(request)}
          >
            {request.id}
          </Text>
          <Text weight="medium">{request.access}</Text>
          <Text size="caption" tone="tertiary">{formatAccessPeriod(request.accessPeriod)}</Text>
        </Stack>
      ),
    },
    {
      id: "for",
      header: "Requested for",
      cell: (request) => (
        <Stack gap={1}>
          <Text weight="medium">{request.requestedFor}</Text>
          <Text size="caption" tone="tertiary">{request.by}</Text>
        </Stack>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (request) => <StatusBadge status={APPROVAL_TONE[request.status]}>{request.status}</StatusBadge>,
    },
    {
      id: "submitted",
      header: "Submitted",
      cell: (request) => <Text size="caption" tone="tertiary" className="whitespace-nowrap">{request.submitted}</Text>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "end",
      cell: (request) => request.status === "Pending Approval" ? (
        <Button size="sm" emphasis="secondary" intent="success" onClick={() => open(request)}>Review</Button>
      ) : (
        <Button size="sm" emphasis="secondary" onClick={() => open(request)}>View details</Button>
      ),
    },
  ];

  return (
    <Stack gap={8}>
      <Inline gap={4}>
        <Text size="overline" tone="secondary">View by:</Text>
        <Stack className="w-field-md">
          <Select
            ariaLabel="Filter approvals by status"
            options={APPROVAL_STATUS_OPTIONS.map((o) => ({ value: o, label: o }))}
            value={status}
            onChange={onStatusChange}
          />
        </Stack>
      </Inline>

      <Table
        caption={`User Role Approvals — ${rows.length} requests`}
        columns={columns}
        rows={rows}
        rowKey={(request) => request.id}
        empty={<Text tone="tertiary">No approvals match the selected filters.</Text>}
      />

      <Text size="caption" tone="tertiary">
        {rows.length} request{rows.length !== 1 ? "s" : ""}
      </Text>

      <ApprovalDetailsPanel request={detail} onClose={() => setDetailId(null)} />
    </Stack>
  );
}
