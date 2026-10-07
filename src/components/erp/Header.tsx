import { useState } from "react";
import {
  Search, X, ChevronLeft, ChevronRight, ChevronDown, LogOut, MessageSquare, Mail, Phone, Check,
} from "lucide-react";
import type { Screen } from "./types";

const CURRENT_ROLE = "Admin";
const ORG_NAME = "AdventNet Org";
const ORG_ID = "117146592";
const MY_ROLES = [
  { name: "Admin", expiry: "Expiring in 2 months" },
  { name: "Distribution Admin", expiry: "Expires on 10 Sep 2026" },
  { name: "Manufacturing Manager", expiry: "Expiring in 3 weeks" },
];
const ACTIVE_ROLE = "Admin";

function OrgPanel({
  onClose,
  onOpenMyRoleRequests,
}: {
  onClose: () => void;
  onOpenMyRoleRequests: () => void;
}) {
  return (
    <>
      <div className="zf-scrim fixed inset-0 z-40" onClick={onClose} />
      <div className="zf-elevated fixed top-0 right-0 h-full z-50 w-[320px] border-l flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{ORG_NAME}</p>
                <p className="text-xs text-gray-400 mt-0.5">Organization ID: {ORG_ID}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
          <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16" />
            </svg>
            Switch Organization
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">My Roles</span>
            <button
              onClick={onOpenMyRoleRequests}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              My Role Request
            </button>
          </div>
          <div>
            {MY_ROLES.map(({ name, expiry }) => {
              const isActive = name === ACTIVE_ROLE;
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between px-5 py-3.5 border-b border-gray-50 transition-colors cursor-pointer hover:bg-gray-50 ${isActive ? "bg-blue-50 border-l-[3px] border-l-blue-500 pl-[17px]" : ""}`}
                >
                  <div>
                    <p className={`text-sm ${isActive ? "font-semibold text-gray-900" : "text-gray-700"}`}>{name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{expiry}</p>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function UserPanel({
  onClose,
  onOpenRequestAccess,
}: {
  onClose: () => void;
  onOpenRequestAccess: () => void;
}) {
  return (
    <>
      <div className="zf-scrim fixed inset-0 z-40" onClick={onClose} />
      <div className="zf-elevated fixed top-0 right-0 h-full z-50 w-[340px] border-l overflow-y-auto flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center border border-blue-300 rounded text-blue-500 hover:bg-blue-50"
          >
            <X size={13} />
          </button>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Rithika</p>
              <p className="text-xs text-gray-500">rithika.rajesh@zohotest.com</p>
              <p className="text-xs text-gray-400 mt-1">User ID: 84291037 &nbsp;·&nbsp; Org ID: {ORG_ID}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button className="text-xs text-blue-600 font-medium hover:underline">My Account</button>
            <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">My Current Role</p>
              <p className="text-xs font-semibold text-gray-800">{CURRENT_ROLE}</p>
            </div>
          </div>
          <button
            onClick={onOpenRequestAccess}
            className="text-xs text-blue-600 font-medium hover:underline hover:text-blue-700 whitespace-nowrap"
          >
            Request Role
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-xs text-gray-600">This organization is in the <span className="font-medium text-gray-800">Premium plan</span>.</p>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            {[{ icon: "📄", label: "Help\nDocuments" }, { icon: "🔍", label: "Explore\nFeatures" }].map(item => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-2 py-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-700 font-medium text-center leading-tight whitespace-pre-line">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-sm font-bold text-gray-900 mb-3">Need Assistance?</p>
          <div className="space-y-3">
            <button className="w-full flex items-start gap-3 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 text-left group">
              <MessageSquare size={16} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1">
                  Chat with our experts <ChevronRight size={11} />
                </p>
                <p className="text-[11px] text-gray-400">(Mon to Fri 10:00AM – 7:00PM)</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 text-left group">
              <Mail size={16} className="text-gray-500 shrink-0" />
              <p className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1">
                Send an email <ChevronRight size={11} />
              </p>
            </button>
            <div className="flex items-start gap-3 p-1.5 -mx-1.5">
              <Phone size={16} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                  Talk to us
                  <span className="text-[11px] text-gray-400 font-normal">(Mon – Fri · 9:00 AM – 7:00 PM · Toll Free)</span>
                </p>
                <p className="text-xs text-gray-700 mt-0.5">India – <span className="font-semibold">18004196933</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 text-xs text-gray-400">For security reasons, this panel auto-closes when you navigate.</div>
      </div>
    </>
  );
}

export default function Header({
  onNavigate,
  onOpenRequestAccess,
}: {
  onNavigate: (screen: Screen) => void;
  onOpenRequestAccess: () => void;
}) {
  const [showOrg, setShowOrg] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  function openOrg() {
    setShowOrg(true);
    setShowPanel(false);
  }

  function openUser() {
    setShowPanel(true);
    setShowOrg(false);
  }

  function navigateAndClose(screen: Screen) {
    setShowOrg(false);
    setShowPanel(false);
    onNavigate(screen);
  }

  return (
    <div className="zf-topbar h-14 border-b flex items-center px-4 gap-3 shrink-0 z-10 relative">
      <div className="flex items-center gap-2 w-[220px] shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5" />
            <ellipse cx="9" cy="9" rx="3.5" ry="7" stroke="white" strokeWidth="1.5" />
            <line x1="2" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <button className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 py-0.5">
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <div>
          <div className="text-sm font-semibold text-gray-900 leading-tight">All Settings</div>
          <div className="text-xs text-gray-500 leading-tight">Rithika ERP</div>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-[#dbe3ee] bg-[#f7f9fc] px-3 py-1.5 w-80 text-sm text-slate-400">
          <Search size={13} />
          <span>Search settings</span>
          <span className="ml-auto text-xs bg-gray-200 rounded px-1.5 py-0.5 text-gray-500">/ /</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={openOrg}
          className={`flex items-center gap-1.5 text-sm font-medium rounded-md px-2.5 py-1.5 transition-colors ${showOrg ? "bg-[#eef4ff] text-[#2959d6]" : "text-slate-700 hover:bg-slate-100"}`}
        >
          {ORG_NAME}
          <ChevronDown size={13} className={`transition-transform ${showOrg ? "rotate-180 text-blue-500" : "text-gray-400"}`} />
        </button>

        <button
          onClick={openUser}
          className={`w-8 h-8 rounded-md border border-[#dbe3ee] flex items-center justify-center transition-colors ${showPanel ? "bg-[#eef4ff] ring-2 ring-[#93c5fd]" : "bg-[#f7f9fc] hover:bg-slate-100"}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showPanel ? "#2563eb" : "#6b7280"} strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-[#dbe3ee] rounded-md px-3 py-1.5 bg-white">
          Close Settings
          <X size={13} className="text-gray-400" />
        </button>
      </div>

      {showOrg && (
        <OrgPanel
          onClose={() => setShowOrg(false)}
          onOpenMyRoleRequests={() => navigateAndClose("my-role-requests")}
        />
      )}

      {showPanel && (
        <UserPanel
          onClose={() => setShowPanel(false)}
          onOpenRequestAccess={() => {
            setShowPanel(false);
            onOpenRequestAccess();
          }}
        />
      )}
    </div>
  );
}
