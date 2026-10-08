import { useState } from "react";
import { ChevronLeft, Check, Info, AlertTriangle, ChevronRight, X } from "lucide-react";
import type { Screen } from "../types";

const steps = ["Basic Details", "Base Permissions", "Approvers", "Review & Create"];

const allModules = [
  "Organisation",
  "Users & Roles",
  "Inventory",
  "Items",
  "Warehouses",
  "Sales",
  "Purchases",
  "Accounting",
  "Payments",
  "Manufacturing",
  "Reports",
  "Automation",
  "Settings",
];

const approverOptions = [
  { name: "Priya Menon", email: "priya.menon@company.com", initials: "PM", dept: "Finance" },
  { name: "Arjun Kumar", email: "arjun.kumar@company.com", initials: "AK", dept: "Operations" },
  { name: "Sneha Rao", email: "sneha.rao@company.com", initials: "SR", dept: "HR" },
  { name: "Vikram Nair", email: "vikram.nair@company.com", initials: "VN", dept: "Finance" },
  { name: "Anjali Sharma", email: "anjali.sharma@company.com", initials: "AS", dept: "Compliance" },
  { name: "Rahul Verma", email: "rahul.verma@company.com", initials: "RV", dept: "IT" },
  { name: "Meera Pillai", email: "meera.pillai@company.com", initials: "MP", dept: "Finance" },
];

interface Props { onNavigate: (s: Screen) => void }

export default function CreateRoleCategoryScreen({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [catName, setCatName] = useState("");
  const [desc, setDesc] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [selectedApprovers, setSelectedApprovers] = useState<typeof approverOptions>([approverOptions[0], approverOptions[1]]);
  const [approverSearch, setApproverSearch] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleContinue() {
    if (step === 0 && !catName.trim()) {
      setNameError("Category Name is required.");
      return;
    }
    setNameError("");
    if (step < 3) setStep(s => s + 1);
    else setSuccess(true);
  }

  function toggleModule(mod: string) {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  }

  function toggleAll() {
    if (selectedModules.size === allModules.length) setSelectedModules(new Set());
    else setSelectedModules(new Set(allModules));
  }

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={28} className="text-green-600" />
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Role Category created successfully</div>
          <div className="text-sm text-gray-500 mt-1">You can now create roles and assign them to this category.</div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate("new-role")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create New Role</button>
          <button onClick={() => onNavigate("role-category-detail")} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">View Role Category</button>
          <button onClick={() => onNavigate("role-categories")} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Go to Role Categories</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-200">
        <button onClick={() => onNavigate("role-categories")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
          <ChevronLeft size={15} /> Back to Role Categories
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New Role Category</h1>
        <p className="text-sm text-gray-500">Define the permission boundary and approvers for this category.</p>

        {/* Stepper */}
        <div className="flex items-center mt-5">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i <= step ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-sm ${i === step ? "font-semibold text-gray-900" : i < step ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-px mx-3 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Step 1: Basic Details */}
        {step === 0 && (
          <div className="max-w-xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex gap-2 text-sm text-blue-800">
              <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
              Roles created under this category can only use permissions from the selected modules. Role permissions cannot exceed this boundary.
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                <input
                  value={catName}
                  onChange={e => { setCatName(e.target.value); setNameError(""); }}
                  placeholder="e.g. Finance Operations"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${nameError ? "border-red-400" : "border-gray-200 focus:border-blue-400"}`}
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Describe the purpose of this role category"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {["Active", "Inactive"].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" defaultChecked={s === "Active"} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Base Permissions — module selection */}
        {step === 1 && (
          <div className="max-w-xl">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">Set Base Permissions</h2>
              <p className="text-sm text-gray-500">Select the modules that roles in this category will have access to.</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 flex gap-2 text-sm text-yellow-800">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-yellow-500" />
              Base permissions define the maximum access available to all roles under this category. Roles cannot access modules not selected here.
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Modules</span>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedModules.size === allModules.length}
                    onChange={toggleAll}
                    className="accent-blue-600"
                  />
                  Select all
                </label>
              </div>
              <div className="divide-y divide-gray-100">
                {allModules.map(mod => (
                  <label key={mod} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedModules.has(mod) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <input
                      type="checkbox"
                      checked={selectedModules.has(mod)}
                      onChange={() => toggleModule(mod)}
                      className="accent-blue-600"
                    />
                    <span className={`text-sm font-medium ${selectedModules.has(mod) ? "text-blue-700" : "text-gray-700"}`}>{mod}</span>
                    {selectedModules.has(mod) && (
                      <span className="ml-auto text-xs text-blue-500 bg-blue-100 rounded-full px-2 py-0.5">Included</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{selectedModules.size} of {allModules.length} modules selected</p>
          </div>
        )}

        {/* Step 3: Approvers — only flow preview */}
        {step === 2 && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Assign Approvers</h2>
            <p className="text-sm text-gray-500 mb-5">Access requests for this role category will be sent to the users selected below.</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Approvers</label>

              {/* Selected chips */}
              {selectedApprovers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedApprovers.map(a => (
                    <div key={a.name} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full pl-1 pr-2 py-1">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">{a.initials}</div>
                      <div>
                        <div className="text-xs font-medium text-gray-800 leading-tight">{a.name}</div>
                        <div className="text-[10px] text-gray-500">{a.dept}</div>
                      </div>
                      <button onClick={() => setSelectedApprovers(prev => prev.filter(x => x.name !== a.name))} className="text-gray-400 hover:text-red-500 ml-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {selectedApprovers.length === 0 && (
                <p className="text-xs text-red-500 mb-2">Add at least one approver to continue.</p>
              )}

              {/* Search + list */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    value={approverSearch}
                    onChange={e => setApproverSearch(e.target.value)}
                    placeholder="Search users to add as approvers"
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {approverOptions
                    .filter(a =>
                      !selectedApprovers.find(s => s.name === a.name) &&
                      (a.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
                       a.email.toLowerCase().includes(approverSearch.toLowerCase()))
                    )
                    .map(a => (
                      <button
                        key={a.name}
                        onClick={() => { setSelectedApprovers(prev => [...prev, a]); setApproverSearch(""); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center shrink-0">{a.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800">{a.name}</div>
                          <div className="text-xs text-gray-400">{a.email}</div>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{a.dept}</span>
                        <span className="text-xs text-blue-600 font-medium shrink-0">+ Add</span>
                      </button>
                    ))
                  }
                  {approverOptions.filter(a =>
                    !selectedApprovers.find(s => s.name === a.name) &&
                    (a.name.toLowerCase().includes(approverSearch.toLowerCase()) ||
                     a.email.toLowerCase().includes(approverSearch.toLowerCase()))
                  ).length === 0 && (
                    <div className="px-4 py-4 text-sm text-gray-400 text-center">
                      {approverSearch ? "No users match your search." : "All available users have been added."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Approval flow preview */}
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Approval Flow Preview</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Requester */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">You</div>
                  <span className="text-[10px] text-gray-400">Requester</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
                <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs font-semibold text-blue-700">Request submitted</div>
                  <div className="text-[10px] text-blue-500 mt-0.5">Routed automatically</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
                {/* Approvers */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex -space-x-2">
                    {selectedApprovers.map(a => (
                      <div key={a.name} title={a.name} className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                        {a.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {selectedApprovers.length > 0 ? `${selectedApprovers.length} approver${selectedApprovers.length > 1 ? "s" : ""}` : "No approvers"}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-medium text-green-700">Approved</div>
                  <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Review & Create</h2>

            {[
              {
                title: "Basic Details",
                rows: [
                  ["Category Name", catName || "Finance Operations"],
                  ["Description", desc || "Finance and accounting-related access"],
                  ["Status", "Active"],
                ],
              },
              {
                title: "Base Permissions",
                rows: [
                  ["Modules selected", selectedModules.size > 0 ? `${selectedModules.size} modules` : "All modules"],
                  ["Included modules", selectedModules.size > 0 ? [...selectedModules].join(", ") : allModules.join(", ")],
                ],
              },
              {
                title: "Approvers",
                rows: [
                  ["Approvers", selectedApprovers.length > 0 ? selectedApprovers.map(a => a.name).join(", ") : "None"],
                  ["Approval flow", "Request → Review → Approved / Rejected"],
                ],
              },
            ].map(card => (
              <div key={card.title} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">{card.title}</h3>
                  <button className="text-xs text-blue-600 hover:underline">Edit</button>
                </div>
                <dl className="space-y-2">
                  {card.rows.map(([k, v]) => (
                    <div key={k} className="flex gap-4 text-sm">
                      <dt className="text-gray-500 w-40 shrink-0">{k}</dt>
                      <dd className="text-gray-800 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}

            <label className="flex items-start gap-2 cursor-pointer p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-blue-600 mt-0.5" />
              <span className="text-sm text-yellow-800">I understand that roles under this category cannot access modules outside the selected base permission set.</span>
            </label>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-8 py-4 flex items-center gap-3 bg-white">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Back</button>
        )}
        <button onClick={() => onNavigate("role-categories")} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        <div className="flex-1" />
        <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Save as Draft</button>
        <button
          onClick={handleContinue}
          disabled={step === 3 && !confirmed}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? "Create Role Category" : "Continue"}
        </button>
      </div>
    </div>
  );
}
