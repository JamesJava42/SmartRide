type DriverStatCardProps = {
  value: string;
  label: string;
  accent?: "default" | "green";
};

export function DriverStatCard({ value, label, accent = "default" }: DriverStatCardProps) {
  return (
    <article className="rounded-[20px] border border-[#E2E5DE] bg-white px-4 py-6 text-center shadow-[0_0_0_1px_rgba(226,229,222,0.25)]">
      <div className={`text-[22px] font-semibold md:text-[24px] ${accent === "green" ? "text-[#1A6B45]" : "text-[#141A13]"}`}>
        {value}
      </div>
      <div className="mt-2 whitespace-pre-line text-[11px] leading-6 text-[#8B97AA]">{label}</div>
    </article>
  );
}
