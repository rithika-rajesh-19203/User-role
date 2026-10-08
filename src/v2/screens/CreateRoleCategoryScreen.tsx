import { useState } from "react";
import {
  Banner, Button, Checkbox, DescriptionList, FormRow, FormSection, InputField, Inline,
  RadioGroup, Stack, StatusBadge, Surface, Table, Text, Textarea, Wizard,
} from "@canon";
import type { Step, TableColumn } from "@canon";
import Frame from "../Frame";
import type { ScreenProps } from "../types";
import { APPROVER_OPTIONS, CATEGORY_MODULES, CATEGORY_STEPS } from "../data/roles";
import type { Approver, RecordStatus } from "../data/roles";
import ApproversStep from "./roles/ApproversStep";
import { BackLink, FormFooter, PageBody, ResultState } from "./roles/parts";

const LAST = CATEGORY_STEPS.length - 1;

/**
 * SETTINGS → ROLE CATEGORIES → NEW ROLE CATEGORY. A four-step wizard — Basic
 * Details, Base Permissions, Approvers, Review & Create — and a success state
 * that offers the three next places to go.
 */
export default function CreateRoleCategoryScreen({ onNavigate }: ScreenProps) {
  const [step, setStep] = useState(0);
  const [catName, setCatName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<RecordStatus>("Active");
  const [nameError, setNameError] = useState("");
  const [modules, setModules] = useState<Set<string>>(new Set());
  const [approvers, setApprovers] = useState<Approver[]>([APPROVER_OPTIONS[0], APPROVER_OPTIONS[1]]);
  const [confirmed, setConfirmed] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <Frame header={<Text as="h1" size="heading" weight="medium">New Role Category</Text>}>
        <PageBody>
          <ResultState
            icon="check-circle"
            tone="success"
            title="Role Category created successfully"
            message="You can now create roles and assign them to this category."
          >
            <Button onClick={() => onNavigate("new-role")}>Create New Role</Button>
            <Button emphasis="secondary" onClick={() => onNavigate("role-category-detail")}>View Role Category</Button>
            <Button emphasis="secondary" onClick={() => onNavigate("role-categories")}>Go to Role Categories</Button>
          </ResultState>
        </PageBody>
      </Frame>
    );
  }

  function next() {
    if (step === 0 && !catName.trim()) {
      setNameError("Category Name is required.");
      return;
    }
    setNameError("");
    if (step < LAST) setStep((s) => s + 1);
    else setSuccess(true);
  }

  const steps: Step[] = CATEGORY_STEPS.map((label, i) => ({
    id: String(i),
    label,
    state: i < step ? "completed" : i === step ? "current" : "upcoming",
  }));

  const header = (
    <Stack gap={8} className="flex-1 min-w-0">
      <Stack gap={4} align="start">
        <BackLink label="Back to Role Categories" onSelect={() => onNavigate("role-categories")} />
        <Stack gap={1}>
          <Text as="h1" size="heading" weight="medium">New Role Category</Text>
          <Text tone="secondary">Define the permission boundary and approvers for this category.</Text>
        </Stack>
      </Stack>
      <Wizard steps={steps} label="New role category progress" onStepClick={(id) => setStep(Number(id))} />
    </Stack>
  );

  const blocked = (step === 2 && approvers.length === 0) || (step === LAST && !confirmed);
  const footer = (
    <FormFooter
      trailing={(
        <Button emphasis="tertiary" onClick={() => onNavigate("role-categories")}>Cancel</Button>
      )}
    >
      <Button onClick={next} disabled={blocked}>{step === LAST ? "Create Role Category" : "Continue"}</Button>
      {step > 0 ? <Button emphasis="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button> : null}
      <Button emphasis="secondary" onClick={() => setDraftSaved(true)}>Save as Draft</Button>
    </FormFooter>
  );

  //  ── Step 2's module list ────────────────────────────────────────────────
  const moduleColumns: TableColumn<string>[] = [
    { id: "module", header: "Modules", cell: (m) => <Text as="span" weight="medium">{m}</Text> },
    {
      id: "included", header: "Included", align: "end",
      cell: (m) => (modules.has(m) ? <StatusBadge status="accepted">Included</StatusBadge> : null),
    },
  ];

  //  ── Step 4's summary ────────────────────────────────────────────────────
  const picked = [...modules];
  const review = [
    {
      title: "Basic Details",
      step: 0,
      rows: [
        ["Category Name", catName || "Finance Operations"],
        ["Description", desc || "Finance and accounting-related access"],
        ["Status", status],
      ],
    },
    {
      title: "Base Permissions",
      step: 1,
      rows: [
        ["Modules selected", picked.length > 0 ? `${picked.length} modules` : "All modules"],
        ["Included modules", picked.length > 0 ? picked.join(", ") : CATEGORY_MODULES.join(", ")],
      ],
    },
    {
      title: "Approvers",
      step: 2,
      rows: [
        ["Approvers", approvers.length > 0 ? approvers.map((a) => a.name).join(", ") : "None"],
        ["Approval flow", "Request → Review → Approved / Rejected"],
      ],
    },
  ];

  return (
    <Frame header={header} footer={footer}>
      <PageBody>
        {draftSaved ? (
          <Banner tone="success" onDismiss={() => setDraftSaved(false)}>
            Saved as draft. You can finish this role category later.
          </Banner>
        ) : null}

        {step === 0 ? (
          <Stack gap={12}>
            <Banner tone="info">
              Roles created under this category can only use permissions from the selected modules. Role permissions cannot exceed this boundary.
            </Banner>
            {nameError ? (
              <Banner tone="danger">{nameError} Enter a name for this category to continue.</Banner>
            ) : null}
            <FormSection last>
              <FormRow label="Category Name" required error={nameError || undefined}>
                {(p) => (
                  <InputField
                    id={p.id}
                    value={catName}
                    placeholder="e.g. Finance Operations"
                    error={p.error}
                    aria-required
                    aria-describedby={p.describedBy}
                    onChange={(e) => { setCatName(e.target.value); setNameError(""); }}
                  />
                )}
              </FormRow>
              <FormRow label="Description (optional)">
                {(p) => (
                  <Textarea
                    id={p.id}
                    rows={3}
                    placeholder="Describe the purpose of this role category"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                )}
              </FormRow>
              <FormRow label="Status">
                {() => (
                  <RadioGroup
                    label="Status"
                    hideLabel
                    value={status}
                    onChange={(v) => setStatus(v as RecordStatus)}
                    options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
                  />
                )}
              </FormRow>
            </FormSection>
          </Stack>
        ) : null}

        {step === 1 ? (
          <Stack gap={8}>
            <Stack gap={2}>
              <Text as="h2" size="subheading">Set Base Permissions</Text>
              <Text tone="secondary">Select the modules that roles in this category will have access to.</Text>
            </Stack>
            <Banner tone="warning">
              Base permissions define the maximum access available to all roles under this category. Roles cannot access modules not selected here.
            </Banner>
            <Table
              caption="Modules available to this category"
              columns={moduleColumns}
              rows={CATEGORY_MODULES}
              rowKey={(m) => m}
              selection={{
                selected: modules,
                onChange: setModules,
                allLabel: "Select all modules",
                rowLabel: (m) => `Include ${m}`,
              }}
            />
            <Text size="body-sm" tone="tertiary">
              {modules.size} of {CATEGORY_MODULES.length} modules selected
            </Text>
          </Stack>
        ) : null}

        {step === 2 ? <ApproversStep selected={approvers} onChange={setApprovers} /> : null}

        {step === LAST ? (
          <Stack gap={8}>
            <Text as="h2" size="subheading">Review &amp; Create</Text>
            {review.map((card) => (
              <Surface key={card.title} pad={10} radius="card" border="default">
                <Stack gap={6}>
                  <Inline justify="between">
                    <Text as="h3" size="body" weight="semibold">{card.title}</Text>
                    <Button emphasis="tertiary" size="sm" icon="edit" onClick={() => setStep(card.step)}>Edit</Button>
                  </Inline>
                  <DescriptionList
                    gap={4}
                    items={card.rows.map(([label, value]) => ({
                      label,
                      value: <Text as="span" weight="medium">{value}</Text>,
                    }))}
                  />
                </Stack>
              </Surface>
            ))}
            <Surface tone="sunken" pad={8} radius="md" border="default">
              <Checkbox
                label="I understand that roles under this category cannot access modules outside the selected base permission set."
                selection={confirmed ? "checked" : "unchecked"}
                onSelectionChange={(s) => setConfirmed(s === "checked")}
              />
            </Surface>
          </Stack>
        ) : null}
      </PageBody>
    </Frame>
  );
}
