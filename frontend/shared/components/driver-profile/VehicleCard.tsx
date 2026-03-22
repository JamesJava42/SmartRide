import { VehicleTypeBadge } from "@shared/components/vehicle";
import type { VehicleType } from "@shared/types/vehicle";
import type { DriverVehicle, ViewMode } from "@shared/types/driver";

type Props = { vehicle: DriverVehicle | null; viewMode: ViewMode; onEdit?: () => void };

export function VehicleCard({ vehicle, viewMode, onEdit }: Props) {
  if (!vehicle) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="text-sm text-muted text-center py-4">No vehicle on file</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-ink">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
            {vehicle.color && <span className="text-sm text-muted">· {vehicle.color}</span>}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <VehicleTypeBadge type={vehicle.vehicle_type as VehicleType} size="sm" />
            <span className="text-xs text-muted font-mono">{vehicle.plate_number}</span>
            <span className="text-xs text-muted">{vehicle.seat_capacity} seats</span>
          </div>
        </div>
        {viewMode === "driver" && onEdit && (
          <button onClick={onEdit} className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#f7f7f5] transition">
            Edit
          </button>
        )}
      </div>

      {viewMode !== "rider" && (vehicle.fuel_type || vehicle.mileage_city || vehicle.mileage_highway) && (
        <div className="grid grid-cols-3 gap-3 border-t border-line pt-3">
          {vehicle.fuel_type && (
            <div><p className="text-xs text-muted">Fuel</p><p className="text-sm text-ink font-medium">{vehicle.fuel_type}</p></div>
          )}
          {vehicle.mileage_city && (
            <div><p className="text-xs text-muted">City MPG</p><p className="text-sm text-ink font-medium">{vehicle.mileage_city}</p></div>
          )}
          {vehicle.mileage_highway && (
            <div><p className="text-xs text-muted">Hwy MPG</p><p className="text-sm text-ink font-medium">{vehicle.mileage_highway}</p></div>
          )}
        </div>
      )}
    </div>
  );
}
