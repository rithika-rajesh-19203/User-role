import { useRef, useState } from "react";
import {
  Banner, Field, Icon, Inline, Modal, RadioGroup, Segmented, Select, Stack, Text, Textarea,
} from "@canon";
import { ALL_ROLES, ME, ROLE_SUMMARIES } from "../data/people";
import type { UserRow } from "../data/people";
import EmailSuggestions from "./EmailSuggestions";

type RequestFor = "myself" | "others";
type Validity = "no-expiry" | "custom";
type Errors = Partial<Record<"fullName" | "email" | "role" | "reason", string>>;

export interface RequestRoleModalProps {
  open: boolean;
  onClose: () => void;
  /** Called once the request is in — App closes the modal and opens My Role Requests. */
  onSubmitted: () => void;
}

const ROLE_OPTIONS = ALL_ROLES.map((role) => ({ value: role, label: role }));

/** v1's defaults for the custom period, in the canon date field's DD/MM/YYYY. */
const DEFAULT_START = "03/09/2026";
const DEFAULT_END = "30/09/2026";

/**
 * v1's RequestModal, on the canon `Modal`: who the role is for (myself or
 * someone else, with email suggestions), the role and its summary, the reason,
 * and how long the access lasts. Submit validates, then shows the confirmation;
 * Done hands over to App.
 */
export default function RequestRoleModal({ open, onClose, onSubmitted }: RequestRoleModalProps) {
  const [requestFor, setRequestFor] = useState<RequestFor>("myself");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [validity, setValidity] = useState<Validity>("no-expiry");
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  //  Every opening is a fresh request. Reset while rendering rather than in an
  //  effect, so the previous request never paints for a frame.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRequestFor("myself");
      setFullName("");
      setEmail("");
      setSuggesting(false);
      setRole("");
      setReason("");
      setValidity("no-expiry");
      setStart(DEFAULT_START);
      setEnd(DEFAULT_END);
      setErrors({});
      setSubmitted(false);
    }
  }

  const clear = (key: keyof Errors) => setErrors((prev) => ({ ...prev, [key]: undefined }));
  const resolvedName = requestFor === "myself" ? ME.name : fullName.trim();

  const keepSuggestions = () => window.clearTimeout(hideTimer.current);
  const dropSuggestions = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setSuggesting(false), 100);
  };

  function pick(user: UserRow) {
    setFullName(user.name);
    setEmail(user.email);
    setErrors((prev) => ({ ...prev, fullName: undefined, email: undefined }));
    keepSuggestions();
    setSuggesting(false);
  }

  function submit() {
    const next: Errors = {};
    if (requestFor === "others" && !fullName.trim()) next.fullName = "Required";
    if (requestFor === "others" && !email.trim()) next.email = "Required";
    if (!role) next.role = "Required";
    if (!reason.trim()) next.reason = "Required";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <Modal
        open={open}
        title="Role request submitted"
        width="sm"
        onRequestClose={onSubmitted}
        primaryAction={{ label: "Done", onSelect: onSubmitted }}
      >
        <Stack gap={6} align="center">
          <Icon name="check-circle" size="xl" tone="success" />
          <Text weight="semibold">Role request submitted</Text>
          <Text tone="secondary">
            <Text as="span" weight="medium">{role}</Text> requested for{" "}
            <Text as="span" weight="medium">{resolvedName || "selected user"}</Text>.
          </Text>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Request Role"
      width="md"
      onRequestClose={onClose}
      primaryAction={{ label: "Submit", onSelect: submit }}
      secondaryAction={{ label: "Cancel", onSelect: onClose }}
    >
      <Stack gap={10}>
        <Stack gap={2}>
          <Text size="overline" tone="tertiary">Role Access</Text>
          <Text tone="secondary">
            Choose who needs access, the role to assign, and how long the access should stay active.
          </Text>
        </Stack>

        <RadioGroup
          label="Request For"
          required
          value={requestFor}
          onChange={(next) => {
            setRequestFor(next as RequestFor);
            setSuggesting(false);
            setErrors((prev) => ({ ...prev, fullName: undefined, email: undefined }));
          }}
          options={[
            { value: "myself", label: "Myself" },
            { value: "others", label: "Others" },
          ]}
        />

        {requestFor === "others" ? (
          <Stack gap={6}>
            <Field
              label="Full Name"
              required
              value={fullName}
              placeholder="Enter full name"
              error={Boolean(errors.fullName)}
              message={errors.fullName}
              onChange={(e) => { setFullName(e.target.value); clear("fullName"); }}
            />
            <Stack gap={2}>
              <Field
                label="Email Address"
                required
                type="email"
                autoComplete="off"
                value={email}
                placeholder="Enter email address"
                error={Boolean(errors.email)}
                message={errors.email}
                onFocus={() => { keepSuggestions(); setSuggesting(true); }}
                onBlur={dropSuggestions}
                onChange={(e) => { setEmail(e.target.value); setSuggesting(true); clear("email"); }}
              />
              {suggesting ? (
                <EmailSuggestions query={email} onSelect={pick} onFocus={keepSuggestions} onBlur={dropSuggestions} />
              ) : null}
            </Stack>
          </Stack>
        ) : null}

        <Stack gap={4}>
          <Field label="Role" required error={Boolean(errors.role)} message={errors.role}>
            {({ id, required, error, describedBy }) => (
              <Select
                id={id}
                required={required}
                error={error}
                ariaDescribedBy={describedBy}
                options={ROLE_OPTIONS}
                value={role}
                placeholder="Select a role…"
                onChange={(next) => { setRole(next); clear("role"); }}
              />
            )}
          </Field>
          {role && ROLE_SUMMARIES[role] ? (
            <Banner tone="info">
              <Text as="span" size="body-sm" weight="semibold" tone="inherit">Role summary: </Text>
              {ROLE_SUMMARIES[role]}
            </Banner>
          ) : null}
        </Stack>

        <Field label="Reason" required error={Boolean(errors.reason)} message={errors.reason}>
          {({ id, required, error, describedBy }) => (
            <Textarea
              id={id}
              rows={2}
              aria-required={required || undefined}
              aria-describedby={describedBy}
              error={error}
              value={reason}
              placeholder="Why is this role needed?"
              onChange={(e) => { setReason(e.target.value); clear("reason"); }}
            />
          )}
        </Field>

        <Stack gap={4}>
          <Text as="span" weight="medium">Access validity</Text>
          <Inline>
            <Segmented
              label="Access validity"
              value={validity}
              onChange={(next) => setValidity(next as Validity)}
              options={[
                { value: "no-expiry", label: "No expiry" },
                { value: "custom", label: "Custom period" },
              ]}
            />
          </Inline>
          {validity === "custom" ? (
            <Stack gap={6}>
              <Inline gap={6} align="start">
                <Field label="Start" format="date" placeholder="DD/MM/YYYY" value={start}
                  onChange={(e) => setStart(e.target.value)} className="flex-1 min-w-0" />
                <Field label="End" format="date" placeholder="DD/MM/YYYY" value={end}
                  onChange={(e) => setEnd(e.target.value)} className="flex-1 min-w-0" />
              </Inline>
              <Banner tone="info">
                After the custom period ends, the user will automatically revert to their previous role.
              </Banner>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Modal>
  );
}
