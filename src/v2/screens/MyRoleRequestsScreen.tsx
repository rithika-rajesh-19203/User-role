import { useMemo, useState } from "react";
import { Avatar, Button, Inline, Select, Stack, StatusBadge, Table, Text } from "@canon";
import type { TableColumn, TableSort } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { MY_ROLE_REQUESTS, REQUEST_STATUS } from "../data/requests";
import type { RequestStatus, RoleRequestRecord } from "../data/requests";
import RequestDetailPanel from "./requests/RequestDetailPanel";

type Filter = "all" | RequestStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All Statuses" },
  { id: "Pending Approval", label: "Pending Approval" },
  { id: "Approved", label: "Approved" },
  { id: "Rejected", label: "Rejected" },
];

/** Submission order — the data is newest first, and "03 Sep 2026, 09:18 AM" does not sort as a string. */
const ORDER = new Map(MY_ROLE_REQUESTS.map((r, i) => [r.id, i]));

const COMPARE: Record<string, (a: RoleRequestRecord, b: RoleRequestRecord) => number> = {
  requester: (a, b) => a.requester.localeCompare(b.requester),
  role: (a, b) => a.requestedRole.localeCompare(b.requestedRole),
  status: (a, b) => a.status.localeCompare(b.status),
  //  Ascending = oldest first.
  submitted: (a, b) => (ORDER.get(b.id) ?? 0) - (ORDER.get(a.id) ?? 0),
};

export default function MyRoleRequestsScreen({ onNavigate, onOpenRequestAccess }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<TableSort>({ columnId: "submitted", direction: "desc" });
  const [selected, setSelected] = useState<RoleRequestRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const open = (request: RoleRequestRecord) => {
    setSelected(request);
    setDetailOpen(true);
  };

  const rows = useMemo(() => {
    const visible = filter === "all" ? MY_ROLE_REQUESTS : MY_ROLE_REQUESTS.filter((r) => r.status === filter);
    const cmp = COMPARE[sort.columnId] ?? COMPARE.submitted;
    const sorted = [...visible].sort(cmp);
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [filter, sort]);

  const columns: TableColumn<RoleRequestRecord>[] = [
    {
      id: "requester", header: "Requester", sortable: true,
      cell: (r) => (
        <Inline gap={4}>
          <Avatar name={r.requester} size="sm" />
          <Text as="span" weight="medium" truncate>{r.requester}</Text>
        </Inline>
      ),
    },
    {
      //  The identifying column, so it is the link that opens the record.
      id: "role", header: "Role Requested", sortable: true,
      cell: (r) => (
        <Stack gap={0}>
          <Text as="a" href="#" tone="link" weight="medium" onClick={() => open(r)}>{r.requestedRole}</Text>
          <Text size="body-sm" tone="tertiary">{r.id}</Text>
        </Stack>
      ),
    },
    { id: "validity", header: "Validity", cell: (r) => <Text as="span" tone="secondary" className="whitespace-nowrap">{r.validity}</Text> },
    {
      id: "status", header: "Status", sortable: true,
      cell: (r) => <StatusBadge status={REQUEST_STATUS[r.status]}>{r.status}</StatusBadge>,
    },
    {
      id: "submitted", header: "Submitted", sortable: true,
      cell: (r) => <Text as="span" tone="tertiary" className="whitespace-nowrap">{r.submittedAt}</Text>,
    },
  ];

  const filterLabel = FILTERS.find((f) => f.id === filter)?.label.toLowerCase() ?? "";

  return (
    <Frame
      header={
        <>
          <Stack gap={2} grow>
            <Inline>
              <Button emphasis="tertiary" size="sm" icon="chevron-left" onClick={() => onNavigate("users")}>
                Users
              </Button>
            </Inline>
            <Text size="overline" tone="tertiary">Personal Access Queue</Text>
            <Text as="h1" size="heading" weight="medium">My Role Requests</Text>
            <Text tone="secondary">
              Track every submitted request in one place and open any item to review the current decision details.
            </Text>
          </Stack>
          <Button icon="plus" onClick={onOpenRequestAccess}>Request Role</Button>
        </>
      }
    >
      <Stack gap={6} className="pe-10 pb-10">
        {/*  One list of every request. The status filter narrows it in place,
             the same "View by" pattern as the Users tab. */}
        <Inline gap={4}>
          <Text size="overline" tone="secondary">View by:</Text>
          <Stack className="w-field-md">
            <Select
              ariaLabel="Filter requests by status"
              options={FILTERS.map((f) => ({ value: f.id, label: f.label }))}
              value={filter}
              onChange={(next) => setFilter(next as Filter)}
            />
          </Stack>
        </Inline>
        <Table
          caption="My role requests"
          placement="card"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={setSort}
          empty={
            <Stack gap={4} align="center" className="py-12">
              <Text weight="medium">
                {filter === "all" ? "You have not submitted any role requests yet." : `No ${filterLabel} requests.`}
              </Text>
              <Text tone="secondary">Request a role to see it tracked here.</Text>
              <Button emphasis="secondary" icon="plus" onClick={onOpenRequestAccess}>Request Role</Button>
            </Stack>
          }
        />
        <Text size="body-sm" tone="tertiary">
          {rows.length} {rows.length === 1 ? "request" : "requests"}
        </Text>
      </Stack>

      <RequestDetailPanel open={detailOpen} request={selected} onClose={() => setDetailOpen(false)} />
    </Frame>
  );
}
