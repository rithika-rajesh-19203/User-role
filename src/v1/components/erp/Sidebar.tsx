import { ChevronRight, ChevronDown } from "lucide-react";
import type { Screen } from "./types";

interface Props {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

const orgSections = [
  { label: "Organization", key: null },
  {
    label: "Users & Roles",
    key: "users-roles",
    children: [
      { label: "Users", key: "users" as Screen },
      { label: "Roles", key: "roles" as Screen },
      { label: "User Preferences", key: null },
    ],
  },
  { label: "Taxes & Compliance", key: null },
  { label: "Setup & Configurations", key: null },
  { label: "Customization", key: null },
  { label: "Automation", key: null },
];

const moduleSections = [
  "General", "Inventory", "Online Payments", "Sales",
  "Subscriptions", "Purchases", "Travel & Expense",
];

const usersRolesScreens: Screen[] = ["users", "roles", "new-role", "my-role-requests"];

export default function Sidebar({ current, onNavigate }: Props) {
  const expanded = usersRolesScreens.includes(current);

  return (
    <div className="zf-sidebar w-[220px] shrink-0 border-r overflow-y-auto">
      <div className="pt-4 pb-6">
        <div className="px-4 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
          Organization Settings
        </div>

        {orgSections.map((item) => {
          if (item.key === "users-roles") {
            return (
              <div key="users-roles">
                <button className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  {expanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                  <span>{item.label}</span>
                </button>
                {expanded && item.children && (
                  <div>
                    {item.children.map((child) => {
                      const isActive =
                        child.key === current ||
                        (child.key === "roles" && current === "new-role") ||
                        (child.key === "users" && current === "my-role-requests");
                      return (
                        <button
                          key={child.label}
                          onClick={() => child.key && onNavigate(child.key)}
                          className={`w-full text-left px-8 py-1.5 text-sm ${
                            isActive
                              ? "bg-[#eef4ff] text-[#2959d6] font-medium border-r-2 border-r-[#2959d6]"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button key={item.label} className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <ChevronRight size={13} className="text-gray-400" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="px-4 pt-5 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em]">
          Module Settings
        </div>
        {moduleSections.map((label) => (
          <button key={label} className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
            <ChevronRight size={13} className="text-gray-400" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
