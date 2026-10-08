import { useState } from "react";
import {
  Avatar, Button, Icon, Inline, Menu, Select, Stack, StatusBadge, Table, Text,
} from "@canon";
import type { MenuEntry, TableColumn } from "@canon";
import { USERS } from "../../data/people";
import type { UserRow } from "../../data/people";
import { USER_TONE } from "./status";

const USER_ROLE_OPTIONS = ["All Roles", ...Array.from(new Set(USERS.map((u) => u.role)))];

/** The row ⋯ menu — v1's four actions. Deactivate is the destructive one. */
function rowEntries(close: () => void): MenuEntry[] {
  return [
    { id: "view", label: "View Profile", onSelect: close },
    { id: "edit", label: "Edit", icon: "edit", onSelect: close },
    { id: "role", label: "Change Role", onSelect: close },
    { separator: true },
    { id: "deactivate", label: "Deactivate", tone: "danger", onSelect: close },
  ];
}

export default function UsersTab() {
  const [role, setRole] = useState("All Roles");
  const [menu, setMenu] = useState<{ user: string; anchor: HTMLElement } | null>(null);

  const rows = USERS.filter((user) => role === "All Roles" || user.role === role);

  const columns: TableColumn<UserRow>[] = [
    {
      id: "user",
      header: "User Details",
      cell: (user) => (
        <Inline gap={6} align="center" className="py-6">
          <Avatar name={user.name} size="md" admin={Boolean(user.badge)} />
          <Stack gap={1} className="min-w-0">
            <Inline gap={4} wrap>
              <Text as="button" tone="link" weight="medium" className="cursor-pointer text-start hover:underline">
                {user.name}
              </Text>
              {user.badge ? <Text size="caption" weight="medium" tone="info">{user.badge}</Text> : null}
            </Inline>
            <Inline gap={2} className="min-w-0">
              <Icon name="mail" size="xs" tone="subtle" />
              <Text size="caption" tone="tertiary" truncate>{user.email}</Text>
            </Inline>
          </Stack>
        </Inline>
      ),
    },
    {
      id: "role",
      header: "Associated Roles",
      cell: (user) => <Text as="span">{user.role}</Text>,
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <StatusBadge status={USER_TONE[user.status]}>{user.status}</StatusBadge>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "end",
      cell: (user) => (
        <Button
          emphasis="tertiary"
          size="sm"
          icon="more"
          label={`More actions for ${user.name}`}
          aria-haspopup="menu"
          aria-expanded={menu?.user === user.name}
          onClick={(event) => {
            const anchor = event.currentTarget;
            setMenu((current) => (current?.user === user.name ? null : { user: user.name, anchor }));
          }}
        />
      ),
    },
  ];

  const close = () => setMenu(null);

  return (
    <Stack gap={8}>
      <Inline gap={4}>
        <Text size="overline" tone="secondary">View by:</Text>
        <Stack className="w-field-md">
          <Select
            ariaLabel="Filter users by role"
            options={USER_ROLE_OPTIONS.map((o) => ({ value: o, label: o }))}
            value={role}
            onChange={setRole}
          />
        </Stack>
      </Inline>

      <Table
        caption={`Users — ${rows.length} users`}
        columns={columns}
        rows={rows}
        rowKey={(user) => user.email}
        empty={<Text tone="tertiary">No users match the selected filters.</Text>}
      />

      <Text size="caption" tone="tertiary">{rows.length} users</Text>

      <Menu
        anchor={menu?.anchor ?? null}
        open={menu !== null}
        onClose={close}
        label={menu ? `Actions for ${menu.user}` : "User actions"}
        entries={rowEntries(close)}
      />
    </Stack>
  );
}
