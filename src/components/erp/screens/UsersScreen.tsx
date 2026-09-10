import { useState } from "react";
import {
  ChevronDown, MoreHorizontal, Plus, X,
  Shield, ChevronRight, Check,
} from "lucide-react";
import type { Screen } from "../types";
import { usersData, allRoles } from "../RequestModal";

/* requests where Rithika is an approver */
const myApprovals = [
  { id: "AR-000124", by: "Kavya Srinivasan", initials: "KS", color: "bg-indigo-500",  access: "Accounts Payable Manager", validity: "03 Sep – 30 Sep 2026", status: "Pending Approval", submitted: "02 Sep 2026", fallback: "Employee"   },
  { id: "AR-000123", by: "Rahul Verma",      initials: "RV", color: "bg-emerald-600", access: "Purchases Module",          validity: "Ongoing",              status: "Pending Approval", submitted: "01 Sep 2026", fallback: "Employee"   },
  { id: "AR-000116", by: "Anjali Sharma",    initials: "AS", color: "bg-purple-500",  access: "Approve Payments",          validity: "15 Aug – 15 Sep 2026", status: "Approved",         submitted: "14 Aug 2026", fallback: "Accountant" },
  { id: "AR-000112", by: "Vikram Nair",      initials: "VN", color: "bg-rose-500",    access: "Manufacturing Manager",     validity: "Ongoing",              status: "Rejected",         submitted: "10 Aug 2026", fallback: "Employee"   },
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
    <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ${statusColors[status] ?? "text-gray-500 bg-gray-50 border-gray-200"}`}>
      {status}
    </span>
  );
}

/* ─── Shared table header ─── */
function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-gray-200">
        {cols.map(c => (
          <th key={c} className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide whitespace-nowrap">{c}</th>
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

/* ─── Invite drawer ─── */
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
    <div className="absolute inset-0 z-30 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
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

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Send Invite</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Approver review panel ─── */
type Decision = "approve" | "reject" | "info" | null;

const gainedPerms  = ["Create Bills", "Approve Payments", "View Sales Orders"];
const lostPerms    = ["User Management", "Admin Panel Access"];

function ApproverReview({ requestId, requester, requesterInitials, requesterColor, onBack }: {
  requestId: string; requester: string; requesterInitials: string; requesterColor: string; onBack: () => void;
}) {
  const [decision, setDecision] = useState<Decision>(null);
  const [rejReason, setRejReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [decided, setDecided]    = useState<"approved" | "rejected" | null>(null);

  if (decided) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${decided === "approved" ? "bg-green-100" : "bg-red-100"}`}>
        {decided === "approved" ? <Check size={26} className="text-green-600" /> : <X size={26} className="text-red-600" />}
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">Request {decided === "approved" ? "Approved" : "Rejected"}</p>
        <p className="text-sm text-gray-500 mt-1">{requestId} has been {decided}.</p>
      </div>
      <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Back</button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 py-5 relative">
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] p-6">
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
              <button onClick={() => setShowModal(false)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setShowModal(false); setDecided(decision === "approve" ? "approved" : "rejected"); }}
                disabled={decision !== "approve" && !rejReason.trim()}
                className={`px-3 py-2 text-sm rounded-lg font-medium disabled:opacity-50 ${decision === "approve" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <ChevronRight size={14} className="rotate-180" /> User Role Approvals
          </button>
          <span className="text-gray-300">·</span>
          <span className="text-sm font-semibold text-gray-900">{requestId}</span>
          <StatusBadge status="Pending Approval" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDecision("approve"); setShowModal(true); }} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Approve</button>
          <button onClick={() => { setDecision("reject");  setShowModal(true); }} className="px-3 py-1.5 text-xs bg-red-600   text-white rounded-lg hover:bg-red-700   font-medium">Reject</button>
          <button onClick={() => setDecision("info")} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Request Info</button>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">

        {/* Summary card */}
        <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-xl p-5">
          {/* Left: who */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Requested by</p>
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`w-9 h-9 rounded-full ${requesterColor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{requesterInitials}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{requester}</p>
                <p className="text-xs text-gray-400">Finance · Active</p>
              </div>
            </div>
          </div>
          {/* Right: what */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Role Request</p>
            <dl className="space-y-2 text-sm">
              {[
                ["Role",          "Accounts Payable Manager"],
                ["Access period", "03 Sep – 30 Sep 2026"],
                ["Reverts to",    "Employee"],
                ["Submitted on",  "02 Sep 2026, 03:20 PM"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="text-gray-400 w-28 shrink-0">{k}</dt>
                  <dd className="text-gray-800 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Permission change cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Gained */}
          <div className="border border-green-200 bg-green-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Access they'll gain</p>
            </div>
            <div className="space-y-2">
              {gainedPerms.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{p}
                </div>
              ))}
            </div>
          </div>

          {/* Lost */}
          <div className="border border-red-200 bg-red-50/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Access they'll give up</p>
            </div>
            <div className="space-y-2">
              {lostPerms.length > 0 ? lostPerms.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{p}
                </div>
              )) : (
                <p className="text-xs text-gray-400 italic">No permissions will be removed.</p>
              )}
            </div>
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
  const [period, setPeriod]     = useState("All");
  const [status, setStatus]     = useState("All Statuses");
  const [role,   setRole]       = useState("All Roles");

  const filtered = usersData.filter(u => {
    if (status !== "All Statuses" && u.status !== status) return false;
    if (role   !== "All Roles"    && u.role   !== role)   return false;
    return true;
  });

  return (
    <>
      <FilterBar
        period={period} onPeriod={setPeriod}
        status={status} onStatus={setStatus}  statusOptions={USER_STATUS_OPTIONS}
        role={role}     onRole={setRole}       roleOptions={USER_ROLE_OPTIONS}
      />
      <div className="flex-1 overflow-y-auto px-8 pt-5">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">
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
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user.color} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>{user.initials}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:underline font-medium text-sm">{user.name}</button>
                        {user.badge && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded px-1.5 py-0.5 ${user.badgeColor}`}>
                            <Shield size={10} />{user.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-700 text-sm">{user.role}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2 py-0.5 ${user.status === "Active" ? "text-green-700 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="py-3">
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
}: {
  period: string; onPeriod: (v: string) => void;
  status: string; onStatus: (v: string) => void; statusOptions: string[];
  role:   string; onRole:   (v: string) => void; roleOptions:   string[];
}) {
  return (
    <div className="flex items-center gap-0 px-8 py-2.5 border-b border-gray-100 bg-white shrink-0">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-3">View by:</span>

      {/* Period */}
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

      {/* Status */}
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

      {/* Role */}
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
    </div>
  );
}

/* ─── My Approvals tab ─── */
function MyApprovalsTab() {
  const [reviewItem, setReviewItem] = useState<typeof myApprovals[number] | null>(null);
  const [period, setPeriod]         = useState("All");
  const [status, setStatus]         = useState("All Statuses");
  const [role,   setRole]           = useState("All Roles");

  const filtered = myApprovals.filter(r => {
    if (status !== "All Statuses" && r.status !== status) return false;
    if (role   !== "All Roles"    && r.access !== role)   return false;
    return true;
  });

  if (reviewItem) return (
    <ApproverReview
      requestId={reviewItem.id}
      requester={reviewItem.by}
      requesterInitials={reviewItem.initials}
      requesterColor={reviewItem.color}
      onBack={() => setReviewItem(null)}
    />
  );

  return (
    <>
      <FilterBar
        period={period} onPeriod={setPeriod}
        status={status} onStatus={setStatus} statusOptions={APPROVAL_STATUS_OPTIONS}
        role={role}     onRole={setRole}      roleOptions={APPROVAL_ROLE_OPTIONS}
      />
      <div className="flex-1 overflow-y-auto px-8 pt-5">
        <table className="w-full text-sm border-collapse">
          <TableHead cols={["Request ID","Role Requested","Validity","Role After Expiry","Status","Submitted"]} />
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="py-3 pr-4">
                  <button onClick={() => r.status === "Pending Approval" && setReviewItem(r)}
                    className={`text-xs font-medium ${r.status === "Pending Approval" ? "text-blue-600 hover:underline" : "text-gray-500"}`}>
                    {r.id}
                  </button>
                </td>
                <td className="py-3 pr-4 text-gray-700 text-xs font-medium whitespace-nowrap">{r.access}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{r.validity}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{r.fallback}</td>
                <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">{r.submitted}</td>
                <td className="py-3">
                  {r.status === "Pending Approval" && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setReviewItem(r)} className="text-[11px] text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded px-2 py-1 font-medium">Review</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-sm text-gray-400 text-center">No approvals match the selected filters.</p>}
        <p className="py-4 text-xs text-gray-400">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </>
  );
}

/* ─── Root ─── */
interface Props { onNavigate: (s: Screen) => void }

export default function UsersScreen({ onNavigate: _onNavigate }: Props) {
  const [tab, setTab]               = useState<"users" | "my-approvals">("users");
  const [showInvite, setShowInvite] = useState(false);

  const pendingCount = myApprovals.filter(r => r.status === "Pending Approval").length;

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
      {tab === "my-approvals" && <MyApprovalsTab />}
    </div>
  );
}
