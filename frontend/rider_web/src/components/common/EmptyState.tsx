export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-[24px] border border-line bg-white p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F3F4F6] text-3xl text-[#9CA3AF]">−</div>
        <div className="mt-4 text-[15px] font-medium text-[#374151]">{title}</div>
        <div className="mt-2 text-[13px] leading-6 text-[#9CA3AF]">{subtitle}</div>
      </div>
    </div>
  );
}
