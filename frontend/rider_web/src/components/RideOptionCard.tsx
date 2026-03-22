import { VehicleTypeCard } from "@shared/components/vehicle";
import type { VehicleType } from "@shared/types/vehicle";
import type { RideOption } from "../types/api";

export function RideOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: RideOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const type = option.productName.toUpperCase() as VehicleType;

  return (
    <VehicleTypeCard
      type={type}
      selected={selected}
      disabled={option.unavailable}
      onClick={onSelect}
      fare={Number(option.price)}
      eta={`~${option.etaMinutes} min`}
      size="md"
    />
  );
}
