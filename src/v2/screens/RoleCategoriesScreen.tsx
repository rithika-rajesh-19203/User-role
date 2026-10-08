import { useMemo, useState } from "react";
import { Button, Icon, Inline, Stack, StatusBadge, Table, Text } from "@canon";
import type { MenuEntry, TableColumn } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { ROLE_CATEGORIES, ROW_ACTIONS } from "../data/roles";
import type { RecordStatus, RoleCategoryRow } from "../data/roles";
import { FilterMenu, PageBody, ResultState, SearchField, useRowMenu } from "./roles/parts";

/**
 * SETTINGS → ROLE CATEGORIES. A list of permission boundaries, with an empty
 * state for an org that has none yet. A category name opens its detail page.
 */
export default function RoleCategoriesScreen({ onNavigate }: ScreenProps) {
  const [categories, setCategories] = useState<RoleCategoryRow[]>(ROLE_CATEGORIES);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [approvers, setApprovers] = useState<Set<string>>(new Set());
  const rowMenu = useRowMenu();

  const approverLabel = (n: number) => `${n} approver${n === 1 ? "" : "s"}`;
  const approverOptions = [...new Set(categories.map((c) => c.approvers))].sort().map(approverLabel);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .filter((c) => statuses.size === 0 || statuses.has(c.status))
      .filter((c) => approvers.size === 0 || approvers.has(approverLabel(c.approvers)));
  }, [categories, search, statuses, approvers]);

  const create = () => onNavigate("create-role-category");

  const header = (
    <Inline justify="between" align="start" grow>
      <Stack gap={1}>
        <Text as="h1" size="heading" weight="medium">Role Categories</Text>
        <Text tone="secondary">
          Create permission boundaries for a group of related roles and assign approvers for access requests.
        </Text>
      </Stack>
      <Button onClick={create}>New Role Category</Button>
    </Inline>
  );

  //  v1 kept this state behind a hard-coded flag; here it is what an org with
  //  no categories sees.
  if (categories.length === 0) {
    return (
      <Frame header={<Text as="h1" size="heading" weight="medium">Role Categories</Text>}>
        <PageBody>
          <ResultState
            icon="lock"
            tone="subtle"
            title="No role categories created yet."
            message="Create permission boundaries for a group of related roles."
          >
            <Button onClick={create}>Create Role Category</Button>
          </ResultState>
        </PageBody>
      </Frame>
    );
  }

  const columns: TableColumn<RoleCategoryRow>[] = [
    {
      id: "name", header: "Category Name",
      cell: (c) => (
        <Text as="button" tone="link" weight="medium" className="text-start" onClick={() => onNavigate("role-category-detail")}>
          {c.name}
        </Text>
      ),
    },
    { id: "description", header: "Description", cell: (c) => <Text as="span" size="body-sm" tone="secondary">{c.description}</Text> },
    { id: "roles", header: "Roles", cell: (c) => <Text as="span" size="body-sm" weight="medium" tone="link">{c.roles} roles</Text> },
    {
      id: "permissions", header: "Base Permissions",
      cell: (c) => <Text as="span" size="body-sm" weight="medium" tone="link">{c.permissions} permissions</Text>,
    },
    {
      id: "approvers", header: "Approvers",
      cell: (c) => (
        <Inline gap={2}>
          <Icon name="users" size="sm" tone="subtle" />
          <Text as="span" size="body-sm">{c.approvers}</Text>
        </Inline>
      ),
    },
    {
      id: "status", header: "Status",
      cell: (c) => <StatusBadge status={c.status === "Active" ? "success" : "inactive"}>{c.status}</StatusBadge>,
    },
    { id: "updated", header: "Last Updated", cell: (c) => <Text as="span" size="body-sm" tone="secondary">{c.updated}</Text> },
    { id: "actions", header: "Actions", cell: (c) => rowMenu.trigger(c.name, c.name) },
  ];

  const active = categories.find((c) => c.name === rowMenu.activeId);
  const menuEntries: MenuEntry[] = ROW_ACTIONS.map((action) => {
    if (action === "Deactivate") {
      const inactive = active?.status === "Inactive";
      return {
        id: action,
        label: inactive ? "Activate" : "Deactivate",
        tone: inactive ? "default" : "danger",
        onSelect: () => setCategories((all) => all.map((c) => (
          c.name === active?.name
            ? { ...c, status: (c.status === "Active" ? "Inactive" : "Active") as RecordStatus }
            : c
        ))),
      };
    }
    return {
      id: action,
      label: action,
      onSelect: action === "View" ? () => onNavigate("role-category-detail") : () => {},
    };
  });

  return (
    <Frame header={header}>
      <PageBody gap={8}>
        <Inline gap={4} wrap>
          <SearchField value={search} onChange={setSearch} placeholder="Search role categories" />
          <FilterMenu label="Status" options={["Active", "Inactive"]} selected={statuses} onChange={setStatuses} />
          <FilterMenu label="Approver" options={approverOptions} selected={approvers} onChange={setApprovers} />
        </Inline>

        <Table
          caption={`Role categories — ${rows.length} records`}
          columns={columns}
          rows={rows}
          rowKey={(c) => c.name}
          empty={<Text tone="secondary">No role categories match your search.</Text>}
        />
        <Text size="body-sm" tone="tertiary">{rows.length} role categories</Text>
      </PageBody>

      {rowMenu.menu(`Actions for ${rowMenu.activeId ?? "role category"}`, menuEntries)}
    </Frame>
  );
}
