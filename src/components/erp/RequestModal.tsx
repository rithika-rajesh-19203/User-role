import { useState } from "react";
import { ChevronDown, X, Check, UserPlus } from "lucide-react";

export const usersData = [
  { initials: "KS", color: "bg-indigo-500",  name: "Kavya Srinivasan", badge: null as string | null, badgeColor: "", email: "kavya.srinivasan@company.com", role: "Accountant",          status: "Active"   },
  { initials: "R",  color: "bg-blue-600",    name: "Rithika",          badge: "Super Admin",          badgeColor: "text-amber-700 bg-amber-50 border-amber-200", email: "rithika.rajesh@zohotest.com",  role: "Admin",               status: "Active"   },
  { initials: "RV", color: "bg-emerald-600", name: "Rahul Verma",      badge: null,                   badgeColor: "", email: "rahul.verma@company.com",      role: "Procurement Manager", status: "Active"   },
  { initials: "AS", color: "bg-purple-500",  name: "Anjali Sharma",    badge: null,                   badgeColor: "", email: "anjali.sharma@company.com",    role: "Accountant",          status: "Active"   },
  { initials: "VN", color: "bg-rose-500",    name: "Vikram Nair",      badge: null,                   badgeColor: "", email: "vikram.nair@company.com",      role: "Manufacturing Mgr",   status: "Inactive" },
  { initials: "MP", color: "bg-cyan-600",    name: "Meera Pillai",     badge: null,                   badgeColor: "", email: "meera.pillai@company.com",     role: "Retail Staff",        status: "Active"   },
];

export const allRoles = [
  "Accountant", "Accounts Payable Manager", "Accounts Receivable Manager",
  "Admin", "Employee", "Manufacturing Manager", "Procurement Manager",
  "Quality Manager", "Retail Manager", "Retail Staff", "Shopfloor Staff",
];

export type UserRow = typeof usersData[number];

/* The first entry in usersData is the "self" user shown as "(Myself)" */
const MYSELF_NAME = usersData[0].name;

export function RequestModal({
  prefillUser,
  defaultMySelf: _defaultMySelf,
  onClose,
}: {
  prefillUser?: UserRow;
  defaultMySelf?: boolean;
  onClose: () => void;
}) {
  /* user selection */
  const [selectedName, setSelectedName] = useState<string>(
    prefillUser ? prefillUser.name : MYSELF_NAME
  );

  /* "add new user" mode */
  const [addingNew, setAddingNew]     = useState(false);
  const [newName, setNewName]         = useState("");
  const [newEmail, setNewEmail]       = useState("");

  /* rest of the form */
  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason]             = useState("");
  const [validity, setValidity]         = useState("no-expiry");
  const [startDate, setStartDate]       = useState("2026-09-03");
  const [endDate, setEndDate]           = useState("2026-09-30");
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [submitted, setSubmitted]       = useState(false);

  const resolvedName = addingNew ? newName.trim() || "new user" : selectedName;

  function submit() {
    const e: Record<string, string> = {};
    if (!selectedRole) e.role = "Required";
    if (!reason.trim()) e.reason = "Required";
    if (addingNew && !newName.trim()) e.newName = "Required";
    if (addingNew && !newEmail.trim()) e.newEmail = "Required";
    setErrors(e);
    if (!Object.keys(e).length) setSubmitted(true);
  }

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-96 p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center mb-1">
          <Check size={22} className="text-green-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Request submitted</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">{selectedRole}</span> requested for{" "}
          <span className="font-medium text-gray-700">{resolvedName}</span>.
        </p>
        <button onClick={onClose} className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Request Access</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── User selector ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500">
                {addingNew ? "Enter New User Name" : "Select User"}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              {addingNew && (
                <button
                  onClick={() => { setAddingNew(false); setNewName(""); setNewEmail(""); setErrors(p => ({...p, newName: "", newEmail: ""})); }}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Select from existing user
                </button>
              )}
            </div>

            {addingNew ? (
              /* ── New user text inputs ── */
              <div className="space-y-2">
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setErrors(p => ({...p, newName: ""})); }}
                  placeholder="Full name"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.newName ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                />
                {errors.newName && <p className="text-[11px] text-red-500">{errors.newName}</p>}
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setErrors(p => ({...p, newEmail: ""})); }}
                  placeholder="Email address"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.newEmail ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                />
                {errors.newEmail && <p className="text-[11px] text-red-500">{errors.newEmail}</p>}
              </div>
            ) : (
              /* ── Existing user dropdown ── */
              <div>
                <div className="relative">
                  <select
                    value={selectedName}
                    onChange={e => {
                      if (e.target.value === "__add_new__") {
                        setAddingNew(true);
                      } else {
                        setSelectedName(e.target.value);
                        setErrors(p => ({...p, users: ""}));
                      }
                    }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none appearance-none bg-white ${errors.users ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                  >
                    {usersData.map((u, i) => (
                      <option key={u.name} value={u.name}>
                        {u.name}{i === 0 ? " (Myself)" : ""} — {u.role}
                      </option>
                    ))}
                    <option value="__add_new__" className="text-blue-600 font-medium">
                      + Add New User
                    </option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                </div>
                {/* Add New User button below dropdown as a secondary affordance */}
                <button
                  onClick={() => setAddingNew(true)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline"
                >
                  <UserPlus size={12} /> Add New User
                </button>
              </div>
            )}
          </div>

          {/* ── Role ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Role <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setErrors(p => ({...p, role: ""})); }}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none appearance-none bg-white ${errors.role ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}>
                <option value="">Select a role…</option>
                {allRoles.map(r => <option key={r}>{r}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            {errors.role && <p className="text-[11px] text-red-500 mt-1">{errors.role}</p>}
          </div>

          {/* ── Reason ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Reason <span className="text-red-400">*</span></label>
            <textarea value={reason} onChange={e => { setReason(e.target.value); setErrors(p => ({...p, reason: ""})); }}
              rows={2} placeholder="Why is this role needed?"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none ${errors.reason ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`} />
            {errors.reason && <p className="text-[11px] text-red-500 mt-1">{errors.reason}</p>}
          </div>

          {/* ── Validity ── */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Access validity</label>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 mb-3">
              {[["no-expiry","No expiry"],["custom","Custom period"]].map(([val, label]) => (
                <button key={val} onClick={() => setValidity(val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${validity === val ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                  {label}
                </button>
              ))}
            </div>
            {validity === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Start</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">End</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400" />
                </div>
              </div>
            )}
          </div>

          {/* ── Expiry note ── */}
          {validity === "custom" && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                After the custom period ends, the user will automatically revert to their previous role.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Submit</button>
        </div>
      </div>
    </div>
  );
}
