import { useState } from "react";
import { Search, ChevronUp, ChevronDown, MoreHorizontal, Filter } from "lucide-react";
import type { Screen } from "../types";

const roles = [
  { name: "Accountant", category: "Finance Operations", type: "User", description: "Maintains the Accounting.", users: 3, status: "Active" },
  { name: "Accounts Payable Manager", category: "Finance Operations", type: "User", description: "Maintains accurate payable records.", users: 1, status: "Active" },
  { name: "Accounts Receivable Manager", category: "Finance Operations", type: "User", description: "Maintains accurate receivable records.", users: 2, status: "Active" },
  { name: "Admin", category: "System Administration", type: "User", description: "Unrestricted access to all modules.", users: 1, status: "Active" },
  { name: "Employee", category: "Human Resources", type: "Employee", description: "Employee Role with full access", users: 24, status: "Active" },
  { name: "Employee (Payroll Only)", category: "Human Resources", type: "Employee", description: "Employee Role only with payroll access", users: 8, status: "Active" },
  { name: "Employee (Submitter)", category: "Human Resources", type: "Employee", description: "Employee Role", users: 12, status: "Active" },
  { name: "Manufacturing Manager", category: "Manufacturing", type: "User", description: "Oversees the production process in a factory", users: 2, status: "Active" },
  { name: "Procurement Manager", category: "Procurement", type: "User", description: "Oversees the process of purchasing goods and services", users: 1, status: "Active" },
  { name: "Quality Engineer", category: "Manufacturing", type: "User", description: "Ensures the quality of products and services.", users: 3, status: "Active" },
  { name: "Quality Manager", category: "Manufacturing", type: "User", description: "Oversees the quality assurance process.", users: 1, status: "Active" },
  { name: "Retail Manager", category: "Retail Operations", type: "User", description: "Oversees the daily operations of a retail store.", users: 4, status: "Active" },
  { name: "Retail Staff", category: "Retail Operations", type: "Retail Staff", description: "Assists customers and manages sales in a retail store.", users: 16, status: "Active" },
  { name: "Shopfloor Staff", category: "Manufacturing", type: "Shopfloor Staff", description: "Shop Floor Worker", users: 9, status: "Active" },
];

interface Props { onNavigate: (s: Screen) => void }

export default function RolesScreen({ onNavigate }: Props) {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = roles
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-8 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("role-categories")}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Role Categories
          </button>
          <button
            onClick={() => onNavigate("new-role")}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            New Role
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 pb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64">
          <Search size={13} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search roles"
            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
          />
        </div>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
          <Filter size={12} /> Role Category
        </button>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
          <Filter size={12} /> Role Type
        </button>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">
          <Filter size={12} /> Status
        </button>
      </div>

      {/* Table */}
      <div className="px-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">
                <button
                  onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Role Name
                  {sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Role Category</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Role Type</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Description</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Users</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((role) => (
              <tr key={role.name} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="py-3 pr-4">
                  <button className="text-blue-600 hover:underline font-medium">{role.name}</button>
                </td>
                <td className="py-3 pr-4 text-gray-600">{role.category}</td>
                <td className="py-3 pr-4 text-gray-700">{role.type}</td>
                <td className="py-3 pr-4 text-gray-600 max-w-xs">{role.description}</td>
                <td className="py-3 pr-4">
                  <span className="text-blue-600 font-medium">{role.users}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {role.status}
                  </span>
                </td>
                <td className="py-3 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === role.name ? null : role.name)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenu === role.name && (
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
        <div className="py-4 text-xs text-gray-400">{filtered.length} roles</div>
      </div>
    </div>
  );
}
