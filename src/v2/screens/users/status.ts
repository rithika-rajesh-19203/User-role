import type { StatusBadgeStatus } from "@canon";
import type { ApprovalStatus } from "../../data/approvals";
import type { UserStatus } from "../../data/people";

/**
 * Record states onto the badge's fourteen. "Pending Approval" is Attention,
 * "Approved" is Positive / terminal-good, "Rejected" is Negative / terminal-bad
 * (`failed` — the request is closed and did not go through; `cancelled` would
 * say the requester withdrew it).
 */
export const APPROVAL_TONE: Record<ApprovalStatus, StatusBadgeStatus> = {
  "Pending Approval": "pending",
  Approved: "approved",
  Rejected: "failed",
};

export const USER_TONE: Record<UserStatus, StatusBadgeStatus> = {
  Active: "success",
  Inactive: "inactive",
};
