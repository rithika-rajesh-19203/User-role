import React, { useState } from "react";
import { X, ChevronDown, ChevronRight, Search } from "lucide-react";
import type { Screen } from "../types";

// Modules and their particulars matching the reference image layout
const modules = [
  "Contacts", "Employee", "Salesperson", "Items", "Inventory",
  "Sales Orders", "Purchase Orders", "Bills", "Payments",
  "Manufacturing", "Reports", "Automation",
];

type PermRow = { name: string; sub?: string };

const moduleParticulars: Record<string, PermRow[]> = {
  "Contacts":       [{ name: "Customers" }, { name: "Vendors", sub: "Allow users to add, edit and delete vendor's bank account details." }, { name: "Contacts" }],
  "Employee":       [{ name: "Employees" }, { name: "Departments" }, { name: "Designations" }],
  "Salesperson":    [{ name: "Salespersons" }, { name: "Sales Targets" }],
  "Items":          [{ name: "Items" }, { name: "Item Groups" }, { name: "Price Lists" }, { name: "Units of Measure" }],
  "Inventory":      [{ name: "Warehouses" }, { name: "Stock Adjustments" }, { name: "Stock Transfers" }],
  "Sales Orders":   [{ name: "Sales Orders" }, { name: "Invoices" }, { name: "Credit Notes" }, { name: "Delivery Orders" }],
  "Purchase Orders":[{ name: "Purchase Orders" }, { name: "Bills" }, { name: "Debit Notes" }, { name: "Goods Receipts" }],
  "Bills":          [{ name: "Bills" }, { name: "Vendor Credits" }],
  "Payments":       [{ name: "Customer Payments" }, { name: "Vendor Payments" }, { name: "Bank Accounts" }],
  "Manufacturing":  [{ name: "Production Orders" }, { name: "Bill of Materials" }, { name: "Work Centers" }],
  "Reports":        [{ name: "Financial Reports" }, { name: "Inventory Reports" }, { name: "Sales Reports" }, { name: "Custom Reports" }],
  "Automation":     [{ name: "Workflows" }, { name: "Scheduled Reports" }, { name: "Custom Functions" }],
};

const permCols = ["FULL", "VIEW", "CREATE", "EDIT", "DELETE"];

type PermKey = `${string}:${string}`;

interface Props { onNavigate: (s: Screen) => void }

export default function NewRoleScreen({ onNavigate }: Props) {
  const [step, setStep] = useState(1); // 1 = General, 2 = Segmented Access Control (unused, just label)
  const [roleName, setRoleName] = useState("");
  const [roleType, setRoleType] = useState("User");
  const [desc, setDesc] = useState("");
  const [apiOnly, setApiOnly] = useState(false);
  const [activeModule, setActiveModule] = useState("Contacts");
  const [moduleSearch, setModuleSearch] = useState("");
  const [perms, setPerms] = useState<Record<PermKey, boolean>>(() => {
    // Pre-check all for Contacts/Customers and Contacts/Vendors
    const init: Record<PermKey, boolean> = {};
    ["Customers", "Vendors"].forEach(row => {
      permCols.forEach(col => { init[`Contacts:${row}:${col}`] = true; });
    });
    return init;
  });
  const [subPerms, setSubPerms] = useState<Record<string, boolean>>({});
  const [roleNameError, setRoleNameError] = useState(false);
  const [success, setSuccess] = useState(false);

  function togglePerm(key: PermKey) {
    setPerms(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleRow(module: string, row: string, checked: boolean) {
    const next = { ...perms };
    permCols.forEach(col => { next[`${module}:${row}:${col}` as PermKey] = checked; });
    setPerms(next);
  }

  function isRowChecked(module: string, row: string) {
    return permCols.every(col => perms[`${module}:${row}:${col}` as PermKey]);
  }

  function isRowPartial(module: string, row: string) {
    const vals = permCols.map(col => !!perms[`${module}:${row}:${col}` as PermKey]);
    return vals.some(Boolean) && !vals.every(Boolean);
  }

  function handleProceed() {
    if (!roleName.trim()) { setRoleNameError(true); return; }
    if (step === 1) { setStep(2); return; }
    setSuccess(true);
  }

  const filteredModules = modules.filter(m =>
    m.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  const particulars = moduleParticulars[activeModule] ?? [];

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Role "{roleName}" created</div>
          <div className="text-sm text-gray-500 mt-1">The role is now available to assign to users.</div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate("roles")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Go to Roles</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Role</h1>
          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
              <span className={`text-sm font-semibold ${step === 1 ? "text-blue-600" : "text-gray-500"}`}>General</span>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>2</div>
              <span className={`text-sm ${step === 2 ? "font-semibold text-blue-600" : "text-gray-400"}`}>Segmented Access Control</span>
            </div>
          </div>
        </div>
        <button onClick={() => onNavigate("roles")} className="text-gray-400 hover:text-gray-600 mt-1">
          <X size={18} />
        </button>
      </div>

      {/* Step 1: General */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 max-w-3xl space-y-0">
            {/* Role Name */}
            <div className="flex items-start gap-8 py-4 border-b border-dashed border-gray-200">
              <label className="w-40 shrink-0 text-sm font-medium text-gray-700 pt-2">
                Role Name<span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  value={roleName}
                  onChange={e => { setRoleName(e.target.value); setRoleNameError(false); }}
                  autoFocus
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${roleNameError ? "border-red-400" : "border-blue-400"}`}
                />
                {roleNameError && <p className="text-xs text-red-500 mt-1">Role Name is required.</p>}
              </div>
            </div>

            {/* Role Type */}
            <div className="flex items-start gap-8 py-4 border-b border-dashed border-gray-200">
              <label className="w-40 shrink-0 text-sm font-medium text-gray-700 pt-2">
                Role Type<span className="text-red-500">*</span>
              </label>
              <div className="flex-1 relative max-w-xs">
                <select
                  value={roleType}
                  onChange={e => setRoleType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none appearance-none focus:border-blue-400"
                >
                  <option>User</option>
                  <option>Employee</option>
                  <option>Retail Staff</option>
                  <option>Shopfloor Staff</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-8 py-4 border-b border-dashed border-gray-200">
              <label className="w-40 shrink-0 text-sm font-medium text-gray-700 pt-2">Description</label>
              <div className="flex-1">
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Max. 500 characters"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                />
              </div>
            </div>

            {/* API only checkbox */}
            <div className="flex items-center gap-8 py-4 border-b border-dashed border-gray-200">
              <div className="w-40 shrink-0" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={apiOnly} onChange={e => setApiOnly(e.target.checked)} className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-gray-700">Users in this role can access Rithika ERP only via API.</span>
              </label>
            </div>

            {/* Define Role Permission section */}
            <div className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Define Role Permission</h2>
              <div className="flex gap-4" style={{ height: 400 }}>
                {/* Left: module list */}
                <div className="w-52 border border-gray-200 rounded-xl overflow-hidden flex flex-col shrink-0">
                  <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                      <Search size={12} className="text-gray-400" />
                      <input
                        value={moduleSearch}
                        onChange={e => setModuleSearch(e.target.value)}
                        placeholder="Search"
                        className="flex-1 text-sm outline-none placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                      <ChevronDown size={12} /> Modules
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                    {filteredModules.map(mod => (
                      <button
                        key={mod}
                        onClick={() => setActiveModule(mod)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          activeModule === mod ? "text-blue-600 font-medium bg-blue-50" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: permission grid */}
                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                  {/* Module header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2">
                    <ChevronDown size={14} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">{activeModule}</span>
                  </div>

                  {/* Column headers */}
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-48">Particulars</th>
                          {permCols.map(col => (
                            <th key={col} className="text-center px-2 py-2.5 font-semibold text-gray-500 uppercase tracking-wide w-16">{col}</th>
                          ))}
                          <th className="text-center px-2 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Others</th>
                        </tr>
                      </thead>
                      <tbody>
                        {particulars.map(row => (
                          <React.Fragment key={row.name}>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-800 font-medium">{row.name}</td>
                              {permCols.map(col => {
                                const key = `${activeModule}:${row.name}:${col}` as PermKey;
                                return (
                                  <td key={col} className="text-center px-2 py-3">
                                    <input
                                      type="checkbox"
                                      checked={!!perms[key]}
                                      onChange={() => togglePerm(key)}
                                      className="accent-blue-600 w-4 h-4"
                                    />
                                  </td>
                                );
                              })}
                              <td className="text-center px-2 py-3">
                                <button className="text-blue-600 text-xs hover:underline whitespace-nowrap">More Permissions</button>
                              </td>
                            </tr>
                            {row.sub && (
                              <tr className="border-b border-gray-100 bg-gray-50">
                                <td colSpan={7} className="px-6 py-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!subPerms[`${activeModule}:${row.name}:sub`]}
                                      onChange={e => setSubPerms(p => ({ ...p, [`${activeModule}:${row.name}:sub`]: e.target.checked }))}
                                      className="accent-blue-600 w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-gray-600">{row.sub}</span>
                                  </label>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Segmented Access Control — placeholder */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Segmented Access Control</h2>
          <p className="text-sm text-gray-500 mb-6">Define which data segments users in this role can access.</p>
          <div className="max-w-xl border border-gray-200 rounded-xl p-6 bg-gray-50 text-center text-sm text-gray-400">
            No segmented access rules configured for this role.
            <br />
            <button className="text-blue-600 mt-2 hover:underline text-sm">+ Add Segment Rule</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 px-8 py-4 flex items-center gap-3 bg-white">
        <button onClick={() => { if (step === 1) onNavigate("roles"); else setStep(1); }}
          className="px-5 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
          {step === 1 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleProceed}
          className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {step === 1 ? "Proceed" : "Create Role"}
        </button>
      </div>
    </div>
  );
}
