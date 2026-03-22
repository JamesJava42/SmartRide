import { useEffect } from "react";
import DriverProfilePage from "./DriverProfilePage";
import type { ViewMode } from "@shared/types/driver";

type Props = {
  driverId: string | null;
  viewMode: ViewMode;
  showContact?: boolean;
  onClose: () => void;
  onApproveOnboarding?: (notes: string) => void;
  onRejectOnboarding?: (reason: string) => void;
  onApproveDocument?: (documentType: string) => void;
  onRejectDocument?: (documentType: string, reason: string) => void;
  onSuspendDriver?: () => void;
  onReactivateDriver?: () => void;
  onUploadDocument?: (documentType: string) => void;
};

export function DriverProfileDrawer({ driverId, viewMode, showContact = false, onClose, ...actions }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!driverId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-ink">Driver Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-muted hover:bg-[#f7f7f5] hover:text-ink transition"
          >✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <DriverProfilePage driverId={driverId} viewMode={viewMode} showContact={showContact} {...actions} />
        </div>
      </div>
    </>
  );
}
