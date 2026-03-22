import { VehicleCard } from '@shared/components/vehicle';
import type { Vehicle } from '@shared/types/vehicle';
import type { DriverReviewData } from '../../types/onboarding';
import { getDocumentsMap } from '../../utils/onboarding';
import { DocumentsReviewTab } from './tabs/DocumentsReviewTab';

type Props = { data: DriverReviewData; onRefresh: () => void };

export function VehicleTab({ data, onRefresh }: Props) {
  const docMap = getDocumentsMap(data.documents);
  const v = data.vehicle;

  return (
    <div className="space-y-4">
      {/* Vehicle details card */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle on File</p>
        {v ? (
          <div className="space-y-4">
            <VehicleCard
              vehicle={{
                ...(v as unknown as Vehicle),
                vehicle_type: v.vehicle_type as Vehicle["vehicle_type"],
                fuel_type: null,
                mileage_city: null,
                mileage_highway: null,
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">No active vehicle on file</p>
            <p className="mt-0.5 text-xs text-red-600">Driver cannot be approved without a vehicle.</p>
          </div>
        )}
      </div>

      {/* Vehicle Registration document review */}
      <DocumentsReviewTab
        data={data}
        category="vehicle"
        onRefresh={onRefresh}
      />
    </div>
  );
}
