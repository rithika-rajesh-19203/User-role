import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { VERSIONS, switchVersion, versionFromUrl } from "../../../versioning/versions";

/** The UI version switcher, in the header beside the org button. */
export default function VersionMenu() {
  const current = versionFromUrl(window.location.search);
  const active = VERSIONS.find((v) => v.id === current)!;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`UI version ${active.label}`}
        className={`flex items-center gap-1.5 text-sm font-medium rounded-md border border-[#dbe3ee] px-2.5 py-1.5 transition-colors ${open ? "bg-[#eef4ff] text-[#2959d6]" : "bg-white text-slate-700 hover:bg-slate-100"}`}
      >
        {active.label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180 text-blue-500" : "text-gray-400"}`} />
      </button>

      {open && (
        <div role="menu" className="zf-elevated absolute right-0 top-full mt-1.5 z-50 w-60 rounded-lg border py-1">
          {VERSIONS.map((v) => {
            const selected = v.id === current;
            return (
              <button
                key={v.id}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => (selected ? setOpen(false) : switchVersion(v.id))}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${selected ? "bg-[#eef4ff] text-[#2959d6]" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className="font-semibold">{v.label}</span>
                <span className="text-xs text-slate-500">{v.description}</span>
                {selected && <Check size={14} className="ml-auto text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
