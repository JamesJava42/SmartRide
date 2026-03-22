import type { VehicleType } from "../components/vehicle/vehicleConfig";
export type { VehicleType } from "../components/vehicle/vehicleConfig";
export type { VehicleTypeConfig } from "../components/vehicle/vehicleConfig";
export { VEHICLE_TYPE_CONFIG } from "../components/vehicle/vehicleConfig";

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate_number: string;
  vehicle_type: VehicleType;
  seat_capacity: number;
  fuel_type: string | null;
  mileage_city: number | null;
  mileage_highway: number | null;
  is_active: boolean;
}
