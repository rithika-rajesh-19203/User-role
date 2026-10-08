import { useRef, useState } from "react";
import {
  Accordion, AccordionItem, Avatar, Banner, Button, DescriptionList, DetailsToolbar, Inline,
  Menu, Stack, StatusBadge, Surface, Table, Tabs, Text,
} from "@canon";
import type { MenuEntry, TableColumn } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { CATEGORY_DETAIL, CATEGORY_DETAIL_TABS } from "../data/roles";
import { BackLink, PageBody, useRowMenu } from "./roles/parts";

type CategoryRole = (typeof CATEGORY_DETAIL.roles)[number];

const ROLE_ACTIONS: MenuEntry[] = [
  { id: "view", label: "View", onSelect: () => {} },
  { id: "edit", label: "Edit", onSelect: () => {} },
  { id: "duplicate", label: "Duplicate", onSelect: () => {} },
  { id: "deactivate", label: "Deactivate", tone: "danger", onSelect: () => {} },
];

/**
 * SETTINGS → ROLE CATEGORIES → FINANCE OPERATIONS. The record: its status, its
 * actions, four headline counts and six tabs.
 *
 * The detail-view parts carry over — `DetailsToolbar` for the actions with the
 * rest behind its ⋯, `Surface radius="card"` sections, the tabbed section at
 * `pad={0}`. `SplitView` + `MiniList` do not: this page sits inside the
 * settings shell, whose rail already holds the place a mini list would.
 */
export default function RoleCategoryDetailScreen({ onNavigate }: ScreenProps) {
  const d = CATEGORY_DETAIL;
  const [tab, setTab] = useState(CATEGORY_DETAIL_TABS[0]);
  const [active, setActive] = useState(d.status === "Active");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const rowMenu = useRowMenu();

  const header = (
    <Stack gap={4} align="start" className="flex-1 min-w-0">
      <BackLink label="Role Categories" onSelect={() => onNavigate("role-categories")} />
      <Inline gap={6}>
        <Text as="h1" size="heading" weight="medium">{d.name}</Text>
        <StatusBadge status={active ? "success" : "inactive"}>{active ? "Active" : "Inactive"}</StatusBadge>
      </Inline>
    </Stack>
  );

  const roleColumns: TableColumn<CategoryRole>[] = [
    { id: "name", header: "Role Name", cell: (r) => <Text as="button" tone="link" weight="medium" className="text-start">{r.name}</Text> },
    { id: "desc", header: "Description", cell: (r) => <Text as="span" size="body-sm" tone="secondary">{r.desc}</Text> },
    { id: "perms", header: "Permissions", align: "end", cell: (r) => <Text as="span" size="body-sm" weight="medium" tone="link">{r.perms}</Text> },
    { id: "users", header: "Users", align: "end", cell: (r) => <Text as="span">{r.users}</Text> },
    { id: "status", header: "Status", cell: (r) => <StatusBadge status="success">{r.status}</StatusBadge> },
    { id: "actions", header: "Actions", cell: (r) => rowMenu.trigger(r.name, r.name) },
  ];

  const permColumns: TableColumn<string>[] = [
    { id: "perm", header: "Permission", cell: (p) => <Text as="span">{p}</Text> },
    { id: "access", header: "Access", align: "end", cell: () => <StatusBadge status="submitted">Full Access</StatusBadge> },
  ];

  let panel;
  if (tab === "Overview") {
    panel = (
      <DescriptionList
        gap={6}
        items={d.overview.map(([label, value]) => ({ label, value: <Text as="span" weight="medium">{value}</Text> }))}
      />
    );
  } else if (tab === "Roles") {
    panel = (
      <Stack gap={8}>
        <Inline gap={8} align="center">
          <Stack gap={0} className="flex-1 min-w-0">
            <Banner tone="info">Roles in this category can only contain a subset of the base permissions.</Banner>
          </Stack>
          <Button onClick={() => onNavigate("new-role")}>New Role</Button>
        </Inline>
        <Table caption={`Roles in ${d.name}`} columns={roleColumns} rows={d.roles} rowKey={(r) => r.name} />
      </Stack>
    );
  } else if (tab === "Base Permissions") {
    panel = (
      <Accordion>
        {d.basePermissions.map((g) => (
          <AccordionItem
            key={g.group}
            title={g.group}
            chevron="leading"
            count={g.perms.length}
            countLabel="permissions"
            defaultOpen
          >
            <Table caption={`${g.group} permissions`} placement="page" columns={permColumns} rows={g.perms} rowKey={(p) => p} />
          </AccordionItem>
        ))}
      </Accordion>
    );
  } else if (tab === "Approvers") {
    panel = (
      <Stack gap={6}>
        {d.approvers.map((a) => (
          <Surface key={a.name} pad={6} radius="md" border="default">
            <Inline gap={6}>
              <Avatar name={a.name} initials={a.initials} />
              <Stack gap={0}>
                <Text as="span" weight="medium">{a.name}</Text>
                <Text as="span" size="body-sm" tone="secondary">{a.email}</Text>
              </Stack>
            </Inline>
          </Surface>
        ))}
      </Stack>
    );
  } else {
    panel = (
      <Stack gap={0} align="center" className="py-20">
        <Text tone="secondary">
          Click the <Text as="span" tone="link">Access Requests</Text> tab in the sidebar for the full module view.
        </Text>
      </Stack>
    );
  }

  const more: MenuEntry[] = [
    { id: "duplicate", label: "Duplicate", icon: "clone", onSelect: () => {} },
    { id: "new-role", label: "New Role in this category", icon: "plus", onSelect: () => onNavigate("new-role") },
  ];

  return (
    <Frame header={header}>
      <PageBody gap={8}>
        <DetailsToolbar
          label="Role category actions"
          groups={[{
            id: "record",
            label: "Category",
            items: [
              { id: "edit", label: "Edit Category", icon: "edit", onSelect: () => {} },
              { id: "status", label: active ? "Deactivate" : "Activate", icon: "lock", onSelect: () => setActive((a) => !a) },
            ],
          }]}
          overflow={{
            label: `More actions for ${d.name}`,
            ref: moreRef,
            expanded: moreOpen,
            onSelect: () => setMoreOpen((o) => !o),
          }}
        />
        <Menu
          anchor={moreRef}
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          label={`More actions for ${d.name}`}
          align="start"
          emphasis="strong"
          entries={more}
        />

        <Inline gap={6} wrap>
          {d.stats.map((s) => (
            <Surface key={s.label} pad={8} radius="card" border="default">
              <Stack gap={1}>
                <Text as="span" size="title" weight="bold">{s.value}</Text>
                <Text as="span" size="body-sm" tone="secondary">{s.label}</Text>
              </Stack>
            </Surface>
          ))}
        </Inline>

        <Surface pad={0} radius="card" border="default" className="overflow-hidden">
          <Tabs
            label={`${d.name} sections`}
            items={CATEGORY_DETAIL_TABS.map((t) => ({ id: t, label: t }))}
            value={tab}
            onChange={setTab}
          >
            <Surface pad={10} radius="none">{panel}</Surface>
          </Tabs>
        </Surface>
      </PageBody>

      {rowMenu.menu(`Actions for ${rowMenu.activeId ?? "role"}`, ROLE_ACTIONS)}
    </Frame>
  );
}
