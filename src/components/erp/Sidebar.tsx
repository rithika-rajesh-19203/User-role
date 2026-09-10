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

const usersRolesScreens: Screen[] = ["users", "roles", "new-role", "request-access", "my-role-requests"];

export default function Sidebar({ current, onNavigate }: Props) {
  const expanded = usersRolesScreens.includes(current);

  return (
    <div className="w-[220px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="pt-4 pb-6">
        <div className="px-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Organization Settings
        </div>

        {orgSections.map((item) => {
          if (item.key === "users-roles") {
            return (
              <div key="users-roles">
                <button className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  {expanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                  <span>{item.label}</span>
                </button>
                {expanded && item.children && (
                  <div>
                    {item.children.map((child) => {
                      const isActive =
                        child.key === current ||
                        (child.key === "roles" && current === "new-role") ||
                        (child.key === "users" && ["request-access", "my-role-requests"].includes(current));
                      return (
                        <button
                          key={child.label}
                          onClick={() => child.key && onNavigate(child.key)}
                          className={`w-full text-left px-8 py-1.5 text-sm ${
                            isActive
                              ? "bg-blue-600 text-white font-medium"
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
            <button key={item.label} className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              <ChevronRight size={13} className="text-gray-400" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="px-4 pt-5 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Module Settings
        </div>
        {moduleSections.map((label) => (
          <button key={label} className="w-full flex items-center gap-1 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
            <ChevronRight size={13} className="text-gray-400" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
