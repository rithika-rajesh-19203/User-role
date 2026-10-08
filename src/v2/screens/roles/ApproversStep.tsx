import { useState } from "react";
import {
  Avatar, Banner, Button, Icon, Inline, Stack, StatusBadge, Surface, Table, Text,
} from "@canon";
import type { TableColumn } from "@canon";
import { ME } from "../../data/people";
import { APPROVER_OPTIONS } from "../../data/roles";
import type { Approver } from "../../data/roles";
import { SearchField } from "./parts";

function Person({ a }: { a: Approver }) {
  return (
    <Inline gap={4} grow>
      <Avatar name={a.name} initials={a.initials} />
      <Stack gap={0} className="min-w-0">
        <Text as="span" weight="medium" truncate>{a.name}</Text>
        <Text as="span" size="body-sm" tone="tertiary" truncate>{a.email}</Text>
      </Stack>
    </Inline>
  );
}

/**
 * Step 3 of New Role Category — choose who approves access requests, and see
 * the flow a request takes. The chosen approvers and the directory are both
 * `Table`s: the canon has no removable chip, and a selected-people list is a
 * list.
 */
export default function ApproversStep({
  selected, onChange,
}: { selected: Approver[]; onChange: (next: Approver[]) => void }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const available = APPROVER_OPTIONS.filter((a) => (
    !selected.some((s) => s.name === a.name)
    && (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
  ));

  const selectedColumns: TableColumn<Approver>[] = [
    { id: "approver", header: "Approver", cell: (a) => <Person a={a} /> },
    { id: "dept", header: "Department", cell: (a) => <Text as="span" tone="secondary">{a.dept}</Text> },
    {
      id: "remove", header: "Remove", align: "end",
      cell: (a) => (
        <Button
          emphasis="tertiary"
          size="sm"
          icon="close"
          label={`Remove ${a.name}`}
          onClick={() => onChange(selected.filter((x) => x.name !== a.name))}
        />
      ),
    },
  ];

  const availableColumns: TableColumn<Approver>[] = [
    { id: "user", header: "User", cell: (a) => <Person a={a} /> },
    { id: "dept", header: "Department", cell: (a) => <Text as="span" size="body-sm" tone="tertiary">{a.dept}</Text> },
    {
      id: "add", header: "Add", align: "end",
      cell: (a) => (
        <Button
          emphasis="tertiary"
          size="sm"
          icon="plus"
          onClick={() => { onChange([...selected, a]); setSearch(""); }}
        >
          Add
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={12}>
      <Stack gap={2}>
        <Text as="h2" size="subheading">Assign Approvers</Text>
        <Text tone="secondary">Access requests for this role category will be sent to the users selected below.</Text>
      </Stack>

      <Stack gap={6}>
        <Text as="h3" size="body" weight="medium">Approvers</Text>
        {selected.length > 0 ? (
          <Table
            caption={`Selected approvers — ${selected.length}`}
            columns={selectedColumns}
            rows={selected}
            rowKey={(a) => a.name}
          />
        ) : (
          <Banner tone="danger">Add at least one approver to continue.</Banner>
        )}

        <SearchField value={search} onChange={setSearch} placeholder="Search users to add as approvers" />
        <Table
          caption="Users who can be added as approvers"
          columns={availableColumns}
          rows={available}
          rowKey={(a) => a.name}
          empty={(
            <Text tone="tertiary">
              {search ? "No users match your search." : "All available users have been added."}
            </Text>
          )}
        />
      </Stack>

      <Surface pad={10} radius="card" border="default">
        <Stack gap={8}>
          <Text as="h3" size="overline" tone="secondary">Approval Flow Preview</Text>
          <Inline gap={6} wrap>
            <Stack gap={2} align="center">
              <Avatar name={ME.name} />
              <Text as="span" size="caption" tone="tertiary">Requester</Text>
            </Stack>
            <Icon name="chevron-right" size="sm" tone="subtle" />
            <Stack gap={2} align="center">
              <StatusBadge status="submitted">Request submitted</StatusBadge>
              <Text as="span" size="caption" tone="tertiary">Routed automatically</Text>
            </Stack>
            <Icon name="chevron-right" size="sm" tone="subtle" />
            <Stack gap={2} align="center">
              <Inline gap={1}>
                {selected.map((a) => <Avatar key={a.name} name={a.name} initials={a.initials} ring />)}
              </Inline>
              <Text as="span" size="caption" tone="tertiary">
                {selected.length > 0
                  ? `${selected.length} approver${selected.length > 1 ? "s" : ""}`
                  : "No approvers"}
              </Text>
            </Stack>
            <Icon name="chevron-right" size="sm" tone="subtle" />
            <Stack gap={2}>
              <StatusBadge status="approved">Approved</StatusBadge>
              <StatusBadge status="failed">Rejected</StatusBadge>
            </Stack>
          </Inline>
        </Stack>
      </Surface>
    </Stack>
  );
}
