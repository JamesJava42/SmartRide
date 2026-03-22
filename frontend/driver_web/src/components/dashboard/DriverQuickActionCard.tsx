import { BadgeDollarSign, FileBadge2, UserRound } from "lucide-react";

type DriverQuickActionCardProps = {
  label: string;
  variant: "profile" | "documents" | "earnings";
  onClick?: () => void;
};

const icons = {
  profile: UserRound,
  documents: FileBadge2,
  earnings: BadgeDollarSign,
} as const;

export function DriverQuickActionCard({ label, variant, onClick }: DriverQuickActionCardProps) {
  const Icon = icons[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 rounded-[18px] border border-[#E2E5DE] bg-white px-3 py-4 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F5F2] text-[#1A6B45]">
        <Icon size={18} />
      </div>
      <span className="text-xs font-semibold text-[#141A13]">{label}</span>
    </button>
  );
}
