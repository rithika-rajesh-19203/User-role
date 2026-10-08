import { Avatar, Banner, Button, Divider, Icon, Inline, SidePanel, Stack, Text } from "@canon";
import { CURRENT_ROLE, ME, ME_USER_ID, ORG_ID } from "../data/people";

export interface UserPanelProps {
  open: boolean;
  onClose: () => void;
  onOpenRequestAccess: () => void;
}

/**
 * v1's UserPanel: profile, account links, the current role with a way to
 * request another, the plan, help, and support contacts.
 */
export default function UserPanel({ open, onClose, onOpenRequestAccess }: UserPanelProps) {
  return (
    <SidePanel open={open} onClose={onClose} title="Account">
      <Stack gap={0}>
        {/* Profile */}
        <Stack gap={6} className="p-10">
          <Inline gap={6} align="start">
            <Avatar name={ME.name} size="md" admin={Boolean(ME.badge)} />
            <Stack gap={1} className="min-w-0">
              <Text weight="semibold" truncate>{ME.name}</Text>
              <Text size="body-sm" tone="secondary" truncate>{ME.email}</Text>
              <Text size="body-sm" tone="tertiary">User ID: {ME_USER_ID} · Org ID: {ORG_ID}</Text>
            </Stack>
          </Inline>
          <Inline justify="between">
            <Button emphasis="tertiary" size="sm">My Account</Button>
            <Button emphasis="tertiary" size="sm" intent="danger">Sign Out</Button>
          </Inline>
        </Stack>

        <Divider />

        {/* Current role */}
        <Inline gap={6} justify="between" className="px-10 py-6">
          <Inline gap={4}>
            <Icon name="admin" size="md" tone="primary" />
            <Stack gap={0}>
              <Text size="overline" tone="tertiary">My Current Role</Text>
              <Text weight="semibold">{CURRENT_ROLE}</Text>
            </Stack>
          </Inline>
          <Button emphasis="tertiary" size="sm" onClick={onOpenRequestAccess}>Request Role</Button>
        </Inline>

        <Divider />

        {/* Plan notice */}
        <Stack gap={0} className="px-10 py-6">
          <Banner tone="info">This organization is in the Premium plan.</Banner>
        </Stack>

        <Divider />

        {/* Help tiles */}
        <Inline gap={6} className="px-10 py-8">
          <Button emphasis="secondary" icon="documents" className="flex-1">Help Documents</Button>
          <Button emphasis="secondary" icon="search" className="flex-1">Explore Features</Button>
        </Inline>

        <Divider />

        {/* Need Assistance? */}
        <Stack gap={6} className="px-10 py-8">
          <Text as="h3" size="body" weight="bold">Need Assistance?</Text>

          <Inline gap={6} align="start">
            {/* CANON GAP — no chat glyph on the icon roster. */}
            <Icon name="users" size="md" tone="muted" />
            <Stack gap={0}>
              <Inline>
                <Button emphasis="tertiary" size="sm" iconRight="chevron-right">Chat with our experts</Button>
              </Inline>
              <Text size="body-sm" tone="tertiary">(Mon to Fri 10:00AM – 7:00PM)</Text>
            </Stack>
          </Inline>

          <Inline gap={6}>
            <Icon name="mail" size="md" tone="muted" />
            <Button emphasis="tertiary" size="sm" iconRight="chevron-right">Send an email</Button>
          </Inline>

          <Inline gap={6} align="start">
            {/* `phone` is on the roster without geometry, so it renders the
                canon's dashed placeholder until the glyph is exported. */}
            <Icon name="phone" size="md" tone="muted" />
            <Stack gap={1}>
              <Inline gap={3} wrap>
                <Text as="span" size="body-sm" weight="medium">Talk to us</Text>
                <Text as="span" size="body-sm" tone="tertiary">(Mon – Fri · 9:00 AM – 7:00 PM · Toll Free)</Text>
              </Inline>
              <Text size="body-sm">
                India –{" "}
                <Text as="a" href="tel:18004196933" size="body-sm" weight="semibold" tone="link">18004196933</Text>
              </Text>
            </Stack>
          </Inline>
        </Stack>

        <Divider />

        <Text size="body-sm" tone="tertiary" className="px-10 py-8">
          For security reasons, this panel auto-closes when you navigate.
        </Text>
      </Stack>
    </SidePanel>
  );
}
