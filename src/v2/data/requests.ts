/**
 * The signed-in user's role requests — ported verbatim from v1
 * (src/v1/components/erp/screens/MyRoleRequestsScreen.tsx). v1's status colour
 * classes are dropped: in the canon a status is a `StatusBadge` variant, mapped
 * once in REQUEST_STATUS below.
 */
import type { StatusBadgeStatus } from "@canon";

export type RequestStatus = "Pending Approval" | "Approved" | "Rejected" | "Expired" | "Cancelled";

export interface RoleRequestRecord {
  id: string;
  requester: string;
  requesterEmail: string;
  requestedFor: string;
  requestedRole: string;
  currentRole: string;
  roleAfterExpiry: string;
  validity: string;
  accessType: string;
  department: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string;
  rejectedReason?: string;
}

/** Each request status onto the canon badge state that carries its meaning. */
export const REQUEST_STATUS: Record<RequestStatus, StatusBadgeStatus> = {
  "Pending Approval": "pending",
  Approved: "approved",
  Rejected: "failed",
  Expired: "expired",
  Cancelled: "cancelled",
};

export const MY_ROLE_REQUESTS: RoleRequestRecord[] = [
  {
    id: "AR-000129",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Retail Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "03 Sep – 30 Sep 2026",
    accessType: "Temporary elevation",
    department: "Retail Operations",
    reason: "Need temporary access to manage festive store operations, stock transfers, and cashier overrides during the seasonal launch.",
    status: "Pending Approval",
    submittedAt: "03 Sep 2026, 09:18 AM",
  },
  {
    id: "AR-000127",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Accounts Receivable Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "01 Sep – 30 Sep 2026",
    accessType: "Temporary elevation",
    department: "Finance",
    reason: "Required to clear month-end invoice escalations and approve credit note adjustments while the primary manager is on leave.",
    status: "Pending Approval",
    submittedAt: "01 Sep 2026, 11:30 AM",
  },
  {
    id: "AR-000124",
    requester: "Kavya Srinivasan",
    requesterEmail: "kavya.srinivasan@company.com",
    requestedFor: "Kavya Srinivasan",
    requestedRole: "Procurement Manager",
    currentRole: "Accountant",
    roleAfterExpiry: "Accountant",
    validity: "No expiry",
    accessType: "Permanent change",
    department: "Procurement",
    reason: "Transitioning into the procurement lead role permanently to manage vendor approvals, purchase orders, and intake planning.",
    status: "Pending Approval",
    submittedAt: "30 Aug 2026, 04:42 PM",
  },
  {
    id: "AR-000121",
    requester: "Rahul Verma",
    requesterEmail: "rahul.verma@company.com",
    requestedFor: "Rahul Verma",
    requestedRole: "Quality Manager",
    currentRole: "Procurement Manager",
    roleAfterExpiry: "Procurement Manager",
    validity: "15 Aug – 15 Sep 2026",
    accessType: "Temporary elevation",
    department: "Manufacturing",
    reason: "Covering the quality function during the annual audit period to handle NCR approvals and inspection escalations.",
    status: "Approved",
    submittedAt: "14 Aug 2026, 02:07 PM",
  },
  {
    id: "AR-000118",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Manufacturing Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "10 Aug – 31 Aug 2026",
    accessType: "Temporary elevation",
    department: "Manufacturing",
    reason: "Requested temporary plant oversight access to handle shift escalations during the supervisor transition period.",
    status: "Rejected",
    submittedAt: "09 Aug 2026, 05:10 PM",
    rejectedReason: "The request was declined because the current plant transition does not require temporary manager access and the supervisor backup plan is already in place.",
  },
];
