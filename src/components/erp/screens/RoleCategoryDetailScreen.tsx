import { useState } from "react";
import { ChevronLeft, MoreHorizontal, Info } from "lucide-react";
import type { Screen } from "../types";

const tabs = ["Overview", "Roles", "Base Permissions", "Approvers", "Access Requests", "Activity Log"];

const roles = [
  { name: "Accountant", desc: "Maintains the Accounting.", perms: 14, users: 3, status: "Active" },
  { name: "Accounts Payable Manager", desc: "Manages payable records.", perms: 20, users: 1, status: "Active" },
  { name: "Accounts Receivable Manager", desc: "Manages receivable records.", perms: 18, users: 2, status: "Active" },
  { name: "Admin", desc: "Full access to all modules.", perms: 28, users: 1, status: "Active" },
];

interface Props { onNavigate: (s: Screen) => void }

export default function RoleCategoryDetailScreen({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Sub-header */}
      <div className="px-8 pt-5 pb-4 border-b border-gray-200">
        <button onClick={() => onNavigate("role-categories")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
          <ChevronLeft size={15} /> Role Categories
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">Finance Operations</h1>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Edit Category</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-red-600 hover:bg-red-50">Deactivate</button>
            <button className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          {[
            { label: "Roles", value: "4" },
            { label: "Base Permissions", value: "28" },
            { label: "Approvers", value: "2" },
            { label: "Pending Requests", value: "3" },
          ].map(stat => (
            <div key={stat.label} className="border border-gray-200 rounded-lg px-4 py-3 min-w-[110px]">
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4 border-b border-gray-200 -mb-px">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {activeTab === "Overview" && (
          <div className="max-w-lg space-y-4">
            {[
              ["Description", "Finance and accounting-related access"],
              ["Category Owner", "Priya Menon"],
              ["Created Date", "01 Aug 2026"],
              ["Last Updated", "02 Sep 2026"],
              ["Approval Method", "Any one approver"],
              ["Request Validity Policy", "Custom (up to 30 days)"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 text-sm">
                <span className="text-gray-500 w-44 shrink-0">{k}</span>
                <span className="text-gray-800 font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Roles" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex-1 mr-4">
                <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
                Roles in this category can only contain a subset of the base permissions.
              </div>
              <button
                onClick={() => onNavigate("new-role")}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shrink-0"
              >
                New Role
              </button>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Role Name", "Description", "Permissions", "Users", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4"><button className="text-blue-600 hover:underline font-medium">{role.name}</button></td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{role.desc}</td>
                    <td className="py-3 pr-4"><span className="text-blue-600 text-xs font-medium">{role.perms}</span></td>
                    <td className="py-3 pr-4 text-gray-700">{role.users}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
                      </span>
                    </td>
                    <td className="py-3"><button className="p-1 rounded hover:bg-gray-100 text-gray-400"><MoreHorizontal size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Base Permissions" && (
          <div className="space-y-3">
            {[
              { group: "User Management", perms: ["View Users", "Invite Users", "Edit User Details"] },
              { group: "Role Management", perms: ["Manage Roles", "Manage Role Categories"] },
              { group: "Transaction Management", perms: ["View Bills", "Create Bills", "Approve Payments"] },
              { group: "Reports", perms: ["View Reports", "Export Reports"] },
            ].map(g => (
              <div key={g.group} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">{g.group}</span>
                  <span className="text-xs text-gray-500">{g.perms.length} permissions</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {g.perms.map(p => (
                    <div key={p} className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{p}</span>
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">Full Access</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Approvers" && (
          <div className="space-y-3 max-w-md">
            {[
              { name: "Priya Menon", email: "priya.menon@company.com", initials: "PM" },
              { name: "Arjun Kumar", email: "arjun.kumar@company.com", initials: "AK" },
            ].map(a => (
              <div key={a.name} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">{a.initials}</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === "Access Requests" || activeTab === "Activity Log") && (
          <div className="text-sm text-gray-500 text-center py-12">
            Click the <span className="text-blue-600">Access Requests</span> tab in the sidebar for the full module view.
          </div>
        )}
      </div>
    </div>
  );
}
