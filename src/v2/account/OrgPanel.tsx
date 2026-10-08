import { Button, Divider, Icon, Inline, SidePanel, Stack, Surface, Text } from "@canon";
import { CURRENT_ROLE, MY_ROLES, ORG_ID, ORG_NAME } from "../data/people";

export interface OrgPanelProps {
  open: boolean;
  onClose: () => void;
  onOpenMyRoleRequests: () => void;
}

/** v1's OrgPanel: the organization, a way to switch it, and the user's roles in it. */
export default function OrgPanel({ open, onClose, onOpenMyRoleRequests }: OrgPanelProps) {
  return (
    <SidePanel open={open} onClose={onClose} title="Organization">
      <Stack gap={0}>
        <Stack gap={6} className="p-10">
          <Inline gap={6}>
            <Surface tone="sunken" border="default" radius="lg" pad={5} className="flex-none">
              <Icon name="organization" size="lg" tone="muted" />
            </Surface>
            <Stack gap={1} className="min-w-0">
              <Text weight="semibold" truncate>{ORG_NAME}</Text>
              <Text size="body-sm" tone="tertiary">Organization ID: {ORG_ID}</Text>
            </Stack>
          </Inline>
          <Inline>
            <Button emphasis="tertiary" icon="refresh">Switch Organization</Button>
          </Inline>
        </Stack>

        <Divider />

        <Stack gap={6} className="p-10">
          <Inline justify="between">
            <Text size="overline" tone="tertiary">My Roles</Text>
            <Button emphasis="tertiary" size="sm" onClick={onOpenMyRoleRequests}>My Role Request</Button>
          </Inline>

          <Stack gap={2}>
            {MY_ROLES.map(({ name, expiry }) => {
              const active = name === CURRENT_ROLE;
              return (
                //  The active role is `surface/hover`, not `surface/selected` —
                //  the canon records selected at 1.02:1 in Dark.
                <Surface key={name} tone={active ? "hover" : "default"} border={active ? "strong" : "default"} radius="md" pad={6}>
                  <Inline gap={6} justify="between">
                    <Stack gap={1} className="min-w-0">
                      <Text weight={active ? "semibold" : "regular"} truncate>{name}</Text>
                      <Text size="body-sm" tone="tertiary">{expiry}</Text>
                    </Stack>
                    {active ? <Icon name="check-circle" size="md" tone="primary" label="Active role" /> : null}
                  </Inline>
                </Surface>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </SidePanel>
  );
}
