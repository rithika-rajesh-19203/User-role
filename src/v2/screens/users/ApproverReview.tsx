import { useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar, Banner, Button, DescriptionList, Divider, Field, Inline, Modal, Stack, StatusBadge,
  Surface, Text, Textarea,
} from "@canon";
import {
  DEFAULT_CUSTOM_ACCESS_PERIOD, displayToIso, formatAccessPeriod, isoToDisplay,
} from "../../data/approvals";
import type { ApprovalRequest } from "../../data/approvals";
import { APPROVAL_TONE } from "./status";

type Decision = "approve" | "reject" | null;

function draftStart(request: ApprovalRequest) {
  return isoToDisplay(request.accessPeriod.type === "custom" ? request.accessPeriod.startDate : DEFAULT_CUSTOM_ACCESS_PERIOD.startDate);
}
function draftEnd(request: ApprovalRequest) {
  return isoToDisplay(request.accessPeriod.type === "custom" ? request.accessPeriod.endDate : DEFAULT_CUSTOM_ACCESS_PERIOD.endDate);
}

/** A titled section of the review card, with an optional trailing control cluster. */
function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Stack gap={8} className="px-12 py-10">
      {title ? (
        <Inline gap={8} align="start" justify="between">
          <Text as="h3" size="body" weight="semibold">{title}</Text>
          {action}
        </Inline>
      ) : null}
      {children}
    </Stack>
  );
}

/**
 * The approver's review of one pending request. It hands back two parts —
 * the `body`, which the screen puts in the tab panel, and the `footer` (the
 * decision bar v1 pinned to the bottom of the window), which goes in the
 * Frame's footer row. One component owns both because the decision state
 * and the dialogs it opens are shared between them.
 */
export default function ApproverReview({
  request,
  onUpdateRequest,
  onBack,
  children,
}: {
  /** Null when no review is open: the children then get nothing to place. */
  request: ApprovalRequest | null;
  onUpdateRequest: (requestId: string, updates: Partial<ApprovalRequest>) => void;
  onBack: () => void;
  children: (parts: { body: ReactNode; footer: ReactNode }) => ReactNode;
}) {
  const [decision, setDecision] = useState<Decision>(null);
  const [rejReason, setRejReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [startDate, setStartDate] = useState(() => (request ? draftStart(request) : ""));
  const [endDate, setEndDate] = useState(() => (request ? draftEnd(request) : ""));

  //  A different request (or none) starts a fresh review — v1 unmounted the
  //  review on the way out. Adjusted during render rather than in an effect,
  //  so the stale request's drafts are never painted. This component stays
  //  mounted throughout because it wraps the Frame, and the Frame must keep
  //  one position in the tree or the settings bar and rail remount.
  const [forId, setForId] = useState(request?.id ?? null);
  if ((request?.id ?? null) !== forId) {
    setForId(request?.id ?? null);
    setDecision(null);
    setRejReason("");
    setShowModal(false);
    setIsEditingPeriod(false);
    setStartDate(request ? draftStart(request) : "");
    setEndDate(request ? draftEnd(request) : "");
  }

  if (!request) return <>{children({ body: null, footer: null })}</>;

  const startIso = displayToIso(startDate);
  const endIso = displayToIso(endDate);
  const accessPeriodError = !startIso || !endIso
    ? "Start date and end date are required."
    : endIso < startIso
      ? "End date must be on or after the start date."
      : "";

  const pending = request.status === "Pending Approval";
  const period = formatAccessPeriod(request.accessPeriod);

  const saveAccessPeriod = () => {
    if (accessPeriodError) return;
    onUpdateRequest(request.id, { accessPeriod: { type: "custom", startDate: startIso, endDate: endIso } });
    setIsEditingPeriod(false);
  };

  const removeAccessPeriod = () => {
    onUpdateRequest(request.id, { accessPeriod: { type: "no-expiry" } });
    setIsEditingPeriod(false);
  };

  const cancelEdit = () => {
    setStartDate(draftStart(request));
    setEndDate(draftEnd(request));
    setIsEditingPeriod(false);
  };

  const closeDecision = () => {
    setShowModal(false);
    setRejReason("");
    setDecision(null);
  };

  const confirmDecision = () => {
    onUpdateRequest(request.id, {
      status: decision === "approve" ? "Approved" : "Rejected",
      rejectedReason: decision === "reject" ? rejReason.trim() : undefined,
    });
    closeDecision();
  };

  const body = (
    <Stack gap={10}>
      {/* Approve / reject confirmation */}
      <Modal
        open={showModal}
        title={decision === "approve" ? "Approve this request?" : "Reject this request?"}
        width="sm"
        onRequestClose={closeDecision}
        primaryAction={{
          label: "Confirm",
          onSelect: confirmDecision,
          disabled: decision !== "approve" && !rejReason.trim(),
        }}
        secondaryAction={{ label: "Cancel", onSelect: closeDecision }}
      >
        {decision === "approve" ? (
          <Text tone="secondary">
            {request.requestedFor} · {request.access} · {period}
          </Text>
        ) : (
          <Field label="Reason" required>
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                required
                rows={3}
                value={rejReason}
                onChange={(event) => setRejReason(event.target.value)}
                placeholder="Explain the reason for rejection…"
              />
            )}
          </Field>
        )}
      </Modal>

      {/* Header: back link, request ID, status, submitted */}
      <Inline gap={4} className="min-w-0">
          <Button emphasis="tertiary" size="sm" icon="chevron-left" onClick={onBack}>
            User Role Approvals
          </Button>
          <Text as="span" tone="tertiary">·</Text>
          <Text as="h2" weight="semibold">{request.id}</Text>
          <StatusBadge status={APPROVAL_TONE[request.status]}>{request.status}</StatusBadge>
      </Inline>

      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        {/* Who is asking */}
        <Section>
          <Inline gap={8}>
            <Avatar name={request.requestedFor} size="md" />
            <Stack gap={1} className="min-w-0">
              <Text as="h3" size="subheading">{request.requestedFor}</Text>
              <Text tone="secondary">{request.requesterEmail}</Text>
            </Stack>
          </Inline>
        </Section>

        {/* What they are asking for — one label/value list, so every value lines up */}
        <Divider />
        <Section
          title="Request details"
          action={pending ? (
            <Inline gap={4} className="flex-none">
              <Button size="sm" emphasis="secondary" onClick={() => setIsEditingPeriod((value) => !value)}>
                {isEditingPeriod ? "Close" : request.accessPeriod.type === "custom" ? "Edit period" : "Set period"}
              </Button>
              {request.accessPeriod.type === "custom" ? (
                <Button size="sm" emphasis="secondary" intent="danger" onClick={removeAccessPeriod}>Remove</Button>
              ) : null}
            </Inline>
          ) : undefined}
        >
          <DescriptionList
            items={[
              { label: "Current role", value: request.currentRole },
              { label: "Requested role", value: request.access },
              { label: "Access period", value: period },
              ...(request.by !== request.requestedFor ? [{ label: "Requested by", value: request.by }] : []),
              { label: "Submitted", value: request.submitted },
            ]}
          />

          {isEditingPeriod ? (
            <Stack gap={8}>
              <Divider />
              <Inline gap={8} align="start">
                <Stack className="flex-1 min-w-0">
                  <Field
                    label="Start date"
                    format="date"
                    placeholder="DD/MM/YYYY"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    error={!startIso}
                  />
                </Stack>
                <Stack className="flex-1 min-w-0">
                  <Field
                    label="End date"
                    format="date"
                    placeholder="DD/MM/YYYY"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    error={Boolean(accessPeriodError) && Boolean(startIso)}
                  />
                </Stack>
              </Inline>
              {accessPeriodError ? (
                <Text size="caption" tone="danger" role="alert">{accessPeriodError}</Text>
              ) : null}
              <Inline gap={4} justify="end">
                <Button size="sm" emphasis="secondary" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" onClick={saveAccessPeriod} disabled={Boolean(accessPeriodError)}>Save period</Button>
              </Inline>
            </Stack>
          ) : null}
        </Section>

        <Divider />
        <Section title="Reason">
          <Text>{request.reason}</Text>
        </Section>

        {request.status === "Rejected" && request.rejectedReason ? (
          <>
            <Divider />
            <Section title="Rejected reason">
              <Banner tone="danger">{request.rejectedReason}</Banner>
            </Section>
          </>
        ) : null}
      </Surface>
    </Stack>
  );

  const footer = pending ? (
    <Stack gap={0}>
      <Divider />
      <Inline gap={8} justify="between" className="px-10 py-8">
        <Stack gap={1} className="min-w-0">
          <Text weight="medium">{request.requestedFor}</Text>
          <Text size="caption" tone="secondary">{request.access} · {period}</Text>
        </Stack>
        <Inline gap={4} className="flex-none">
          <Button intent="danger" onClick={() => { setDecision("reject"); setShowModal(true); }}>Reject</Button>
          <Button intent="success" onClick={() => { setDecision("approve"); setShowModal(true); }}>Approve</Button>
        </Inline>
      </Inline>
    </Stack>
  ) : null;

  return <>{children({ body, footer })}</>;
}
