import { SectionCard } from "../../common/SectionCard";
import { InfoRow } from "../../common/InfoRow";
import type { RiderSecuritySummary } from "../../../types/riderProfile";

type SecurityTabProps = {
  security: RiderSecuritySummary;
};

export function SecurityTab({ security }: SecurityTabProps) {
  return (
    <div className="space-y-5">
      <SectionCard title="Security" subtitle="Account access and protection settings for your rider profile.">
        <InfoRow label="Password status" value={security.passwordStatus} />
        <InfoRow label="2FA status" value={security.twoFactorStatus} />
        <InfoRow label="Recent login" value={security.recentLogin} />
        <InfoRow label="Recent device" value={security.recentDevice} />
      </SectionCard>

      <SectionCard title="Security Actions" subtitle="Use these actions if you want to secure your account further.">
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="rounded-2xl bg-[#1A6B45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15593A]">
            Change password
          </button>
          <button type="button" className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-canvas">
            Log out all sessions
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
