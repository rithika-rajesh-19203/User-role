import { useMemo, useState } from "react";
import { Button, Inline, StatusBadge, Table, Text } from "@canon";
import type { MenuEntry, TableColumn, TableSort } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { ROLES, ROLE_TYPES, ROW_ACTIONS } from "../data/roles";
import type { RecordStatus, RoleRow } from "../data/roles";
import { FilterMenu, PageBody, SearchField, useRowMenu } from "./roles/parts";

/**
 * SETTINGS → ROLES. The roles list: search, two filters, a sortable table and a
 * ⋯ per row. The list-view parts (Table, StatusBadge, Menu) are the reference
 * list view's; the toolbar sits in the settings body above a card table.
 */
export default function RolesScreen({ onNavigate }: ScreenProps) {
  const [roles, setRoles] = useState<RoleRow[]>(ROLES);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<TableSort>({ columnId: "name", direction: "asc" });
  const rowMenu = useRowMenu();

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles
      .filter((r) => r.name.toLowerCase().includes(q))
      .filter((r) => types.size === 0 || types.has(r.type))
      .filter((r) => statuses.size === 0 || statuses.has(r.status))
      .sort((a, b) => (sort.direction === "asc" ? 1 : -1) * a.name.localeCompare(b.name));
  }, [roles, search, types, statuses, sort]);

  const columns: TableColumn<RoleRow>[] = [
    {
      id: "name", header: "Role Name", sortable: true,
      cell: (r) => <Text as="button" tone="link" weight="medium" className="text-start">{r.name}</Text>,
    },
    { id: "category", header: "Role Category", cell: (r) => <Text as="span" tone="secondary">{r.category}</Text> },
    { id: "type", header: "Role Type", cell: (r) => <Text as="span">{r.type}</Text> },
    { id: "description", header: "Description", cell: (r) => <Text as="span" tone="secondary">{r.description}</Text> },
    { id: "users", header: "Users", align: "end", cell: (r) => <Text as="span" weight="medium" tone="link">{r.users}</Text> },
    {
      id: "status", header: "Status",
      cell: (r) => <StatusBadge status={r.status === "Active" ? "success" : "inactive"}>{r.status}</StatusBadge>,
    },
    { id: "actions", header: "Actions", cell: (r) => rowMenu.trigger(r.name, r.name) },
  ];

  const active = roles.find((r) => r.name === rowMenu.activeId);
  const toggleStatus = (name: string) => setRoles((all) => all.map((r) => (
    r.name === name ? { ...r, status: (r.status === "Active" ? "Inactive" : "Active") as RecordStatus } : r
  )));
  const menuEntries: MenuEntry[] = ROW_ACTIONS.map((action) => {
    if (action === "Deactivate") {
      const inactive = active?.status === "Inactive";
      return {
        id: action,
        label: inactive ? "Activate" : "Deactivate",
        tone: inactive ? "default" : "danger",
        onSelect: () => { if (active) toggleStatus(active.name); },
      };
    }
    return { id: action, label: action, onSelect: () => {} };
  });

  return (
    <Frame
      header={(
        <Inline justify="between" grow>
          <Text as="h1" size="heading" weight="medium">Roles</Text>
          <Button onClick={() => onNavigate("new-role")}>New Role</Button>
        </Inline>
      )}
    >
      <PageBody gap={8}>
        <Inline gap={4} wrap>
          <SearchField value={search} onChange={setSearch} placeholder="Search roles" />
          <FilterMenu label="Role Type" options={ROLE_TYPES} selected={types} onChange={setTypes} />
          <FilterMenu label="Status" options={["Active", "Inactive"]} selected={statuses} onChange={setStatuses} />
        </Inline>

        <Table
          caption={`Roles — ${rows.length} records`}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.name}
          sort={sort}
          onSortChange={setSort}
          empty={<Text tone="secondary">No roles match your search.</Text>}
        />
        <Text size="body-sm" tone="tertiary">{rows.length} roles</Text>
      </PageBody>

      {rowMenu.menu(`Actions for ${rowMenu.activeId ?? "role"}`, menuEntries)}
    </Frame>
  );
}
