import { useMemo, useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { allRoles, getEmailSuggestions, myselfUser, roleSummaries, type UserRow } from "./requestAccessData";

type UserOption = "myself" | "others";

function EmailSuggestionList({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (user: UserRow) => void;
}) {
  const matches = useMemo(() => getEmailSuggestions(query), [query]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      {matches.map((user) => (
        <button
          key={user.email}
          type="button"
          onMouseDown={() => onSelect(user)}
          className="w-full px-3 py-2 text-left hover:bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-800">{user.email}</p>
          <p className="text-xs text-gray-500">{user.name}</p>
        </button>
      ))}
    </div>
  );
}

export function RequestModal({
  prefillUser,
  defaultMySelf,
  onClose,
  onSubmitted,
}: {
  prefillUser?: UserRow;
  defaultMySelf?: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const initialUserOption: UserOption = prefillUser || defaultMySelf === false ? "others" : "myself";
  const [selectedUser, setSelectedUser] = useState<UserOption>(initialUserOption);
  const [otherFullName, setOtherFullName] = useState(prefillUser?.name ?? "");
  const [otherEmail, setOtherEmail] = useState(prefillUser?.email ?? "");
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason] = useState("");
  const [validity, setValidity] = useState("no-expiry");
  const [startDate, setStartDate] = useState("2026-09-03");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const resolvedName = selectedUser === "myself" ? myselfUser.name : otherFullName.trim();
  const selectedRoleSummary = selectedRole ? roleSummaries[selectedRole] : "";

  function submit() {
    const nextErrors: Record<string, string> = {};
    if (selectedUser === "others" && !otherFullName.trim()) nextErrors.fullName = "Required";
    if (selectedUser === "others" && !otherEmail.trim()) nextErrors.email = "Required";
    if (!selectedRole) nextErrors.role = "Required";
    if (!reason.trim()) nextErrors.reason = "Required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      if (onSubmitted) {
        onSubmitted();
        return;
      }
      setSubmitted(true);
    }
  }

  function selectSuggestedUser(user: UserRow) {
    setOtherFullName(user.name);
    setOtherEmail(user.email);
    setErrors((prev) => ({ ...prev, fullName: "", email: "" }));
    setShowEmailSuggestions(false);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="zf-scrim absolute inset-0" onClick={onClose} />
        <div className="relative flex h-full items-center justify-center px-4">
          <div className="zf-elevated flex w-full max-w-96 flex-col items-center gap-3 rounded-2xl p-8 text-center">
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
              <Check size={22} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Role request submitted</p>
            <p className="text-xs leading-relaxed text-gray-500">
              <span className="font-medium text-gray-700">{selectedRole}</span> requested for{" "}
              <span className="font-medium text-gray-700">{resolvedName || "selected user"}</span>.
            </p>
            <button onClick={onClose} className="zf-btn zf-btn-primary mt-2 px-5">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="zf-scrim absolute inset-0" onClick={onClose} />
      <div className="relative flex h-full items-center justify-center px-4 py-8">
        <div className="zf-elevated flex max-h-full w-full max-w-[600px] flex-col rounded-2xl">
          <div className="flex shrink-0 items-start justify-between border-b border-gray-100 bg-[#fafbfd] px-6 py-5">
            <div>
              <p className="zf-page-header__eyebrow">Role Access</p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">Request Role</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose who needs access, the role to assign, and how long the access should stay active.
              </p>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={15} /></button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Request For <span className="ml-0.5 text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(event) => {
                    const nextValue = event.target.value as UserOption;
                    setSelectedUser(nextValue);
                    setShowEmailSuggestions(false);
                    setErrors((prev) => ({ ...prev, fullName: "", email: "" }));
                  }}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="myself">Myself</option>
                  <option value="others">Others</option>
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {selectedUser === "others" && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={otherFullName}
                    onChange={(event) => {
                      setOtherFullName(event.target.value);
                      setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="Enter full name"
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${errors.fullName ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                  />
                  {errors.fullName && <p className="mt-1 text-[11px] text-red-500">{errors.fullName}</p>}
                </div>

                <div className="relative">
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={otherEmail}
                    type="email"
                    onFocus={() => setShowEmailSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 100)}
                    onChange={(event) => {
                      setOtherEmail(event.target.value);
                      setShowEmailSuggestions(true);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="Enter email address"
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${errors.email ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                  />
                  {showEmailSuggestions && (
                    <EmailSuggestionList query={otherEmail} onSelect={selectSuggestedUser} />
                  )}
                  {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(event) => {
                    setSelectedRole(event.target.value);
                    setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm outline-none ${errors.role ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                >
                  <option value="">Select a role…</option>
                  {allRoles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
              </div>
              {selectedRoleSummary && (
                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Role summary</p>
                  <p className="mt-1 text-xs leading-5 text-blue-800">{selectedRoleSummary}</p>
                </div>
              )}
              {errors.role && <p className="mt-1 text-[11px] text-red-500">{errors.role}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setErrors((prev) => ({ ...prev, reason: "" }));
                }}
                rows={2}
                placeholder="Why is this role needed?"
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none ${errors.reason ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
              />
              {errors.reason && <p className="mt-1 text-[11px] text-red-500">{errors.reason}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Access validity</label>
              <div className="mb-3 inline-flex rounded-lg border border-gray-200 bg-[#f7f9fc] p-0.5">
                {[
                  ["no-expiry", "No expiry"],
                  ["custom", "Custom period"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValidity(value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${validity === value ? "border border-[#d4dce8] bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {validity === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-400">Start</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-gray-400">End</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {validity === "custom" && (
              <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-blue-500">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs leading-relaxed text-blue-700">
                  After the custom period ends, the user will automatically revert to their previous role.
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-[#fafbfd] px-6 py-4">
            <button onClick={onClose} className="zf-btn zf-btn-secondary">
              Cancel
            </button>
            <button onClick={submit} className="zf-btn zf-btn-primary">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
