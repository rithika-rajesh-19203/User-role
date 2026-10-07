import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Check } from "lucide-react";
import type { Screen } from "../types";
import { allRoles, getEmailSuggestions, myselfUser, type UserRow } from "../requestAccessData";

interface Props {
  onNavigate: (s: Screen) => void;
}

type UserOption = "myself" | "others";

function SuggestionList({
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

export default function RequestAccessScreen({ onNavigate }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserOption>("myself");
  const [otherFullName, setOtherFullName] = useState("");
  const [otherEmail, setOtherEmail] = useState("");
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason] = useState("");
  const [validity, setValidity] = useState("no-expiry");
  const [startDate, setStartDate] = useState("2026-09-03");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const requestForName = selectedUser === "myself" ? myselfUser.name : otherFullName.trim();

  function submit() {
    const newErrors: Record<string, string> = {};
    if (selectedUser === "others" && !otherFullName.trim()) newErrors.fullName = "Required";
    if (selectedUser === "others" && !otherEmail.trim()) newErrors.email = "Required";
    if (!selectedRole) newErrors.role = "Required";
    if (!reason.trim()) newErrors.reason = "Required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setSubmitted(true);
  }

  function chooseOther(user: UserRow) {
    setOtherFullName(user.name);
    setOtherEmail(user.email);
    setErrors((prev) => ({ ...prev, fullName: "", email: "" }));
    setShowEmailSuggestions(false);
  }

  if (submitted) {
    return (
      <div className="flex-1 bg-white px-8 py-8">
        <div className="max-w-xl rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
            <Check size={22} className="text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Request submitted</p>
          <p className="mt-1 text-xs text-gray-600">
            <span className="font-medium text-gray-800">{selectedRole}</span> requested for{" "}
            <span className="font-medium text-gray-800">{requestForName || "selected user"}</span>.
          </p>
          <button
            onClick={() => onNavigate("my-role-requests")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View My Role Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-8 pb-4 pt-6">
        <button
          onClick={() => onNavigate("users")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft size={14} /> Users
        </button>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Request Access</h1>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-2xl space-y-5 rounded-xl border border-gray-200 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Request For <span className="text-red-400">*</span>
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
                  <SuggestionList query={otherEmail} onSelect={chooseOther} />
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
                {allRoles.map((role) => <option key={role}>{role}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-gray-400" />
            </div>
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
            <div className="mb-3 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              {[["no-expiry", "No expiry"], ["custom", "Custom period"]].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValidity(value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${validity === value ? "border border-gray-200 bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onNavigate("users")}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
