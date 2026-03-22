type DriverGreetingHeaderProps = {
  greeting: string;
  subtext: string;
  badgeText?: string;
};

export function DriverGreetingHeader({ greeting, subtext, badgeText }: DriverGreetingHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[#141A13]">{greeting}</h1>
        <p className="mt-1 text-[15px] text-[#62748D]">{subtext}</p>
      </div>
      {badgeText ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EDF9F2] px-4 py-2 text-[13px] font-medium text-[#1A6B45]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1A6B45]" />
          {badgeText}
        </div>
      ) : null}
    </div>
  );
}
