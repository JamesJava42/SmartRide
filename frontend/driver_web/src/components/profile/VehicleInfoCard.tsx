import { VehicleCard } from "@shared/components/vehicle";
import type { Vehicle } from "@shared/types/vehicle";
import type { DriverVehicle } from "../../types/profile";
import { SectionCard } from "../common/SectionCard";

type Props = {
  vehicle: DriverVehicle | null;
  onEdit?: () => void;
  onAdd?: () => void;
};

function toVehicleCardData(vehicle: DriverVehicle): Vehicle {
  return {
    id: vehicle.id,
    driver_id: vehicle.driverId,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    plate_number: vehicle.plateNumber,
    vehicle_type: vehicle.vehicleType as Vehicle["vehicle_type"],
    seat_capacity: vehicle.seatCount ?? 4,
    fuel_type: vehicle.fuelType,
    mileage_city: vehicle.mileageCity,
    mileage_highway: vehicle.mileageHighway,
    is_active: vehicle.isActive,
  };
}

export function VehicleInfoCard({ vehicle, onEdit, onAdd }: Props) {
  return (
    <SectionCard title="My Vehicle" description="Current active vehicle on the driver account.">
      {vehicle ? (
        <VehicleCard vehicle={toVehicleCardData(vehicle)} onEdit={onEdit} />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">No active vehicle is attached to this driver yet.</p>
          <button
            type="button"
            className="inline-flex items-center rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            onClick={onAdd}
          >
            Add vehicle
          </button>
        </div>
      )}
    </SectionCard>
  );
}
