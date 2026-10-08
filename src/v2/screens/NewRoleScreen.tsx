import { useState } from "react";
import {
  Accordion, AccordionItem, Banner, Button, Checkbox, FormRow, FormSection, InputField,
  Inline, Select, Stack, Surface, Table, Text, Textarea, Wizard,
} from "@canon";
import type { CheckboxSelection, Step, TableColumn } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import {
  INITIAL_PERMISSIONS, MODULE_PARTICULARS, PERMISSION_COLUMNS, ROLE_MODULES, ROLE_TYPES,
} from "../data/roles";
import type { PermissionColumn, PermissionRow } from "../data/roles";
import { FormFooter, PageBody, ResultState, SearchField } from "./roles/parts";

/** The CRUD columns FULL summarises. */
const CRUD = PERMISSION_COLUMNS.filter((c) => c !== "FULL");
const key = (module: string, row: string, col: PermissionColumn) => `${module}:${row}:${col}`;

/**
 * SETTINGS → ROLES → NEW ROLE. Two steps: General (details plus the module
 * permission grid) and Segmented Access Control, then a created state.
 */
export default function NewRoleScreen({ onNavigate }: ScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [roleName, setRoleName] = useState("");
  const [roleType, setRoleType] = useState<string>("User");
  const [desc, setDesc] = useState("");
  const [apiOnly, setApiOnly] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean>>(INITIAL_PERMISSIONS);
  const [subPerms, setSubPerms] = useState<Record<string, boolean>>({});
  const [nameError, setNameError] = useState(false);
  const [success, setSuccess] = useState(false);

  const title = <Text as="h1" size="heading" weight="medium">New Role</Text>;

  if (success) {
    return (
      <Frame header={title}>
        <PageBody>
          <ResultState
            icon="check-circle"
            tone="success"
            title={`Role "${roleName}" created`}
            message="The role is now available to assign to users."
          >
            <Button onClick={() => onNavigate("roles")}>Go to Roles</Button>
          </ResultState>
        </PageBody>
      </Frame>
    );
  }

  function proceed() {
    if (!roleName.trim()) { setNameError(true); return; }
    if (step === 1) { setStep(2); return; }
    setSuccess(true);
  }

  //  FULL is the row's summary: ticked when every CRUD box is, mixed when some
  //  are, and toggling it sets the whole row. v1 declared exactly these helpers
  //  (isRowChecked / isRowPartial / toggleRow) but left FULL as a fifth
  //  independent box; this wires them up.
  function rowState(module: string, row: string): CheckboxSelection {
    const on = CRUD.filter((c) => perms[key(module, row, c)]).length;
    return on === CRUD.length ? "checked" : on === 0 ? "unchecked" : "indeterminate";
  }
  function setRow(module: string, row: string, checked: boolean) {
    setPerms((p) => {
      const next = { ...p };
      PERMISSION_COLUMNS.forEach((c) => { next[key(module, row, c)] = checked; });
      return next;
    });
  }
  function toggle(module: string, row: string, col: PermissionColumn, checked: boolean) {
    setPerms((p) => {
      const next = { ...p, [key(module, row, col)]: checked };
      next[key(module, row, "FULL")] = CRUD.every((c) => next[key(module, row, c)]);
      return next;
    });
  }

  const gridColumns = (module: string): TableColumn<PermissionRow>[] => [
    {
      id: "particulars", header: "Particulars",
      cell: (r) => {
        const subKey = `${module}:${r.name}:sub`;
        return (
          <Stack gap={3}>
            <Text as="span" weight="medium">{r.name}</Text>
            {r.sub ? (
              <Checkbox
                label={r.sub}
                selection={subPerms[subKey] ? "checked" : "unchecked"}
                onSelectionChange={(s) => setSubPerms((p) => ({ ...p, [subKey]: s === "checked" }))}
              />
            ) : null}
          </Stack>
        );
      },
    },
    ...PERMISSION_COLUMNS.map((col): TableColumn<PermissionRow> => ({
      id: col,
      header: col,
      cell: (r) => (
        <Checkbox
          ariaLabel={`${col} access to ${module} ${r.name}`}
          selection={col === "FULL" ? rowState(module, r.name) : perms[key(module, r.name, col)] ? "checked" : "unchecked"}
          onSelectionChange={(s) => (col === "FULL"
            ? setRow(module, r.name, s === "checked")
            : toggle(module, r.name, col, s === "checked"))}
        />
      ),
    })),
    {
      id: "others", header: "Others",
      cell: () => <Button emphasis="tertiary" size="sm">More Permissions</Button>,
    },
  ];

  const modules = ROLE_MODULES.filter((m) => m.toLowerCase().includes(moduleSearch.trim().toLowerCase()));

  const steps: Step[] = [
    { id: "general", label: "General", state: step === 1 ? "current" : "completed" },
    { id: "segmented", label: "Segmented Access Control", state: step === 2 ? "current" : "upcoming" },
  ];

  const header = (
    <Inline justify="between" align="start" grow>
      <Stack gap={8}>
        {title}
        <Wizard steps={steps} label="New role progress" onStepClick={() => setStep(1)} />
      </Stack>
      <Button emphasis="tertiary" icon="close" label="Close and return to Roles" onClick={() => onNavigate("roles")} />
    </Inline>
  );

  const footer = (
    <FormFooter>
      <Button onClick={proceed}>{step === 1 ? "Proceed" : "Create Role"}</Button>
      <Button emphasis="secondary" onClick={() => (step === 1 ? onNavigate("roles") : setStep(1))}>
        {step === 1 ? "Cancel" : "Back"}
      </Button>
    </FormFooter>
  );

  return (
    <Frame header={header} footer={footer}>
      {step === 1 ? (
        <PageBody>
          {nameError ? (
            <Banner tone="danger" onDismiss={() => setNameError(false)}>
              Role Name is required. Enter a name for this role to continue.
            </Banner>
          ) : null}

          <Stack gap={0}>
            <FormSection dividerGap="tight">
              <FormRow label="Role Name" required error={nameError ? "Role Name is required." : undefined}>
                {(p) => (
                  <InputField
                    id={p.id}
                    value={roleName}
                    autoFocus
                    error={p.error}
                    aria-required
                    aria-describedby={p.describedBy}
                    onChange={(e) => { setRoleName(e.target.value); setNameError(false); }}
                  />
                )}
              </FormRow>
              <FormRow label="Role Type" required>
                {(p) => (
                  <Select
                    id={p.id}
                    required
                    value={roleType}
                    onChange={setRoleType}
                    options={ROLE_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                )}
              </FormRow>
              <FormRow label="Description">
                {(p) => (
                  <Textarea
                    id={p.id}
                    rows={4}
                    maxLength={500}
                    counter
                    placeholder="Max. 500 characters"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                )}
              </FormRow>
              <Checkbox
                label="Users in this role can access Rithika ERP only via API."
                selection={apiOnly ? "checked" : "unchecked"}
                onSelectionChange={(s) => setApiOnly(s === "checked")}
              />
            </FormSection>
          </Stack>

          <Stack gap={8}>
            <Inline justify="between">
              <Text as="h2" size="subheading">Define Role Permission</Text>
              <SearchField value={moduleSearch} onChange={setModuleSearch} placeholder="Search modules" />
            </Inline>
            {modules.length === 0 ? (
              <Text tone="secondary">No modules match your search.</Text>
            ) : (
              <Accordion group="role-modules">
                {modules.map((m) => (
                  <AccordionItem
                    key={m}
                    title={m}
                    chevron="leading"
                    count={(MODULE_PARTICULARS[m] ?? []).length}
                    countLabel="permission groups"
                    defaultOpen={m === "Contacts"}
                  >
                    <Table
                      caption={`${m} permissions`}
                      placement="page"
                      columns={gridColumns(m)}
                      rows={MODULE_PARTICULARS[m] ?? []}
                      rowKey={(r) => r.name}
                    />
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Stack>
        </PageBody>
      ) : (
        <PageBody gap={8}>
          <Stack gap={2}>
            <Text as="h2" size="subheading">Segmented Access Control</Text>
            <Text tone="secondary">Define which data segments users in this role can access.</Text>
          </Stack>
          <Surface tone="sunken" pad={12} radius="lg" border="default">
            <Stack gap={4} align="center">
              <Text tone="tertiary">No segmented access rules configured for this role.</Text>
              <Button emphasis="tertiary" icon="plus">Add Segment Rule</Button>
            </Stack>
          </Surface>
        </PageBody>
      )}
    </Frame>
  );
}
