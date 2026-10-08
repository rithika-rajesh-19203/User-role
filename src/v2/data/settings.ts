import type { SettingsSection } from '@canon';

/**
 * The settings directory. Application data, not design data — the canon owns how
 * a card looks, this owns which destinations exist and how they group.
 *
 * The `tone` on each group is CATEGORICAL, and that is worth restating here
 * because it is the thing most likely to be "corrected" by someone reading the
 * data alone: Taxes is red because it is a category, not because anything is
 * wrong, and Setup is orange for the same reason. Nothing on this page has a
 * status. The mapping is ZF-SETTINGS-PAGE.md §4's table verbatim.
 */

const link = (label: string) => ({
  id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  label,
  href: `#/settings/${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
});

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'global',
    title: 'Organization Settings',
    cards: [
      {
        id: 'organization',
        groups: [{
          id: 'organization', title: 'Organization', tone: 'green', icon: 'organization',
          links: ['Profile', 'Branding', 'Custom Domain', 'Locations', 'Networking',
            'AI Integration', 'Manage Subscription'].map(link),
        }],
      },
      {
        //  Two groups in one card — the only stacked card on the page, and the
        //  reason the card is a container rather than just a group with a border.
        id: 'users',
        groups: [
          {
            id: 'users', title: 'Users & Roles', tone: 'red', icon: 'users',
            //  Role Categories is its own leaf in v2 — v1 reached it only from Roles.
            links: ['Users', 'Roles', 'Role Categories', 'User Preferences'].map(link),
          },
          {
            id: 'taxes', title: 'Taxes & Compliance', tone: 'blue', icon: 'tax',
            links: ['Taxes', 'Direct Taxes', 'e-Way Bills', 'e-Invoicing',
              'MSME Settings'].map(link),
          },
        ],
      },
      {
        id: 'setup',
        groups: [{
          id: 'setup', title: 'Setup & Configurations', tone: 'orange', icon: 'preference',
          links: ['General', 'Currencies', 'Payment Terms', 'Opening Balances', 'Reminders',
            'Customer Portal', 'Vendor Portal', 'Loyalty Program'].map(link),
        }],
      },
      {
        id: 'customization',
        groups: [{
          id: 'customization', title: 'Customization', tone: 'orange', icon: 'customization',
          links: ['Transaction Number Series', 'PDF Templates', 'Email Notifications',
            'SMS Notifications', 'Reporting Tags', 'Web Tabs', 'Digital Signature',
            'WhatsApp Templates'].map(link),
        }],
      },
      {
        id: 'automation',
        groups: [{
          id: 'automation', title: 'Automation', tone: 'red', icon: 'automation',
          links: ['Workflow Rules', 'Workflow Actions', 'Workflow Logs', 'Schedules'].map(link),
        }],
      },
    ],
  },
  {
    id: 'module',
    title: 'Module Settings',
    cards: [
      {
        id: 'general',
        groups: [{
          id: 'general', title: 'General', tone: 'green', icon: 'general',
          links: ['Customers and Vendors', 'Items', 'Accountant', 'Tasks', 'Projects',
            'Timesheet'].map(link),
        }],
      },
      {
        //  TWO GROUPS IN ONE CARD, and the pairing is the mock's, not a
        //  space-filling accident: online payments are how inventory leaves and
        //  arrives, so they read as a continuation of the same column rather
        //  than a sixth card. `SettingsPage` renders a card's groups stacked,
        //  which is the whole reason `cards` and `groups` are separate levels.
        id: 'inventory',
        groups: [
          {
            id: 'inventory', title: 'Inventory', tone: 'red', icon: 'inventory',
            links: ['Units of Measurement', 'Assemblies', 'Inventory Adjustments',
              'Stock Counts', 'Picklists', 'Packages', 'Shipments', 'Transfer Orders',
              'Move Orders'].map(link),
          },
          {
            id: 'online-payments', title: 'Online Payments', tone: 'orange', icon: 'online-payment',
            links: ['Customer Payments', 'Vendor Payments'].map(link),
          },
        ],
      },
      {
        id: 'sales',
        groups: [{
          id: 'sales', title: 'Sales', tone: 'green', icon: 'sales',
          links: ['Estimates', 'Retainer Invoices', 'Sales Orders', 'Delivery Challans',
            'Invoices', 'Recurring Invoices', 'Sales Receipts', 'Payments Received',
            'Sales Returns', 'Credit Notes', 'Delivery Notes', 'Packing Slips'].map(link),
        }],
      },
      {
        id: 'purchases',
        groups: [{
          id: 'purchases', title: 'Purchases', tone: 'green', icon: 'purchases',
          links: ['Expenses', 'Recurring Expenses', 'Purchase Orders', 'Purchase Receives',
            'Bills', 'Recurring Bills', 'Payments Made', 'Vendor Credits'].map(link),
        }],
      },
      {
        id: 'custom-modules',
        groups: [{
          id: 'custom-modules', title: 'Custom Modules', tone: 'blue', icon: 'custom-modules',
          //  `testmod` is a real user-created module in the source screen, not
          //  placeholder text. Custom modules are named by the customer, so the
          //  card has to survive a lower-case name of arbitrary length — which
          //  is exactly what the link row's truncation is for.
          links: ['Overview', 'testmod'].map(link),
        }],
      },
    ],
  },
  {
    id: 'extensions',
    title: 'Extension and Developer Data',
    cards: [
      {
        id: 'integrations',
        groups: [{
          //  THE FULL NAME, even though the card cannot show it. The source
          //  screen renders "Integrations & Market…" — that is the truncation
          //  working, not the name. Storing the truncated string would make the
          //  ellipsis permanent and strip it from the accessible name, search
          //  and the level 1 rail, all of which read the label rather than the
          //  rendered box.
          id: 'integrations', title: 'Integrations & Marketplace', tone: 'green', icon: 'integration',
          links: ['Zoho Apps', 'WhatsApp', 'SMS Integrations', 'Shipping', 'Zia Agents',
            'Shopping Cart & POS', 'eCommerce', 'EDI', 'Bharat Connect', 'Uber for Business',
            'Other Apps', 'Marketplace'].map(link),
        }],
      },
      {
        id: 'developer',
        groups: [{
          id: 'developer', title: 'Developer Data', tone: 'orange', icon: 'build',
          links: ['Widgets', 'Incoming Webhooks', 'Connections', 'API Usage', 'Signals',
            'Data Management', 'Deluge Components Usage', 'Web Forms', 'Sandbox'].map(link),
        }],
      },
    ],
  },
];
