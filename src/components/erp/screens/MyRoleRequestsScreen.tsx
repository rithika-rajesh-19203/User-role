import { useState } from "react";
import { ChevronLeft, FileText, UserCheck, X } from "lucide-react";
import type { Screen } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
  onOpenRequestAccess: () => void;
}

type RequestStatus = "Pending Approval" | "Approved" | "Rejected";

interface RoleRequestRecord {
  id: string;
  requester: string;
  requesterEmail: string;
  requestedFor: string;
  requestedRole: string;
  currentRole: string;
  roleAfterExpiry: string;
  validity: string;
  accessType: string;
  department: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string;
  rejectedReason?: string;
}

const myRoleRequests: RoleRequestRecord[] = [
  {
    id: "AR-000129",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Retail Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "03 Sep – 30 Sep 2026",
    accessType: "Temporary elevation",
    department: "Retail Operations",
    reason: "Need temporary access to manage festive store operations, stock transfers, and cashier overrides during the seasonal launch.",
    status: "Pending Approval",
    submittedAt: "03 Sep 2026, 09:18 AM",
  },
  {
    id: "AR-000127",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Accounts Receivable Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "01 Sep – 30 Sep 2026",
    accessType: "Temporary elevation",
    department: "Finance",
    reason: "Required to clear month-end invoice escalations and approve credit note adjustments while the primary manager is on leave.",
    status: "Pending Approval",
    submittedAt: "01 Sep 2026, 11:30 AM",
  },
  {
    id: "AR-000124",
    requester: "Kavya Srinivasan",
    requesterEmail: "kavya.srinivasan@company.com",
    requestedFor: "Kavya Srinivasan",
    requestedRole: "Procurement Manager",
    currentRole: "Accountant",
    roleAfterExpiry: "Accountant",
    validity: "No expiry",
    accessType: "Permanent change",
    department: "Procurement",
    reason: "Transitioning into the procurement lead role permanently to manage vendor approvals, purchase orders, and intake planning.",
    status: "Pending Approval",
    submittedAt: "30 Aug 2026, 04:42 PM",
  },
  {
    id: "AR-000121",
    requester: "Rahul Verma",
    requesterEmail: "rahul.verma@company.com",
    requestedFor: "Rahul Verma",
    requestedRole: "Quality Manager",
    currentRole: "Procurement Manager",
    roleAfterExpiry: "Procurement Manager",
    validity: "15 Aug – 15 Sep 2026",
    accessType: "Temporary elevation",
    department: "Manufacturing",
    reason: "Covering the quality function during the annual audit period to handle NCR approvals and inspection escalations.",
    status: "Approved",
    submittedAt: "14 Aug 2026, 02:07 PM",
  },
  {
    id: "AR-000118",
    requester: "Rithika",
    requesterEmail: "rithika.rajesh@zohotest.com",
    requestedFor: "Rithika",
    requestedRole: "Manufacturing Manager",
    currentRole: "Admin",
    roleAfterExpiry: "Admin",
    validity: "10 Aug – 31 Aug 2026",
    accessType: "Temporary elevation",
    department: "Manufacturing",
    reason: "Requested temporary plant oversight access to handle shift escalations during the supervisor transition period.",
    status: "Rejected",
    submittedAt: "09 Aug 2026, 05:10 PM",
    rejectedReason: "The request was declined because the current plant transition does not require temporary manager access and the supervisor backup plan is already in place.",
  },
];

const statusColors: Record<string, string> = {
  "Pending Approval": "text-yellow-700 bg-yellow-50 border-yellow-200",
  Approved: "text-green-700 bg-green-50 border-green-200",
  Rejected: "text-red-700 bg-red-50 border-red-200",
  Expired: "text-orange-700 bg-orange-50 border-orange-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`zf-status-badge inline-flex items-center text-xs font-medium border rounded-sm px-2 py-0.5 whitespace-nowrap ${statusColors[status] ?? "text-gray-500 bg-gray-50 border-gray-200"}`}>
      {status}
    </span>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="break-words text-sm text-gray-800">{value}</p>
    </div>
  );
}

function RequestDetailsSidebar({
  request,
  onClose,
}: {
  request: RoleRequestRecord;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex">
      <div className="zf-scrim flex-1" onClick={onClose} />
      <aside className="zf-side-panel flex w-full max-w-[620px] flex-col">
        <div className="zf-side-panel__header shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Role Request</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">{request.id}</h2>
            <p className="mt-1 text-sm text-gray-500">View the request details and the latest decision.</p>
          </div>
          <button onClick={onClose} className="mt-0.5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="zf-side-panel__body space-y-5">
          <section className="zf-side-panel__section p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <UserCheck size={22} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-semibold text-gray-900">{request.requestedRole}</h3>
                  <p className="text-sm text-gray-500 mt-1">Requested for {request.requestedFor}</p>
                </div>
              </div>
              <div className="self-start">
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div className="zf-detail-grid zf-detail-grid--compact zf-detail-grid--triple mt-5 border-t border-dashed border-gray-200 pt-4">
              <DetailBlock label="Submitted" value={request.submittedAt} />
              <DetailBlock label="Validity" value={request.validity} />
              <DetailBlock label="Access type" value={request.accessType} />
            </div>
          </section>

          <div className="zf-side-panel__section px-5 py-5">
            <section>
              <h4 className="text-lg font-semibold text-gray-900">Request Details</h4>
              <div className="zf-detail-grid zf-detail-grid--double mt-4">
                <DetailBlock label="Requester" value={request.requester} />
                <DetailBlock label="Requested for" value={request.requestedFor} />
                <DetailBlock label="Current role" value={request.currentRole} />
                <DetailBlock label="Validity" value={request.validity} />
              </div>
            </section>

            <section className="border-t border-gray-100 pt-6 mt-6">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900">Business Justification</h4>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{request.reason}</p>
            </section>

            {request.status === "Rejected" && request.rejectedReason && (
              <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">Rejected reason</p>
                <p className="mt-2 text-sm leading-6 text-red-800">{request.rejectedReason}</p>
              </section>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function MyRoleRequestsScreen({ onNavigate, onOpenRequestAccess }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<RoleRequestRecord | null>(null);

  function openRequestDetails(request: RoleRequestRecord) {
    setSelectedRequest(request);
  }

  return (
    <div className="flex-1 bg-white relative overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="zf-page-header">
          <div>
            <button
              onClick={() => onNavigate("users")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <ChevronLeft size={14} /> Users
            </button>
            <p className="zf-page-header__eyebrow mt-4">Personal Access Queue</p>
            <h1 className="zf-page-header__title">My Role Requests</h1>
            <p className="zf-page-header__description">
              Track every submitted request in one place and open any item to review the current decision details.
            </p>
          </div>
          <button
            onClick={onOpenRequestAccess}
            className="zf-btn zf-btn-primary"
          >
            Request Role
          </button>
        </div>

        <div className="px-8 pb-6">
          <div className="zf-surface-card overflow-hidden rounded-2xl">
          <table className="zf-card-table w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pl-0 text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Requester</th>
                <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Role Requested</th>
                <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Validity</th>
                <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left py-2.5 pr-4 font-medium text-gray-400 text-xs uppercase tracking-wide">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {myRoleRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => openRequestDetails(request)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="pl-0 py-3 pr-4 text-gray-700 text-xs font-medium">{request.requester}</td>
                  <td className="py-3 pr-4">
                    <div className="text-xs font-medium text-blue-600">{request.requestedRole}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{request.id}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{request.validity}</td>
                  <td className="py-3 pr-4"><StatusBadge status={request.status} /></td>
                  <td className="py-3 pr-0 text-gray-400 text-xs whitespace-nowrap">{request.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <p className="pt-3 text-xs text-gray-400">{myRoleRequests.length} requests</p>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailsSidebar
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
