/**
 * Shared v2 data: the org, the signed-in user, the user list and the role list.
 * The same people and roles as v1 (src/v1/components/erp/requestAccessData.ts),
 * minus v1's colour classes — in the canon an Avatar's tint is hashed from the
 * name, never chosen.
 */

export const ORG_NAME = "AdventNet Org";
export const ORG_ID = "117146592";

export type UserStatus = "Active" | "Inactive";

export interface UserRow {
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  /** A label shown beside the name, e.g. "Super Admin". */
  badge?: string;
}

export const USERS: UserRow[] = [
  { name: "Kavya Srinivasan", email: "kavya.srinivasan@company.com", role: "Accountant", status: "Active" },
  { name: "Rithika", email: "rithika.rajesh@zohotest.com", role: "Admin", status: "Active", badge: "Super Admin" },
  { name: "Rahul Verma", email: "rahul.verma@company.com", role: "Procurement Manager", status: "Active" },
  { name: "Anjali Sharma", email: "anjali.sharma@company.com", role: "Accountant", status: "Active" },
  { name: "Vikram Nair", email: "vikram.nair@company.com", role: "Manufacturing Mgr", status: "Inactive" },
  { name: "Meera Pillai", email: "meera.pillai@company.com", role: "Retail Staff", status: "Active" },
];

export const ME = USERS.find((u) => u.email === "rithika.rajesh@zohotest.com") ?? USERS[0];
export const ME_USER_ID = "84291037";
export const CURRENT_ROLE = "Admin";

/** The signed-in user's roles, shown in the org panel. */
export const MY_ROLES = [
  { name: "Admin", expiry: "Expiring in 2 months" },
  { name: "Distribution Admin", expiry: "Expires on 10 Sep 2026" },
  { name: "Manufacturing Manager", expiry: "Expiring in 3 weeks" },
];

export const ALL_ROLES = [
  "Accountant", "Accounts Payable Manager", "Accounts Receivable Manager",
  "Admin", "Employee", "Manufacturing Manager", "Procurement Manager",
  "Quality Manager", "Retail Manager", "Retail Staff", "Shopfloor Staff",
];

export const ROLE_SUMMARIES: Record<string, string> = {
  Accountant: "Handles accounting operations, reconciliations, and day-to-day finance records.",
  "Accounts Payable Manager": "Oversees supplier invoices, payment approvals, and payable exceptions.",
  "Accounts Receivable Manager": "Manages collections, invoice escalations, and customer credit adjustments.",
  Admin: "Provides broad system administration access across users, roles, and configurations.",
  Employee: "Gives standard employee access for everyday self-service and assigned workflows.",
  "Manufacturing Manager": "Coordinates production planning, shift supervision, and plant-level approvals.",
  "Procurement Manager": "Handles purchase requests, vendor approvals, and sourcing operations.",
  "Quality Manager": "Manages quality reviews, inspection escalations, and compliance approvals.",
  "Retail Manager": "Runs store operations, stock transfers, cashier overrides, and retail approvals.",
  "Retail Staff": "Supports point-of-sale activities, customer service, and in-store operations.",
  "Shopfloor Staff": "Covers operational tasks on the production floor with limited execution access.",
};

export function getEmailSuggestions(query: string, limit = 6) {
  const value = query.trim().toLowerCase();
  if (!value) return [];
  return USERS.filter((u) => u.email.toLowerCase().includes(value)).slice(0, limit);
}
