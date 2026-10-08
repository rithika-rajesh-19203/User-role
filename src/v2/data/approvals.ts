/**
 * Role approval requests where the signed-in user (Rithika) is an approver.
 * The same four requests as v1 (src/v1/components/erp/screens/UsersScreen.tsx),
 * minus v1's initials and colour classes — in the canon an Avatar's initial and
 * tint are derived from the name, never chosen.
 */

export type AccessPeriod =
  | { type: "custom"; startDate: string; endDate: string }
  | { type: "no-expiry" };

export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

export interface ApprovalRequest {
  id: string;
  by: string;
  requesterEmail: string;
  requestedFor: string;
  access: string;
  currentRole: string;
  accessType: string;
  department: string;
  reason: string;
  accessPeriod: AccessPeriod;
  status: ApprovalStatus;
  submitted: string;
  fallback: string;
  rejectedReason?: string;
}

export const DEFAULT_CUSTOM_ACCESS_PERIOD = {
  type: "custom",
  startDate: "2026-09-03",
  endDate: "2026-09-30",
} as const satisfies AccessPeriod;

export const MY_APPROVALS: ApprovalRequest[] = [
  {
    id: "AR-000124",
    by: "Kavya Srinivasan",
    requesterEmail: "kavya.srinivasan@company.com",
    requestedFor: "Kavya Srinivasan",
    access: "Accounts Payable Manager",
    currentRole: "Accountant",
    accessType: "Temporary elevation",
    department: "Finance Operations",
    reason: "Need temporary approval authority to clear supplier invoices, manage exceptions, and avoid payment delays during quarter close.",
    accessPeriod: { type: "custom", startDate: "2026-09-03", endDate: "2026-09-30" },
    status: "Pending Approval",
    submitted: "02 Sep 2026, 03:20 PM",
    fallback: "Employee",
  },
  {
    id: "AR-000123",
    by: "Rahul Verma",
    requesterEmail: "rahul.verma@company.com",
    requestedFor: "Nisha Patel",
    access: "Purchases Module",
    currentRole: "Employee",
    accessType: "Permanent assignment",
    department: "Procurement",
    reason: "Requesting module access for the new procurement coordinator so purchase requests and vendor follow-ups can move without manager handoffs.",
    accessPeriod: { type: "no-expiry" },
    status: "Pending Approval",
    submitted: "01 Sep 2026, 11:05 AM",
    fallback: "Employee",
  },
  {
    id: "AR-000116",
    by: "Anjali Sharma",
    requesterEmail: "anjali.sharma@company.com",
    requestedFor: "Anjali Sharma",
    access: "Approve Payments",
    currentRole: "Accountant",
    accessType: "Temporary elevation",
    department: "Finance",
    reason: "Covering finance approvals while the primary approver is on leave and month-end settlements must continue without delay.",
    accessPeriod: { type: "custom", startDate: "2026-08-15", endDate: "2026-09-15" },
    status: "Approved",
    submitted: "14 Aug 2026, 02:07 PM",
    fallback: "Accountant",
  },
  {
    id: "AR-000112",
    by: "Vikram Nair",
    requesterEmail: "vikram.nair@company.com",
    requestedFor: "Vikram Nair",
    access: "Manufacturing Manager",
    currentRole: "Employee",
    accessType: "Permanent change",
    department: "Manufacturing",
    reason: "Requested an organizational role change to oversee production planning, shift exceptions, and supervisor approvals.",
    accessPeriod: { type: "no-expiry" },
    status: "Rejected",
    submitted: "10 Aug 2026, 10:40 AM",
    fallback: "Employee",
    rejectedReason: "This request was declined because the manufacturing transition is not active yet and the elevated role is not required at this stage.",
  },
];

export const APPROVAL_STATUS_OPTIONS = ["All Statuses", "Pending Approval", "Approved", "Rejected"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-03" -> "03 Sep 2026" */
export function formatShortDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatAccessPeriod(accessPeriod: AccessPeriod) {
  if (accessPeriod.type === "no-expiry") return "No expiry";
  return `${formatShortDateLabel(accessPeriod.startDate)} – ${formatShortDateLabel(accessPeriod.endDate)}`;
}

export function getRoleAfterExpiry(fallbackRole: string, accessPeriod: AccessPeriod) {
  return accessPeriod.type === "no-expiry" ? "Not applicable" : fallbackRole;
}

/**
 * The canon's date field is a masked DD/MM/YYYY text input (InputField
 * format="date" — never type="date"), while the record stores ISO. These two
 * convert at the field's edge.
 */
export function isoToDisplay(iso: string) {
  const [year, month, day] = iso.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

/** "03/09/2026" -> "2026-09-03", or "" when the value is not a complete, real date. */
export function displayToIso(display: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return "";
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) {
    return "";
  }
  return `${year}-${month}-${day}`;
}
