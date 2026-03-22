import { ArrowRight, BellDot, CarFront, Clock3 } from "lucide-react";

import type { StatusPanelVariant } from "../../types/dashboard";

type DriverStatusPanelProps = {
  variant: StatusPanelVariant;
  title: string;
  subtitle: string;
  extraText?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const variantStyles: Record<StatusPanelVariant, { wrap: string; iconBg: string; icon: typeof Clock3 }> = {
  waiting: {
    wrap: "border-[#D7E9DD] bg-[#F4FBF6]",
    iconBg: "bg-[#E3F4E8] text-[#1A6B45]",
    icon: BellDot,
  },
  offline: {
    wrap: "border-[#E2E5DE] bg-white",
    iconBg: "bg-[#F0F2EE] text-[#5A6B56]",
    icon: Clock3,
  },
  offer: {
    wrap: "border-[#F3D39A] bg-[#FFF7EA]",
    iconBg: "bg-[#FCE7C2] text-[#B86A00]",
    icon: BellDot,
  },
  active_ride: {
    wrap: "border-[#CFE0FF] bg-[#EEF4FF]",
    iconBg: "bg-[#DDE9FF] text-[#2C63C7]",
    icon: CarFront,
  },
  waiting_more: {
    wrap: "border-[#D7E9DD] bg-[#F7FBF8]",
    iconBg: "bg-[#E8F3EC] text-[#1A6B45]",
    icon: Clock3,
  },
};

export function DriverStatusPanel({
  variant,
  title,
  subtitle,
  extraText,
  ctaLabel,
  onCtaClick,
}: DriverStatusPanelProps) {
  const content = variantStyles[variant];
  const Icon = content.icon;

  if (variant === "waiting") {
    return (
      <section className="rounded-[24px] border border-[#1A8C57] bg-[#EDF9F2] px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold text-[#127549]">{title}</h3>
            <div className="mt-2 flex items-start gap-4">
              <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-[#9AC5AF]" />
              <p className="max-w-[470px] text-[15px] leading-8 text-[#62748D]">{subtitle}</p>
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-[#F0F9F4] px-5 py-3 text-[16px] font-semibold text-[#127549]">
            Active
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-[24px] border px-5 py-5 ${content.wrap}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${content.iconBg}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold text-[#141A13]">{title}</h3>
          <p className="mt-1 text-sm text-[#5A6B56]">{subtitle}</p>
          {extraText ? <p className="mt-2 text-sm font-medium text-[#141A13]">{extraText}</p> : null}
          {ctaLabel ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#141A13]"
            >
              {ctaLabel}
              <ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
