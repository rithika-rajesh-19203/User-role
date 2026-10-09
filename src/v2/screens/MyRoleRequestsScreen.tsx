import { useMemo, useState } from "react";
import { Avatar, Banner, Button, Inline, Menu, Modal, Select, Stack, StatusBadge, Table, Text } from "@canon";
import type { MenuEntry, TableColumn, TableSort } from "@canon";
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
  { id: "Cancelled", label: "Cancelled" },
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

/** Survives leaving and re-opening the screen, until the page reloads. */
let sessionRequests: RoleRequestRecord[] = MY_ROLE_REQUESTS;

export default function MyRoleRequestsScreen({ onNavigate, onOpenRequestAccess }: ScreenProps) {
  const [requests, setRequests] = useState<RoleRequestRecord[]>(() => sessionRequests);
  const [filter, setFilter] = useState<Filter>("all");
  //  The row whose ⋯ menu is open, and the request waiting on the cancel warning.
  const [menu, setMenu] = useState<{ request: RoleRequestRecord; anchor: HTMLElement } | null>(null);
  const [toCancel, setToCancel] = useState<RoleRequestRecord | null>(null);
  const [sort, setSort] = useState<TableSort>({ columnId: "submitted", direction: "desc" });
  const [selected, setSelected] = useState<RoleRequestRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const open = (request: RoleRequestRecord) => {
    setSelected(request);
    setDetailOpen(true);
  };

  const cancelRequest = (request: RoleRequestRecord) => {
    const cancelled = { ...request, status: "Cancelled" as const };
    sessionRequests = sessionRequests.map((r) => (r.id === request.id ? cancelled : r));
    setRequests(sessionRequests);
    //  Keep an open details panel in step with the table.
    setSelected((current) => (current?.id === request.id ? cancelled : current));
    setToCancel(null);
  };

  //  Only a request still waiting on an approver can be withdrawn.
  const menuEntries = (request: RoleRequestRecord): MenuEntry[] => [
    { id: "view", label: "View details", onSelect: () => { setMenu(null); open(request); } },
    {
      id: "cancel",
      label: "Cancel request",
      tone: "danger",
      disabled: request.status !== "Pending Approval",
      onSelect: () => { setMenu(null); setToCancel(request); },
    },
  ];

  const rows = useMemo(() => {
    const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);
    const cmp = COMPARE[sort.columnId] ?? COMPARE.submitted;
    const sorted = [...visible].sort(cmp);
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [requests, filter, sort]);

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
    {
      id: "actions", header: "Actions", align: "end",
      cell: (r) => (
        <Button
          emphasis="tertiary"
          size="sm"
          icon="more"
          label={`More actions for ${r.id}`}
          aria-haspopup="menu"
          aria-expanded={menu?.request.id === r.id}
          onClick={(event) => {
            const anchor = event.currentTarget;
            setMenu((current) => (current?.request.id === r.id ? null : { request: r, anchor }));
          }}
        />
      ),
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

      <Menu
        anchor={menu?.anchor ?? null}
        open={menu !== null}
        onClose={() => setMenu(null)}
        label={menu ? `Actions for ${menu.request.id}` : "Request actions"}
        entries={menu ? menuEntries(menu.request) : []}
      />

      {/*  The warning. "Cancel anyway" is the destructive confirm, so it is the
           danger intent; "Keep request" is the safe way out.  */}
      <Modal
        open={toCancel !== null}
        title="Cancel this request?"
        width="sm"
        onRequestClose={() => setToCancel(null)}
        primaryAction={{
          label: "Cancel anyway",
          intent: "danger",
          onSelect: () => toCancel && cancelRequest(toCancel),
        }}
        secondaryAction={{ label: "Keep request", onSelect: () => setToCancel(null) }}
      >
        {toCancel ? (
          <Stack gap={6}>
            <Banner tone="warning">
              The request you raised will be cancelled. This can't be undone.
            </Banner>
            <Text tone="secondary">
              {toCancel.requestedRole} ({toCancel.id}) for {toCancel.requestedFor} will be withdrawn and
              approvers will no longer be able to act on it. To get this access later, raise a new request.
            </Text>
          </Stack>
        ) : null}
      </Modal>

      <RequestDetailPanel open={detailOpen} request={selected} onClose={() => setDetailOpen(false)} />
    </Frame>
  );
}
