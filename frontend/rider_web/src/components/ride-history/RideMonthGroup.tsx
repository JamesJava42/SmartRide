import type { RiderRideHistory } from "../../types/activity";
import { RideHistoryMobileCard } from "./RideHistoryMobileCard";
import { RideHistoryRow } from "./RideHistoryRow";

export function RideMonthGroup({
  month,
  rides,
  isMobile,
  selectedRideId,
  onSelect,
}: {
  month: string;
  rides: RiderRideHistory[];
  isMobile: boolean;
  selectedRideId: string | null;
  onSelect: (rideId: string) => void;
}) {
  return (
    <div>
      <div className={`bg-[#F9FAF8] text-[10px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF] ${isMobile ? "px-4 py-2" : "px-6 py-3"}`}>
        {month}
      </div>
      <div className={`${isMobile ? "space-y-3 bg-[#F4F5F2] px-4 pb-4" : ""}`}>
        {rides.map((ride) =>
          isMobile ? (
            <RideHistoryMobileCard key={ride.ride_id} ride={ride} selected={selectedRideId === ride.ride_id} onSelect={() => onSelect(ride.ride_id)} />
          ) : (
            <RideHistoryRow key={ride.ride_id} ride={ride} selected={selectedRideId === ride.ride_id} onSelect={() => onSelect(ride.ride_id)} />
          ),
        )}
      </div>
    </div>
  );
}
