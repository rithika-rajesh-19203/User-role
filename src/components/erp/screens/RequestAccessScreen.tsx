import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Check } from "lucide-react";
import type { Screen } from "../types";
import { allRoles, usersData } from "../RequestModal";

interface Props {
  onNavigate: (s: Screen) => void;
}

type UserOption = "myself" | "others";

const myself = usersData[0];

function SuggestionList({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (name: string, email: string) => void;
}) {
  const matches = useMemo(
    () =>
      usersData
        .filter((user) => {
          const value = query.trim().toLowerCase();
          return value.length > 0
            && (user.name.toLowerCase().includes(value) || user.email.toLowerCase().includes(value));
        })
        .slice(0, 6),
    [query],
  );

  if (matches.length === 0 || query.trim().length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
      {matches.map((user) => (
        <button
          key={user.email}
          type="button"
          onMouseDown={() => onSelect(user.name, user.email)}
          className="w-full px-3 py-2 text-left hover:bg-gray-50"
        >
          <p className="text-sm text-gray-800 font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </button>
      ))}
    </div>
  );
}

export default function RequestAccessScreen({ onNavigate }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserOption>("myself");
  const [otherFullName, setOtherFullName] = useState("");
  const [otherEmail, setOtherEmail] = useState("");
  const [activeSuggest, setActiveSuggest] = useState<"name" | "email" | null>(null);

  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason] = useState("");
  const [validity, setValidity] = useState("no-expiry");
  const [startDate, setStartDate] = useState("2026-09-03");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const requestForName = selectedUser === "myself" ? myself.name : otherFullName.trim();

  function submit() {
    const newErrors: Record<string, string> = {};
    if (selectedUser === "others" && !otherFullName.trim()) newErrors.fullName = "Required";
    if (selectedUser === "others" && !otherEmail.trim()) newErrors.email = "Required";
    if (!selectedRole) newErrors.role = "Required";
    if (!reason.trim()) newErrors.reason = "Required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setSubmitted(true);
  }

  function chooseOther(name: string, email: string) {
    setOtherFullName(name);
    setOtherEmail(email);
    setErrors((prev) => ({ ...prev, fullName: "", email: "" }));
    setActiveSuggest(null);
  }

  if (submitted) {
    return (
      <div className="flex-1 bg-white px-8 py-8">
        <div className="max-w-xl border border-green-200 bg-green-50 rounded-xl p-8 text-center">
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check size={22} className="text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Request submitted</p>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-medium text-gray-800">{selectedRole}</span> requested for{" "}
            <span className="font-medium text-gray-800">{requestForName || "selected user"}</span>.
          </p>
          <button
            onClick={() => onNavigate("my-role-requests")}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View My Role Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-8 pt-6 pb-4">
        <button
          onClick={() => onNavigate("users")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft size={14} /> Users
        </button>
        <h1 className="text-xl font-semibold text-gray-900 mt-2">Request Access</h1>
      </div>

      <div className="px-8 pb-8">
        <div className="max-w-2xl border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Select User <span className="text-red-400">*</span>
            </label>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              {[
                { key: "myself", label: "Myself" },
                { key: "others", label: "Others" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedUser(item.key as UserOption);
                    setErrors((prev) => ({ ...prev, fullName: "", email: "" }));
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedUser === item.key ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {selectedUser === "others" && (
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={otherFullName}
                  onFocus={() => setActiveSuggest("name")}
                  onBlur={() => setTimeout(() => setActiveSuggest(null), 100)}
                  onChange={(event) => {
                    setOtherFullName(event.target.value);
                    setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder="Enter full name"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.fullName ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                />
                {activeSuggest === "name" && (
                  <SuggestionList query={otherFullName} onSelect={chooseOther} />
                )}
                {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  value={otherEmail}
                  type="email"
                  onFocus={() => setActiveSuggest("email")}
                  onBlur={() => setTimeout(() => setActiveSuggest(null), 100)}
                  onChange={(event) => {
                    setOtherEmail(event.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="Enter email address"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.email ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
                />
                {activeSuggest === "email" && (
                  <SuggestionList query={otherEmail} onSelect={chooseOther} />
                )}
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(event) => {
                  setSelectedRole(event.target.value);
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none appearance-none bg-white ${errors.role ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
              >
                <option value="">Select a role…</option>
                {allRoles.map((role) => <option key={role}>{role}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            {errors.role && <p className="text-[11px] text-red-500 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none ${errors.reason ? "border-red-300" : "border-gray-200 focus:border-blue-400"}`}
            />
            {errors.reason && <p className="text-[11px] text-red-500 mt-1">{errors.reason}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Access validity</label>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 mb-3">
              {[["no-expiry", "No expiry"], ["custom", "Custom period"]].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValidity(value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${validity === value ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {validity === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => onNavigate("users")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
