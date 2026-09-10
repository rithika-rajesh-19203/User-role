import { ChevronLeft } from "lucide-react";
import type { Screen } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
}

const myRoleRequests = [
  { id: "AR-000129", roleRequested: "Retail Manager", validity: "03 Sep – 30 Sep 2026", requester: "Rithika", status: "Submitted", submittedAt: "03 Sep 2026, 09:18 AM" },
  { id: "AR-000127", roleRequested: "Accounts Receivable Manager", validity: "01 Sep – 30 Sep 2026", requester: "Rithika", status: "Pending Approval", submittedAt: "01 Sep 2026, 11:30 AM" },
  { id: "AR-000124", roleRequested: "Procurement Manager", validity: "No expiry", requester: "Kavya Srinivasan", status: "Submitted", submittedAt: "30 Aug 2026, 04:42 PM" },
  { id: "AR-000121", roleRequested: "Quality Manager", validity: "15 Aug – 15 Sep 2026", requester: "Rahul Verma", status: "Approved", submittedAt: "14 Aug 2026, 02:07 PM" },
];

const statusColors: Record<string, string> = {
  Submitted: "text-blue-700 bg-blue-50 border-blue-200",
  "Pending Approval": "text-yellow-700 bg-yellow-50 border-yellow-200",
  Approved: "text-green-700 bg-green-50 border-green-200",
  Rejected: "text-red-700 bg-red-50 border-red-200",
  Expired: "text-orange-700 bg-orange-50 border-orange-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ${statusColors[status] ?? "text-gray-500 bg-gray-50 border-gray-200"}`}>
      {status}
    </span>
  );
}

export default function MyRoleRequestsScreen({ onNavigate }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="px-8 pt-6 pb-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate("users")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={14} /> Users
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">My Role Requests</h1>
        </div>
        <button
          onClick={() => onNavigate("request-access")}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Request Role
        </button>
      </div>

      <div className="px-8 pb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Requester</th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Role Requested</th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Validity</th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {myRoleRequests.map((request) => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-700 text-xs font-medium">{request.requester}</td>
                <td className="py-3 pr-4 text-gray-700 text-xs font-medium">{request.roleRequested}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{request.validity}</td>
                <td className="py-3 pr-4"><StatusBadge status={request.status} /></td>
                <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">{request.submittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pt-3 text-xs text-gray-400">{myRoleRequests.length} requests</p>
      </div>
    </div>
  );
}
