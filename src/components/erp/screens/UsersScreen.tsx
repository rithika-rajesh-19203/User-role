import { useState, type ReactNode } from "react";
import {
  ChevronDown, MoreHorizontal, Plus, X,
  Shield, ChevronRight, Check, FileText,
} from "lucide-react";
import type { Screen } from "../types";
import { usersData, allRoles } from "../requestAccessData";

type AccessPeriod =
  | { type: "custom"; startDate: string; endDate: string }
  | { type: "no-expiry" };

interface ApprovalRequest {
  id: string;
  by: string;
  requesterEmail: string;
  requestedFor: string;
  initials: string;
  color: string;
  access: string;
  currentRole: string;
  accessType: string;
  department: string;
  reason: string;
  accessPeriod: AccessPeriod;
  status: "Pending Approval" | "Approved" | "Rejected";
  submitted: string;
  fallback: string;
  rejectedReason?: string;
}

/* requests where Rithika is an approver */
const defaultCustomAccessPeriod: AccessPeriod = {
  type: "custom",
  startDate: "2026-09-03",
  endDate: "2026-09-30",
};

function formatShortDateLabel(value: string) {
  const [year, month, day] = value.split("-");
  const monthLabel = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1];
  return `${day} ${monthLabel} ${year}`;
}

function formatAccessPeriod(accessPeriod: AccessPeriod) {
  if (accessPeriod.type === "no-expiry") {
    return "No expiry";
  }

  return `${formatShortDateLabel(accessPeriod.startDate)} – ${formatShortDateLabel(accessPeriod.endDate)}`;
}

function getRoleAfterExpiry(fallbackRole: string, accessPeriod: AccessPeriod) {
  return accessPeriod.type === "no-expiry" ? "Not applicable" : fallbackRole;
}

const myApprovals: ApprovalRequest[] = [
  {
    id: "AR-000124",
    by: "Kavya Srinivasan",
    requesterEmail: "kavya.srinivasan@company.com",
    requestedFor: "Kavya Srinivasan",
    initials: "KS",
    color: "bg-indigo-500",
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
    initials: "RV",
    color: "bg-emerald-600",
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
    initials: "AS",
    color: "bg-purple-500",
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
    initials: "VN",
    color: "bg-rose-500",
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

const statusColors: Record<string, string> = {
  "Pending Approval": "text-yellow-700 bg-yellow-50 border-yellow-200",
  "Approved":         "text-green-700  bg-green-50  border-green-200",
  "Rejected":         "text-red-700    bg-red-50    border-red-200",
  "Draft":            "text-gray-600   bg-gray-50   border-gray-200",
  "Expired":          "text-orange-700 bg-orange-50 border-orange-200",
};

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`zf-status-badge inline-flex items-center text-xs font-medium border rounded-sm px-2 py-0.5 whitespace-nowrap ${statusColors[status] ?? "text-gray-500 bg-gray-50 border-gray-200"}`}>
      {status}
    </span>
  );
}

/* ─── Shared table header ─── */
function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-gray-200">
        {cols.map((c, index) => (
          <th
            key={c}
            className={`text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide whitespace-nowrap ${index === 0 ? "pl-0" : ""}`}
          >
            {c}
          </th>
        ))}
        <th />
      </tr>
    </thead>
  );
}

/* ─── Role permission illustrations ─── */
function IllustrationNoRequests() {
  return (
    <svg width="52" height="44" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* person silhouette */}
      <circle cx="26" cy="13" r="7" fill="#e2e8f0" />
      <path d="M12 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* lock body */}
      <rect x="33" y="24" width="14" height="11" rx="2.5" fill="#fca5a5" />
      <path d="M36 24v-3a4 4 0 0 1 8 0v3" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* keyhole */}
      <circle cx="40" cy="29" r="1.5" fill="#dc2626" />
      <rect x="39.25" y="29.5" width="1.5" height="2.5" rx="0.75" fill="#dc2626" />
    </svg>
  );
}

function IllustrationSelfRequest() {
  return (
    <svg width="52" height="44" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* person */}
      <circle cx="22" cy="13" r="7" fill="#bfdbfe" />
      <path d="M8 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* self-pointing arrow arc */}
      <path d="M36 20 C44 16, 46 30, 36 32" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" fill="none" strokeDasharray="3 2"/>
      {/* arrowhead */}
      <polyline points="33,29 36,32 38,28" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* badge/role chip */}
      <rect x="28" y="17" width="18" height="7" rx="3.5" fill="#3b82f6"/>
      <rect x="30" y="19.5" width="4" height="2" rx="1" fill="white" opacity="0.9"/>
      <rect x="36" y="19.5" width="7" height="2" rx="1" fill="white" opacity="0.6"/>
    </svg>
  );
}

function IllustrationProxyRequest() {
  return (
    <svg width="60" height="44" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* person A (requester) */}
      <circle cx="13" cy="12" r="6" fill="#bfdbfe" />
      <path d="M2 36c0-6.627 4.925-12 11-12s11 5.373 11 12" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* arrow from A to B */}
      <path d="M25 22 L35 22" stroke="#6366f1" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="3 2"/>
      <polyline points="32,19 35,22 32,25" stroke="#6366f1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* person B (recipient) */}
      <circle cx="47" cy="12" r="6" fill="#c7d2fe" />
      <path d="M36 36c0-6.627 4.925-12 11-12s11 5.373 11 12" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* role badge over B */}
      <rect x="38" y="5" width="18" height="7" rx="3.5" fill="#6366f1"/>
      <rect x="40" y="7.5" width="4" height="2" rx="1" fill="white" opacity="0.9"/>
      <rect x="46" y="7.5" width="7" height="2" rx="1" fill="white" opacity="0.6"/>
    </svg>
  );
}

/* ─── Checkbox primitive ─── */
function Checkbox({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all
        ${disabled ? "opacity-40 cursor-not-allowed border-gray-300 bg-transparent" :
          checked ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white hover:border-blue-400"}`}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

/* ─── Invite popup ─── */
function InviteDrawer({ onClose }: { onClose: () => void }) {
  const [email, setEmail]         = useState("");
  const [role,  setRole]          = useState("Accountant");
  const [canSelf,    setCanSelf]    = useState(true);
  const [canOthers,  setCanOthers]  = useState(false);
  const [canNewUsers, setCanNewUsers] = useState(false);

  function toggleOthers() {
    const next = !canOthers;
    setCanOthers(next);
    if (!next) setCanNewUsers(false);
  }

  const noneActive = !canSelf && !canOthers;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 zf-scrim" onClick={onClose} />
      <div className="relative flex h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-[640px] max-h-full overflow-hidden rounded-2xl zf-elevated flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Invite User</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@company.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {/* Assign role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none appearance-none focus:border-blue-400"
              >
                {allRoles.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Personal message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add a message to the invitation email…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Role request permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">Role Request Permissions</label>
            <p className="text-xs text-gray-400 mb-3">Control what role requests this user can submit after joining.</p>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">

              {/* Row 1 — self */}
              <label className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/70 transition-colors">
                <Checkbox checked={canSelf} onChange={() => setCanSelf(v => !v)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {/* self illustration */}
                    <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
                      <circle cx="10" cy="7" r="4.5" fill={canSelf ? "#bfdbfe" : "#e5e7eb"} />
                      <path d="M2 22c0-4.418 3.582-8 8-8s8 3.582 8 22" stroke={canSelf ? "#bfdbfe" : "#e5e7eb"} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      <path d="M20 11 C25 9, 26 17, 20 18" stroke={canSelf ? "#3b82f6" : "#d1d5db"} strokeWidth="1.4" strokeLinecap="round" fill="none" strokeDasharray="2.5 1.5"/>
                      <polyline points="18,15.5 20,18 22,14.5" stroke={canSelf ? "#3b82f6" : "#d1d5db"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    <span className={`text-sm font-medium ${canSelf ? "text-gray-900" : "text-gray-500"}`}>
                      For themselves
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 ml-8 leading-snug">
                    They can submit role requests for their own account.
                  </p>
                </div>
              </label>

              {/* Row 2 — on behalf of others */}
              <div>
                <label className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/70 transition-colors">
                  <Checkbox checked={canOthers} onChange={toggleOthers} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* proxy illustration */}
                      <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                        <circle cx="7" cy="7" r="4" fill={canOthers ? "#bfdbfe" : "#e5e7eb"} />
                        <path d="M0 22c0-3.866 3.134-7 7-7s7 3.134 7 22" stroke={canOthers ? "#bfdbfe" : "#e5e7eb"} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        <path d="M15 11.5 L20 11.5" stroke={canOthers ? "#6366f1" : "#d1d5db"} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.5"/>
                        <polyline points="17.5,9.5 20,11.5 17.5,13.5" stroke={canOthers ? "#6366f1" : "#d1d5db"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        <circle cx="25" cy="7" r="4" fill={canOthers ? "#c7d2fe" : "#e5e7eb"} />
                        <path d="M18 22c0-3.866 3.134-7 7-7s7 3.134 7 22" stroke={canOthers ? "#c7d2fe" : "#e5e7eb"} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      </svg>
                      <span className={`text-sm font-medium ${canOthers ? "text-gray-900" : "text-gray-500"}`}>
                        On behalf of others
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-9 leading-snug">
                      They can submit role requests for existing users in the organization.
                    </p>
                  </div>
                </label>

                {/* Sub-option: new users — revealed when canOthers is true */}
                <div className={`overflow-hidden transition-all duration-200 ${canOthers ? "max-h-32" : "max-h-0"}`}>
                  <label className="flex items-start gap-3 pl-11 pr-4 py-3 bg-gray-50/80 border-t border-gray-100 cursor-pointer hover:bg-gray-100/60 transition-colors">
                    <Checkbox checked={canNewUsers} onChange={() => setCanNewUsers(v => !v)} disabled={!canOthers} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {/* new user illustration — dashed person outline */}
                        <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
                          <circle cx="8" cy="6" r="3.5" stroke={canNewUsers ? "#f59e0b" : "#d1d5db"} strokeWidth="1.3" strokeDasharray="2 1.5" fill="none"/>
                          <path d="M1 19c0-3.866 3.134-7 7-7" stroke={canNewUsers ? "#f59e0b" : "#d1d5db"} strokeWidth="1.3" strokeDasharray="2 1.5" strokeLinecap="round" fill="none"/>
                          <path d="M15 12 h5 M17.5 9.5 v5" stroke={canNewUsers ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className={`text-xs font-medium ${canNewUsers ? "text-amber-700" : "text-gray-400"}`}>
                          Including users not yet in the organization
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        They can enter a name and email for a new person. Once the role is approved, an invite will be sent automatically.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Summary pill */}
            {noneActive && (
              <p className="mt-2.5 text-xs text-gray-400 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                No options selected — this user will not be able to submit any role requests.
              </p>
            )}
          </div>
            </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end shrink-0">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Send Invite</button>
            </div>
          </div>
        </div>
      </div>
  );
}

/* ─── Approver review panel ─── */
type Decision = "approve" | "reject" | "info" | null;

function ReviewSectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function ReviewFact({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">{value}</p>
      {helper && <p className="mt-1 break-all text-xs leading-5 text-gray-500">{helper}</p>}
    </div>
  );
}

function getRequestScopeLabel(request: ApprovalRequest) {
  return request.by === request.requestedFor ? "Self request" : "Requested on behalf of another user";
}

function ApprovalDetailsSidebar({
  request,
  onClose,
}: {
  request: ApprovalRequest;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex">
      <div className="zf-scrim flex-1" onClick={onClose} />
      <aside className="zf-side-panel flex w-full max-w-[620px] flex-col">
        <div className="zf-side-panel__header shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">User Role Approval</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">{request.id}</h2>
            <p className="mt-1 text-sm text-gray-500">View the request details and final decision context.</p>
          </div>
          <button onClick={onClose} className="mt-0.5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="zf-side-panel__body space-y-5">
          <section className="zf-side-panel__section p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${request.color} text-sm font-bold text-white`}>
                  {request.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-semibold text-gray-900">{request.access}</h3>
                  <p className="text-sm text-gray-500 mt-1">Requested for {request.requestedFor}</p>
                </div>
              </div>
              <div className="self-start">
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div className="zf-detail-grid zf-detail-grid--compact zf-detail-grid--triple mt-5 border-t border-dashed border-gray-200 pt-4">
              <ReviewFact label="Submitted" value={request.submitted} />
              <ReviewFact label="Access period" value={formatAccessPeriod(request.accessPeriod)} />
              <ReviewFact label="Access type" value={request.accessType} />
            </div>
          </section>

          <section className="zf-side-panel__section px-5 py-5">
            <h4 className="text-lg font-semibold text-gray-900">Request Details</h4>
            <div className="zf-detail-grid zf-detail-grid--double mt-4">
              <ReviewFact label="Requester" value={request.by} helper={request.requesterEmail} />
              <ReviewFact label="Requested for" value={request.requestedFor} />
              <ReviewFact label="Current role" value={request.currentRole} />
              <ReviewFact label="Business area" value={request.department} />
            </div>

            <section className="border-t border-gray-100 pt-6 mt-6">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900">Business Justification</h4>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{request.reason}</p>
            </section>

            {request.status === "Rejected" && request.rejectedReason && (
              <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">Rejected reason</p>
                <p className="mt-2 text-sm leading-6 text-red-800">{request.rejectedReason}</p>
              </section>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function ApproverReview({
  request,
  onUpdateRequest,
  onBack,
}: {
  request: ApprovalRequest;
  onUpdateRequest: (requestId: string, updates: Partial<ApprovalRequest>) => void;
  onBack: () => void;
}) {
  const [decision, setDecision] = useState<Decision>(null);
  const [rejReason, setRejReason] = useState("");
  const [infoMessage, setInfoMessage] = useState(
    "Please share the business justification for this access, the expected duration, and whether this should be temporary or permanent."
  );
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState(
    request.accessPeriod.type === "custom" ? request.accessPeriod.startDate : defaultCustomAccessPeriod.startDate
  );
  const [draftEndDate, setDraftEndDate] = useState(
    request.accessPeriod.type === "custom" ? request.accessPeriod.endDate : defaultCustomAccessPeriod.endDate
  );

  const accessPeriodError = !draftStartDate || !draftEndDate
    ? "Start date and end date are required."
    : draftEndDate < draftStartDate
      ? "End date must be on or after the start date."
      : "";

  function saveAccessPeriod() {
    if (accessPeriodError) {
      return;
    }

    onUpdateRequest(request.id, {
      accessPeriod: {
        type: "custom",
        startDate: draftStartDate,
        endDate: draftEndDate,
      },
    });
    setIsEditingPeriod(false);
  }

  function removeAccessPeriod() {
    onUpdateRequest(request.id, { accessPeriod: { type: "no-expiry" } });
    setIsEditingPeriod(false);
  }

  return (
    <div className="relative flex-1 overflow-y-auto bg-transparent pb-24">
      {showModal && (
        <div className="fixed inset-0 zf-scrim z-50 flex items-center justify-center">
          <div className="zf-elevated w-[400px] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {decision === "approve" ? "Approve this request?" : "Reject this request?"}
            </h2>
            {decision !== "approve" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
                <textarea value={rejReason} onChange={e => setRejReason(e.target.value)} rows={3} placeholder="Explain the reason for rejection…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowModal(false); setRejReason(""); setDecision(null); }} className="zf-btn zf-btn-secondary">Cancel</button>
              <button onClick={() => {
                const nextStatus = decision === "approve" ? "Approved" : "Rejected";
                onUpdateRequest(request.id, {
                  status: nextStatus,
                  rejectedReason: decision === "reject" ? rejReason.trim() : undefined,
                });
                setShowModal(false);
                setRejReason("");
                setDecision(null);
              }}
                disabled={decision !== "approve" && !rejReason.trim()}
                className={`zf-btn disabled:opacity-50 ${decision === "approve" ? "zf-btn-success" : "zf-btn-danger"}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="fixed inset-0 zf-scrim z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] rounded-2xl zf-elevated">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Request more information</h2>
              <p className="mt-1 text-sm text-gray-500">Send the extra details the requester needs before approval can proceed.</p>
            </div>

            <div className="px-5 py-5">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Message</label>
              <textarea
                value={infoMessage}
                onChange={(event) => setInfoMessage(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                placeholder="Add the missing information needed from the requester..."
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="zf-btn zf-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecision("info");
                  setShowInfoModal(false);
                }}
                className="zf-btn zf-btn-warning"
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-8 py-6">
        <div className="zf-page-header px-0 pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                <ChevronRight size={14} className="rotate-180" /> User Role Approvals
              </button>
              <span className="text-gray-300">·</span>
              <span className="text-sm font-semibold text-gray-900">{request.id}</span>
            </div>
            <div>
              <p className="zf-page-header__eyebrow">Approval Review</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-gray-950">{request.access}</h2>
                <StatusBadge status={request.status} />
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {request.accessType}
                </span>
              </div>
            </div>
            <p className="max-w-3xl text-sm text-gray-500">
              {request.status === "Pending Approval"
                ? "Review the request, adjust the access configuration if needed, and take action when ready."
                : "View the request details and final decision context for this approval."}
            </p>
          </div>
          <div className="zf-page-header__meta text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">Submitted</p>
            <p className="mt-1 text-sm font-medium text-blue-900">{request.submitted}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${request.color} text-sm font-bold text-white`}>
                {request.initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.requestedFor}</h3>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {getRequestScopeLabel(request)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {request.currentRole} to {request.access}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <section className="px-6 py-5">
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
                <ReviewFact label="Requester" value={request.by} helper={request.requesterEmail} />
                <ReviewFact label="Business area" value={request.department} />
                <ReviewFact label="Access period" value={formatAccessPeriod(request.accessPeriod)} />
                <ReviewFact label="Role after expiry" value={getRoleAfterExpiry(request.fallback, request.accessPeriod)} />
              </div>
            </section>

            <section className="px-6 py-5">
              <ReviewSectionTitle title="Why access is needed" />
              <div className="mt-4 flex items-start gap-3">
                <div className="mt-0.5 text-gray-400">
                  <FileText size={16} />
                </div>
                <p className="max-w-3xl text-sm leading-7 text-gray-700">{request.reason}</p>
              </div>
            </section>

            {request.status === "Rejected" && request.rejectedReason && (
              <section className="px-6 py-5">
                <ReviewSectionTitle title="Rejected reason" />
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-sm leading-7 text-red-800">{request.rejectedReason}</p>
                </div>
              </section>
            )}

            <section className="px-6 py-5">
              <ReviewSectionTitle
                title="Access configuration"
                action={
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingPeriod((value) => !value)}
                      className="zf-btn zf-btn-secondary min-h-7 px-2.5 text-[11px]"
                    >
                      {isEditingPeriod ? "Close" : request.accessPeriod.type === "custom" ? "Edit period" : "Set period"}
                    </button>
                    {request.accessPeriod.type === "custom" && (
                      <button
                        type="button"
                        onClick={removeAccessPeriod}
                        className="zf-btn zf-btn-secondary min-h-7 border-red-200 px-2.5 text-[11px] text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                }
              />
              <div className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
                <ReviewFact label="Effective access period" value={formatAccessPeriod(request.accessPeriod)} helper={request.accessPeriod.type === "no-expiry" ? "This access stays active until changed manually." : `Automatic fallback: ${request.fallback}.`} />
                <ReviewFact label="Role transition" value={`${request.currentRole} → ${request.access}`} helper={`Fallback role: ${getRoleAfterExpiry(request.fallback, request.accessPeriod)}`} />
              </div>
              {isEditingPeriod && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-gray-500">Start date</label>
                      <input
                        type="date"
                        value={draftStartDate}
                        onChange={(event) => setDraftStartDate(event.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-gray-500">End date</label>
                      <input
                        type="date"
                        value={draftEndDate}
                        onChange={(event) => setDraftEndDate(event.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  {accessPeriodError && <p className="mt-2 text-[11px] text-red-500">{accessPeriodError}</p>}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftStartDate(request.accessPeriod.type === "custom" ? request.accessPeriod.startDate : defaultCustomAccessPeriod.startDate);
                        setDraftEndDate(request.accessPeriod.type === "custom" ? request.accessPeriod.endDate : defaultCustomAccessPeriod.endDate);
                        setIsEditingPeriod(false);
                      }}
                      className="zf-btn zf-btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveAccessPeriod}
                      disabled={Boolean(accessPeriodError)}
                      className="zf-btn zf-btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save period
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-8 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{request.requestedFor}</p>
              <p className="text-xs text-gray-500">
                {request.access} · {formatAccessPeriod(request.accessPeriod)}
              </p>
              {decision === "info" && request.status === "Pending Approval" && (
                <p className="mt-1 text-xs text-amber-700">Follow up for clarification before approving.</p>
              )}
              {request.status !== "Pending Approval" && (
                <p className="mt-1 text-xs text-gray-500">
                  {request.status === "Rejected" && request.rejectedReason ? "Rejection reason captured in the details above." : `This request is ${request.status.toLowerCase()}.`}
                </p>
              )}
            </div>
            {request.status === "Pending Approval" && (
              <div className="flex shrink-0 gap-2">
                <button onClick={() => setShowInfoModal(true)} className="zf-btn zf-btn-secondary">
                  Request info
                </button>
                <button onClick={() => { setDecision("reject"); setShowModal(true); }} className="zf-btn zf-btn-danger">
                  Reject
                </button>
                <button onClick={() => { setDecision("approve"); setShowModal(true); }} className="zf-btn zf-btn-success">
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const USER_STATUS_OPTIONS = ["All Statuses", "Active", "Inactive"];
const USER_ROLE_OPTIONS   = ["All Roles", ...Array.from(new Set(usersData.map(u => u.role)))];

/* ─── Users tab ─── */
function UsersTab() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [role, setRole] = useState("All Roles");

  const filtered = usersData.filter((user) => {
    if (role !== "All Roles" && user.role !== role) return false;
    return true;
  });

  return (
    <>
      <FilterBar
        period="All" onPeriod={() => {}}
        status="All Statuses" onStatus={() => {}} statusOptions={USER_STATUS_OPTIONS}
        role={role} onRole={setRole} roleOptions={USER_ROLE_OPTIONS}
        showPeriodFilter={false} showStatusFilter={false}
      />
      <div className="flex-1 overflow-y-auto px-8 pt-5">
        <div className="zf-surface-card overflow-hidden rounded-2xl">
        <table className="zf-card-table w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pl-0 text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">
                <button className="flex items-center gap-1 hover:text-gray-600">User Details <ChevronDown size={11} /></button>
              </th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Associated Roles</th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.name} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="pl-0 py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${user.color} text-sm font-semibold text-white`}>{user.initials}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="text-left text-blue-600 hover:underline font-medium text-sm">{user.name}</button>
                        {user.badge && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-md px-2 py-0.5 ${user.badgeColor}`}>
                            <Shield size={10} />{user.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-gray-400">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4 text-gray-700 text-sm">{user.role}</td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2 py-0.5 ${user.status === "Active" ? "text-green-700 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="py-4 pr-0">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === user.name ? null : user.name)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400"><MoreHorizontal size={15} /></button>
                      {openMenu === user.name && (
                        <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                          {["View Profile","Edit","Change Role","Deactivate"].map(a => (
                            <button key={a} onClick={() => setOpenMenu(null)}
                              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${a === "Deactivate" ? "text-red-600" : "text-gray-700"}`}>{a}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-sm text-gray-400 text-center">No users match the selected filters.</p>}
        </div>
        <p className="py-4 text-xs text-gray-400">{filtered.length} users</p>
      </div>

    </>
  );
}


/* ─── Filter bar ─── */
const PERIOD_OPTIONS        = ["All", "Today", "This Week", "This Month", "Last Month"];
const APPROVAL_STATUS_OPTIONS = ["All Statuses", "Pending Approval", "Approved", "Rejected"];
const APPROVAL_ROLE_OPTIONS   = ["All Roles", ...Array.from(new Set(myApprovals.map(r => r.access)))];

function FilterBar({
  period, onPeriod,
  status, onStatus, statusOptions,
  role,   onRole,   roleOptions,
  showViewByLabel = true,
  showPeriodFilter = true,
  showStatusFilter = true,
  showRoleFilter = true,
}: {
  period: string; onPeriod: (v: string) => void;
  status: string; onStatus: (v: string) => void; statusOptions: string[];
  role: string; onRole: (v: string) => void; roleOptions: string[];
  showViewByLabel?: boolean;
  showPeriodFilter?: boolean;
  showStatusFilter?: boolean;
  showRoleFilter?: boolean;
}) {
  return (
    <div className="zf-filterbar flex items-center gap-0 px-8 py-2.5 border-b shrink-0">
      {showViewByLabel && (
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-3">View by:</span>
      )}

      {showPeriodFilter && (
        <div className="flex items-center gap-1.5 pr-4 border-r border-gray-200">
          <span className="text-xs text-gray-500">Period:</span>
          <div className="relative">
            <select
              value={period}
              onChange={e => onPeriod(e.target.value)}
              className="appearance-none bg-transparent text-xs font-medium text-gray-700 pr-4 outline-none cursor-pointer hover:text-blue-600"
            >
              {PERIOD_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-0 top-0.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {showStatusFilter && (
        <div className="flex items-center gap-1.5 px-4 border-r border-gray-200">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div className="relative">
            <select
              value={status}
              onChange={e => onStatus(e.target.value)}
              className="appearance-none bg-transparent text-xs font-medium text-gray-700 pr-4 outline-none cursor-pointer hover:text-blue-600"
            >
              {statusOptions.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-0 top-0.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {showRoleFilter && (
        <div className="flex items-center gap-1.5 px-4">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          <div className="relative">
            <select
              value={role}
              onChange={e => onRole(e.target.value)}
              className="appearance-none bg-transparent text-xs font-medium text-gray-700 pr-4 outline-none cursor-pointer hover:text-blue-600"
            >
              {roleOptions.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-0 top-0.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── My Approvals tab ─── */
function MyApprovalsTab({
  approvals,
  onUpdateRequest,
}: {
  approvals: ApprovalRequest[];
  onUpdateRequest: (requestId: string, updates: Partial<ApprovalRequest>) => void;
}) {
  const [reviewItemId, setReviewItemId] = useState<string | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [status, setStatus] = useState("All Statuses");

  const filtered = approvals.filter((request) => {
    if (status !== "All Statuses" && request.status !== status) return false;
    return true;
  });
  const reviewItem = reviewItemId ? approvals.find((request) => request.id === reviewItemId) ?? null : null;
  const detailItem = detailItemId ? approvals.find((request) => request.id === detailItemId) ?? null : null;

  function openApprovalItem(request: ApprovalRequest) {
    if (request.status === "Pending Approval") {
      setReviewItemId(request.id);
      return;
    }
    setDetailItemId(request.id);
  }

  if (reviewItem) return (
    <ApproverReview
      request={reviewItem}
      onUpdateRequest={onUpdateRequest}
      onBack={() => setReviewItemId(null)}
    />
  );

  return (
    <>
      <FilterBar
        period="All" onPeriod={() => {}}
        status={status} onStatus={setStatus} statusOptions={APPROVAL_STATUS_OPTIONS}
        role="All Roles" onRole={() => {}} roleOptions={APPROVAL_ROLE_OPTIONS}
        showPeriodFilter={false} showRoleFilter={false}
      />
      <div className="flex-1 overflow-y-auto px-8 pt-5">
        <div className="zf-surface-card overflow-hidden rounded-2xl">
        <table className="zf-card-table w-full text-sm border-collapse">
          <TableHead cols={["Request", "Requested for", "Status", "Submitted"]} />
          <tbody>
            {filtered.map((request) => (
              <tr key={request.id} className="group border-b border-gray-100 hover:bg-gray-50">
                <td className="pl-0 py-3 pr-4">
                  <button onClick={() => openApprovalItem(request)}
                    className="text-xs font-medium text-blue-600 hover:underline">
                    {request.id}
                  </button>
                  <div className="mt-1 text-sm font-medium text-gray-800">{request.access}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{formatAccessPeriod(request.accessPeriod)}</div>
                </td>
                <td className="py-3 pr-4">
                  <div className="text-sm font-medium text-gray-800">{request.requestedFor}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{request.by}</div>
                </td>
                <td className="py-3 pr-4"><StatusBadge status={request.status} /></td>
                <td className="py-3 pr-4 text-xs whitespace-nowrap text-gray-400">{request.submitted}</td>
                <td className="py-3 pr-0">
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openApprovalItem(request)}
                      className={`rounded px-2 py-1 text-[11px] font-medium ${request.status === "Pending Approval" ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                      {request.status === "Pending Approval" ? "Review" : "View details"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No approvals match the selected filters.</p>}
        </div>
        <p className="py-4 text-xs text-gray-400">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {detailItem && (
        <ApprovalDetailsSidebar
          request={detailItem}
          onClose={() => setDetailItemId(null)}
        />
      )}
    </>
  );
}

/* ─── Root ─── */
interface Props { onNavigate: (s: Screen) => void }

export default function UsersScreen({ onNavigate: _onNavigate }: Props) {
  const [tab, setTab]               = useState<"users" | "my-approvals">("users");
  const [showInvite, setShowInvite] = useState(false);
  const [approvals, setApprovals]   = useState(myApprovals);

  const pendingCount = approvals.filter(r => r.status === "Pending Approval").length;

  function updateApprovalRequest(requestId: string, updates: Partial<ApprovalRequest>) {
    setApprovals((current) => current.map((request) => (
      request.id === requestId ? { ...request, ...updates } : request
    )));
  }

  const tabs = [
    { key: "users",        label: "Users"       },
    { key: "my-approvals", label: "User Role Approvals", badge: pendingCount },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {showInvite && <InviteDrawer onClose={() => setShowInvite(false)} />}

      {/* Page header */}
      <div className="px-8 pt-6 pb-0 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Plus size={14} /> Invite User
          </button>
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 flex gap-6 border-b border-gray-200 mt-4 shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
            {"badge" in t && t.badge > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-1.5 py-0.5 font-medium">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "users"        && <UsersTab />}
      {tab === "my-approvals" && (
        <MyApprovalsTab approvals={approvals} onUpdateRequest={updateApprovalRequest} />
      )}
    </div>
  );
}
