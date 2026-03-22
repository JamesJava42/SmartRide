import type { DriverAvailabilityState } from "../../types/driver";
import { titleizeStatus } from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";

export function DriverStatusBadge({ status }: { status: DriverAvailabilityState }) {
  const tone =
    status === "ONLINE" ? "green" : status === "OFFLINE" ? "gray" : status === "ON_TRIP" ? "blue" : "amber";
  return <StatusBadge label={titleizeStatus(status)} tone={tone} />;
}
