import { useState } from "react";
import {
  Checkbox, Divider, Field, Icon, Inline, Modal, Select, Stack, Surface, Text, Textarea,
} from "@canon";
import { ALL_ROLES } from "../../data/people";

/**
 * Invite User — email, role, an optional message, and which role requests the
 * new user may submit once they join. "On behalf of others" discloses a third
 * option, and clearing it clears that option too.
 */
export default function InviteUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Accountant");
  const [message, setMessage] = useState("");
  const [canSelf, setCanSelf] = useState(true);
  const [canOthers, setCanOthers] = useState(false);
  const [canNewUsers, setCanNewUsers] = useState(false);

  function setOthers(next: boolean) {
    setCanOthers(next);
    if (!next) setCanNewUsers(false);
  }

  const noneActive = !canSelf && !canOthers;

  return (
    <Modal
      open={open}
      title="Invite User"
      width="md"
      onRequestClose={onClose}
      primaryAction={{ label: "Send Invite", onSelect: onClose }}
      secondaryAction={{ label: "Cancel", onSelect: onClose }}
    >
      <Stack gap={10}>
        <Field
          label="Email Address"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="user@company.com"
          type="email"
        />

        <Field label="Assign Role">
          {({ id }) => (
            <Select
              id={id}
              options={ALL_ROLES.map((r) => ({ value: r, label: r }))}
              value={role}
              onChange={setRole}
            />
          )}
        </Field>

        <Field label="Personal Message (optional)">
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a message to the invitation email…"
            />
          )}
        </Field>

        <Stack gap={4}>
          <Stack gap={1}>
            <Text size="body" weight="medium">Role Request Permissions</Text>
            <Text size="caption" tone="tertiary">Control what role requests this user can submit after joining.</Text>
          </Stack>

          <Surface pad={0} radius="lg" border="default" className="overflow-hidden">
            <Surface pad={8} radius="none">
              <Checkbox
                label="For themselves"
                description="They can submit role requests for their own account."
                selection={canSelf ? "checked" : "unchecked"}
                onSelectionChange={(next) => setCanSelf(next === "checked")}
              />
            </Surface>
            <Divider />
            <Surface pad={8} radius="none">
              <Checkbox
                label="On behalf of others"
                description="They can submit role requests for existing users in the organization."
                selection={canOthers ? "checked" : "unchecked"}
                onSelectionChange={(next) => setOthers(next === "checked")}
              />
            </Surface>
            {canOthers ? (
              <>
                <Divider />
                <Surface tone="sunken" pad={8} radius="none" className="ps-20">
                  <Checkbox
                    label="Including users not yet in the organization"
                    description="They can enter a name and email for a new person. Once the role is approved, an invite will be sent automatically."
                    selection={canNewUsers ? "checked" : "unchecked"}
                    onSelectionChange={(next) => setCanNewUsers(next === "checked")}
                  />
                </Surface>
              </>
            ) : null}
          </Surface>

          {noneActive ? (
            <Inline gap={3}>
              <Icon name="info" size="xs" tone="subtle" />
              <Text size="caption" tone="tertiary">
                No options selected — this user will not be able to submit any role requests.
              </Text>
            </Inline>
          ) : null}
        </Stack>
      </Stack>
    </Modal>
  );
}
