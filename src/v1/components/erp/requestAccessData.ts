export interface UserRow {
  initials: string;
  color: string;
  name: string;
  badge: string | null;
  badgeColor: string;
  email: string;
  role: string;
  status: string;
}

export const usersData: UserRow[] = [
  { initials: "KS", color: "bg-indigo-500", name: "Kavya Srinivasan", badge: null, badgeColor: "", email: "kavya.srinivasan@company.com", role: "Accountant", status: "Active" },
  { initials: "R", color: "bg-blue-600", name: "Rithika", badge: "Super Admin", badgeColor: "text-amber-700 bg-amber-50 border-amber-200", email: "rithika.rajesh@zohotest.com", role: "Admin", status: "Active" },
  { initials: "RV", color: "bg-emerald-600", name: "Rahul Verma", badge: null, badgeColor: "", email: "rahul.verma@company.com", role: "Procurement Manager", status: "Active" },
  { initials: "AS", color: "bg-purple-500", name: "Anjali Sharma", badge: null, badgeColor: "", email: "anjali.sharma@company.com", role: "Accountant", status: "Active" },
  { initials: "VN", color: "bg-rose-500", name: "Vikram Nair", badge: null, badgeColor: "", email: "vikram.nair@company.com", role: "Manufacturing Mgr", status: "Inactive" },
  { initials: "MP", color: "bg-cyan-600", name: "Meera Pillai", badge: null, badgeColor: "", email: "meera.pillai@company.com", role: "Retail Staff", status: "Active" },
];

export const allRoles = [
  "Accountant", "Accounts Payable Manager", "Accounts Receivable Manager",
  "Admin", "Employee", "Manufacturing Manager", "Procurement Manager",
  "Quality Manager", "Retail Manager", "Retail Staff", "Shopfloor Staff",
];

export const roleSummaries: Record<string, string> = {
  Accountant: "Handles accounting operations, reconciliations, and day-to-day finance records.",
  "Accounts Payable Manager": "Oversees supplier invoices, payment approvals, and payable exceptions.",
  "Accounts Receivable Manager": "Manages collections, invoice escalations, and customer credit adjustments.",
  Admin: "Provides broad system administration access across users, roles, and configurations.",
  Employee: "Gives standard employee access for everyday self-service and assigned workflows.",
  "Manufacturing Manager": "Coordinates production planning, shift supervision, and plant-level approvals.",
  "Procurement Manager": "Handles purchase requests, vendor approvals, and sourcing operations.",
  "Quality Manager": "Manages quality reviews, inspection escalations, and compliance approvals.",
  "Retail Manager": "Runs store operations, stock transfers, cashier overrides, and retail approvals.",
  "Retail Staff": "Supports point-of-sale activities, customer service, and in-store operations.",
  "Shopfloor Staff": "Covers operational tasks on the production floor with limited execution access.",
};

export const myselfUser = usersData.find((user) => user.email === "rithika.rajesh@zohotest.com") ?? usersData[0];

export function getEmailSuggestions(query: string, limit = 6) {
  const value = query.trim().toLowerCase();
  if (!value) {
    return [];
  }

  return usersData
    .filter((user) => user.email.toLowerCase().includes(value))
    .slice(0, limit);
}
