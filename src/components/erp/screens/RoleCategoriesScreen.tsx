import { useState } from "react";
import { Search, Filter, MoreHorizontal, Shield, Users } from "lucide-react";
import type { Screen } from "../types";

const categories = [
  { name: "Finance Operations", description: "Finance and accounting-related access", roles: 4, permissions: 28, approvers: 2, status: "Active", updated: "02 Sep 2026" },
  { name: "Inventory & Warehouse", description: "Inventory tracking and warehouse management", roles: 3, permissions: 18, approvers: 1, status: "Active", updated: "28 Aug 2026" },
  { name: "Sales & Customer Operations", description: "Sales pipeline and customer management access", roles: 5, permissions: 22, approvers: 2, status: "Active", updated: "25 Aug 2026" },
  { name: "Manufacturing", description: "Production floor and quality control access", roles: 4, permissions: 15, approvers: 1, status: "Active", updated: "20 Aug 2026" },
  { name: "Procurement", description: "Purchasing and vendor management access", roles: 2, permissions: 14, approvers: 1, status: "Active", updated: "15 Aug 2026" },
  { name: "Human Resources", description: "Employee management and payroll access", roles: 3, permissions: 20, approvers: 2, status: "Active", updated: "10 Aug 2026" },
  { name: "Retail Operations", description: "Retail store management and POS access", roles: 3, permissions: 16, approvers: 1, status: "Active", updated: "05 Aug 2026" },
  { name: "System Administration", description: "Full system configuration and admin access", roles: 1, permissions: 48, approvers: 2, status: "Active", updated: "01 Aug 2026" },
];

interface Props { onNavigate: (s: Screen) => void }

export default function RoleCategoriesScreen({ onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showEmpty] = useState(false);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (showEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <Shield size={32} className="text-gray-300" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-gray-800">No role categories created yet.</div>
          <div className="text-sm text-gray-500 mt-1">Create permission boundaries for a group of related roles.</div>
        </div>
        <button
          onClick={() => onNavigate("create-role-category")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Role Category
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-8 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Role Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create permission boundaries for a group of related roles and assign approvers for access requests.
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-role-category")}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shrink-0 mt-1"
        >
          New Role Category
        </button>
      </div>

      <div className="px-8 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-72">
          <Search size={13} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search role categories"
            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
          />
        </div>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
          <Filter size={12} /> Status
        </button>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
          <Filter size={12} /> Approver
        </button>
      </div>

      <div className="px-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {["Category Name", "Description", "Roles", "Base Permissions", "Approvers", "Status", "Last Updated", "Actions"].map(h => (
                <th key={h} className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => (
              <tr key={cat.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <button
                    onClick={() => onNavigate("role-category-detail")}
                    className="text-blue-600 hover:underline font-medium whitespace-nowrap"
                  >
                    {cat.name}
                  </button>
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs max-w-[160px]">{cat.description}</td>
                <td className="py-3 pr-4">
                  <span className="text-blue-600 text-xs font-medium">{cat.roles} roles</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-blue-600 text-xs font-medium">{cat.permissions} permissions</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-gray-700 text-xs">{cat.approvers}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {cat.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{cat.updated}</td>
                <td className="py-3 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === cat.name ? null : cat.name)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenu === cat.name && (
                    <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-36 py-1">
                      {["View", "Edit", "Duplicate", "Deactivate"].map(action => (
                        <button
                          key={action}
                          onClick={() => setOpenMenu(null)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${action === "Deactivate" ? "text-red-600" : "text-gray-700"}`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="py-4 text-xs text-gray-400">{filtered.length} role categories</div>
      </div>
    </div>
  );
}
