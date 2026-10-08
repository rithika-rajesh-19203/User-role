/**
 * Role, role-category, module and permission sample data for the v2 role
 * screens — ported from the v1 screens (src/v1/components/erp/screens/), which
 * kept each list inline in the component. Values and copy are unchanged.
 */

export type RecordStatus = "Active" | "Inactive";

/* ── Roles (Roles list) ──────────────────────────────────────────────────── */

export type RoleType = "User" | "Employee" | "Retail Staff" | "Shopfloor Staff";

export const ROLE_TYPES: RoleType[] = ["User", "Employee", "Retail Staff", "Shopfloor Staff"];

export interface RoleRow {
  name: string;
  category: string;
  type: RoleType;
  description: string;
  users: number;
  status: RecordStatus;
}

export const ROLES: RoleRow[] = [
  { name: "Accountant", category: "Finance Operations", type: "User", description: "Maintains the Accounting.", users: 3, status: "Active" },
  { name: "Accounts Payable Manager", category: "Finance Operations", type: "User", description: "Maintains accurate payable records.", users: 1, status: "Active" },
  { name: "Accounts Receivable Manager", category: "Finance Operations", type: "User", description: "Maintains accurate receivable records.", users: 2, status: "Active" },
  { name: "Admin", category: "System Administration", type: "User", description: "Unrestricted access to all modules.", users: 1, status: "Active" },
  { name: "Employee", category: "Human Resources", type: "Employee", description: "Employee Role with full access", users: 24, status: "Active" },
  { name: "Employee (Payroll Only)", category: "Human Resources", type: "Employee", description: "Employee Role only with payroll access", users: 8, status: "Active" },
  { name: "Employee (Submitter)", category: "Human Resources", type: "Employee", description: "Employee Role", users: 12, status: "Active" },
  { name: "Manufacturing Manager", category: "Manufacturing", type: "User", description: "Oversees the production process in a factory", users: 2, status: "Active" },
  { name: "Procurement Manager", category: "Procurement", type: "User", description: "Oversees the process of purchasing goods and services", users: 1, status: "Active" },
  { name: "Quality Engineer", category: "Manufacturing", type: "User", description: "Ensures the quality of products and services.", users: 3, status: "Active" },
  { name: "Quality Manager", category: "Manufacturing", type: "User", description: "Oversees the quality assurance process.", users: 1, status: "Active" },
  { name: "Retail Manager", category: "Retail Operations", type: "User", description: "Oversees the daily operations of a retail store.", users: 4, status: "Active" },
  { name: "Retail Staff", category: "Retail Operations", type: "Retail Staff", description: "Assists customers and manages sales in a retail store.", users: 16, status: "Active" },
  { name: "Shopfloor Staff", category: "Manufacturing", type: "Shopfloor Staff", description: "Shop Floor Worker", users: 9, status: "Active" },
];

/** The ⋯ actions on a role or category row. */
export const ROW_ACTIONS = ["View", "Edit", "Duplicate", "Deactivate"] as const;

/* ── New Role: modules and their permission rows ─────────────────────────── */

export const ROLE_MODULES = [
  "Contacts", "Employee", "Salesperson", "Items", "Inventory",
  "Sales Orders", "Purchase Orders", "Bills", "Payments",
  "Manufacturing", "Reports", "Automation",
];

export interface PermissionRow {
  name: string;
  /** An extra, optional sub-permission shown under the row. */
  sub?: string;
}

export const MODULE_PARTICULARS: Record<string, PermissionRow[]> = {
  Contacts: [{ name: "Customers" }, { name: "Vendors", sub: "Allow users to add, edit and delete vendor's bank account details." }, { name: "Contacts" }],
  Employee: [{ name: "Employees" }, { name: "Departments" }, { name: "Designations" }],
  Salesperson: [{ name: "Salespersons" }, { name: "Sales Targets" }],
  Items: [{ name: "Items" }, { name: "Item Groups" }, { name: "Price Lists" }, { name: "Units of Measure" }],
  Inventory: [{ name: "Warehouses" }, { name: "Stock Adjustments" }, { name: "Stock Transfers" }],
  "Sales Orders": [{ name: "Sales Orders" }, { name: "Invoices" }, { name: "Credit Notes" }, { name: "Delivery Orders" }],
  "Purchase Orders": [{ name: "Purchase Orders" }, { name: "Bills" }, { name: "Debit Notes" }, { name: "Goods Receipts" }],
  Bills: [{ name: "Bills" }, { name: "Vendor Credits" }],
  Payments: [{ name: "Customer Payments" }, { name: "Vendor Payments" }, { name: "Bank Accounts" }],
  Manufacturing: [{ name: "Production Orders" }, { name: "Bill of Materials" }, { name: "Work Centers" }],
  Reports: [{ name: "Financial Reports" }, { name: "Inventory Reports" }, { name: "Sales Reports" }, { name: "Custom Reports" }],
  Automation: [{ name: "Workflows" }, { name: "Scheduled Reports" }, { name: "Custom Functions" }],
};

/** The CRUD columns of the permission grid, in v1's order. */
export const PERMISSION_COLUMNS = ["FULL", "VIEW", "CREATE", "EDIT", "DELETE"] as const;
export type PermissionColumn = (typeof PERMISSION_COLUMNS)[number];

/** v1 opened with every column ticked for Contacts → Customers and Vendors. */
export const INITIAL_PERMISSIONS: Record<string, boolean> = Object.fromEntries(
  ["Customers", "Vendors"].flatMap((row) =>
    PERMISSION_COLUMNS.map((col) => [`Contacts:${row}:${col}`, true] as const),
  ),
);

/* ── Role categories ─────────────────────────────────────────────────────── */

export interface RoleCategoryRow {
  name: string;
  description: string;
  roles: number;
  permissions: number;
  approvers: number;
  status: RecordStatus;
  updated: string;
}

export const ROLE_CATEGORIES: RoleCategoryRow[] = [
  { name: "Finance Operations", description: "Finance and accounting-related access", roles: 4, permissions: 28, approvers: 2, status: "Active", updated: "02 Sep 2026" },
  { name: "Inventory & Warehouse", description: "Inventory tracking and warehouse management", roles: 3, permissions: 18, approvers: 1, status: "Active", updated: "28 Aug 2026" },
  { name: "Sales & Customer Operations", description: "Sales pipeline and customer management access", roles: 5, permissions: 22, approvers: 2, status: "Active", updated: "25 Aug 2026" },
  { name: "Manufacturing", description: "Production floor and quality control access", roles: 4, permissions: 15, approvers: 1, status: "Active", updated: "20 Aug 2026" },
  { name: "Procurement", description: "Purchasing and vendor management access", roles: 2, permissions: 14, approvers: 1, status: "Active", updated: "15 Aug 2026" },
  { name: "Human Resources", description: "Employee management and payroll access", roles: 3, permissions: 20, approvers: 2, status: "Active", updated: "10 Aug 2026" },
  { name: "Retail Operations", description: "Retail store management and POS access", roles: 3, permissions: 16, approvers: 1, status: "Active", updated: "05 Aug 2026" },
  { name: "System Administration", description: "Full system configuration and admin access", roles: 1, permissions: 48, approvers: 2, status: "Active", updated: "01 Aug 2026" },
];

/* ── New Role Category wizard ────────────────────────────────────────────── */

export const CATEGORY_STEPS = ["Basic Details", "Base Permissions", "Approvers", "Review & Create"];

/** The modules a category's base permission set is chosen from. */
export const CATEGORY_MODULES = [
  "Organisation", "Users & Roles", "Inventory", "Items", "Warehouses", "Sales",
  "Purchases", "Accounting", "Payments", "Manufacturing", "Reports", "Automation", "Settings",
];

export interface Approver {
  name: string;
  email: string;
  initials: string;
  dept: string;
}

/** v1's approver directory, which is wider than the Users list (it carries a department). */
export const APPROVER_OPTIONS: Approver[] = [
  { name: "Priya Menon", email: "priya.menon@company.com", initials: "PM", dept: "Finance" },
  { name: "Arjun Kumar", email: "arjun.kumar@company.com", initials: "AK", dept: "Operations" },
  { name: "Sneha Rao", email: "sneha.rao@company.com", initials: "SR", dept: "HR" },
  { name: "Vikram Nair", email: "vikram.nair@company.com", initials: "VN", dept: "Finance" },
  { name: "Anjali Sharma", email: "anjali.sharma@company.com", initials: "AS", dept: "Compliance" },
  { name: "Rahul Verma", email: "rahul.verma@company.com", initials: "RV", dept: "IT" },
  { name: "Meera Pillai", email: "meera.pillai@company.com", initials: "MP", dept: "Finance" },
];

/* ── Role category detail (Finance Operations) ───────────────────────────── */

export const CATEGORY_DETAIL = {
  name: "Finance Operations",
  status: "Active" as RecordStatus,
  stats: [
    { label: "Roles", value: "4" },
    { label: "Base Permissions", value: "28" },
    { label: "Approvers", value: "2" },
    { label: "Pending Requests", value: "3" },
  ],
  overview: [
    ["Description", "Finance and accounting-related access"],
    ["Category Owner", "Priya Menon"],
    ["Created Date", "01 Aug 2026"],
    ["Last Updated", "02 Sep 2026"],
    ["Approval Method", "Any one approver"],
    ["Request Validity Policy", "Custom (up to 30 days)"],
  ] as const,
  roles: [
    { name: "Accountant", desc: "Maintains the Accounting.", perms: 14, users: 3, status: "Active" as RecordStatus },
    { name: "Accounts Payable Manager", desc: "Manages payable records.", perms: 20, users: 1, status: "Active" as RecordStatus },
    { name: "Accounts Receivable Manager", desc: "Manages receivable records.", perms: 18, users: 2, status: "Active" as RecordStatus },
    { name: "Admin", desc: "Full access to all modules.", perms: 28, users: 1, status: "Active" as RecordStatus },
  ],
  basePermissions: [
    { group: "User Management", perms: ["View Users", "Invite Users", "Edit User Details"] },
    { group: "Role Management", perms: ["Manage Roles", "Manage Role Categories"] },
    { group: "Transaction Management", perms: ["View Bills", "Create Bills", "Approve Payments"] },
    { group: "Reports", perms: ["View Reports", "Export Reports"] },
  ],
  approvers: APPROVER_OPTIONS.slice(0, 2),
};

export const CATEGORY_DETAIL_TABS = ["Overview", "Roles", "Base Permissions", "Approvers", "Access Requests", "Activity Log"];
