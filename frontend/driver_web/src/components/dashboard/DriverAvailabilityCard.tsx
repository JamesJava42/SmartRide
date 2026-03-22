type DriverAvailabilityCardProps = {
  mode: "online" | "offline" | "busy";
  onToggle?: () => void;
  disabled?: boolean;
};

const availabilityContent = {
  online: {
    title: "You're online",
    subtitle: "Available for ride requests in your area",
    card: "border-[#D7E9DD] bg-[#EDF9F2]",
    toggle: "bg-[#1A6B45]",
    knob: "translate-x-[20px]",
  },
  offline: {
    title: "Go online",
    subtitle: "Start receiving ride requests",
    card: "border-[#E2E5DE] bg-white",
    toggle: "bg-[#D6DBD3]",
    knob: "translate-x-0",
  },
  busy: {
    title: "On a ride",
    subtitle: "Busy - no new requests",
    card: "border-[#CFE0FF] bg-[#EEF4FF]",
    toggle: "bg-[#3F76D2]",
    knob: "translate-x-[20px]",
  },
} as const;

export function DriverAvailabilityCard({ mode, onToggle, disabled = false }: DriverAvailabilityCardProps) {
  const content = availabilityContent[mode];

  return (
    <section className={`flex items-center justify-between rounded-[22px] border px-5 py-4 ${content.card}`}>
      <div>
        <h2 className="text-[15px] font-semibold text-[#141A13]">{content.title}</h2>
        <p className="mt-1 text-xs text-[#5A6B56]">{content.subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative h-7 w-12 rounded-full p-1 transition ${content.toggle} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        aria-label="Toggle driver availability"
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${content.knob}`}
        />
      </button>
    </section>
  );
}
