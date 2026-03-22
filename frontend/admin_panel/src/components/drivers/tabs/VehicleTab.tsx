import { VehicleCard, VehicleEditForm } from '@shared/components/vehicle';
import type { Vehicle } from '@shared/types/vehicle';
import { useState } from 'react';
import { SectionCard } from '../../common/SectionCard';
import { EmptyState } from '../../common/EmptyState';
import { useDriverVehicle, useCreateVehicle, useUpdateVehicle } from '../../../hooks/useDriverDetail';
import { useToast } from '../../../hooks/useToast';
import styles from './VehicleTab.module.css';

interface Props { driverId: string; }

const LOADING_VEHICLE: Vehicle = {
  id: 'loading-vehicle',
  driver_id: 'loading-driver',
  make: 'Loading',
  model: 'Vehicle',
  year: 2024,
  color: null,
  plate_number: '—',
  vehicle_type: 'ECONOMY',
  seat_capacity: 4,
  fuel_type: null,
  mileage_city: null,
  mileage_highway: null,
  is_active: true,
};

export function VehicleTab({ driverId }: Props) {
  const { data: vehicle, isLoading } = useDriverVehicle(driverId);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const { showSuccess, showError } = useToast();
  const createM = useCreateVehicle();
  const updateM = useUpdateVehicle();

  function openEdit() {
    if (!vehicle) return;
    setEditing(true);
  }

  function openAdd() {
    setAdding(true);
  }

  const isPending = createM.isPending || updateM.isPending;
  const addVehicleTemplate: Vehicle = {
    id: "new-vehicle",
    driver_id: driverId,
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: null,
    plate_number: "",
    vehicle_type: "ECONOMY",
    seat_capacity: 4,
    fuel_type: null,
    mileage_city: null,
    mileage_highway: null,
    is_active: true,
  };

  if (isLoading) return <VehicleCard vehicle={LOADING_VEHICLE} isLoading />;

  // ── Add vehicle form ─────────────────────────────────────────────────────────
  if (!vehicle && !adding) {
    return (
      <SectionCard>
        <EmptyState
          icon="🚗"
          title="No vehicle registered"
          description="Add a vehicle to make this driver dispatchable."
        />
        <div className={styles.formActions}>
          <button className={styles.addBtn} onClick={openAdd}>+ Add Vehicle</button>
        </div>
      </SectionCard>
    );
  }

  if (adding) {
    return (
      <VehicleEditForm
        vehicle={addVehicleTemplate}
        onSave={async (diff) => {
          try {
            await createM.mutateAsync({
              driverId,
              make: diff.make ?? addVehicleTemplate.make,
              model: diff.model ?? addVehicleTemplate.model,
              year: diff.year ?? addVehicleTemplate.year,
              color: diff.color ?? addVehicleTemplate.color,
              plate_number: diff.plate_number ?? addVehicleTemplate.plate_number,
              vehicle_type: diff.vehicle_type ?? addVehicleTemplate.vehicle_type,
              seat_capacity: diff.seat_capacity ?? addVehicleTemplate.seat_capacity,
              fuel_type: diff.fuel_type ?? addVehicleTemplate.fuel_type,
              mileage_city: diff.mileage_city ?? addVehicleTemplate.mileage_city,
              mileage_highway: diff.mileage_highway ?? addVehicleTemplate.mileage_highway,
              is_active: diff.is_active ?? addVehicleTemplate.is_active,
            });
            showSuccess('Vehicle created');
            setAdding(false);
          } catch (e) {
            showError(e instanceof Error ? e.message : 'Save failed');
            throw e;
          }
        }}
        onCancel={() => setAdding(false)}
        isSaving={isPending}
      />
    );
  }

  // ── View / edit existing vehicle ─────────────────────────────────────────────
  return (
    <div className={styles.grid}>
      <SectionCard
        title="Vehicle Details"
        action={
          !editing ? (
            <button className={styles.editBtn} onClick={openEdit}>Edit</button>
          ) : (
            undefined
          )
        }
      >
        {editing ? (
          <VehicleEditForm
            vehicle={vehicle as Vehicle}
            onSave={async (diff) => {
              try {
                await updateM.mutateAsync({ driverId, ...diff });
                showSuccess('Vehicle updated');
                setEditing(false);
              } catch (e) {
                showError(e instanceof Error ? e.message : 'Save failed');
                throw e;
              }
            }}
            onCancel={() => setEditing(false)}
            isSaving={isPending}
          />
        ) : (
          <VehicleCard vehicle={vehicle as Vehicle} />
        )}
      </SectionCard>

      <SectionCard title="Vehicle Compliance">
        <p className={styles.complianceNote}>Compliance details are managed in the Compliance tab.</p>
      </SectionCard>
    </div>
  );
}
