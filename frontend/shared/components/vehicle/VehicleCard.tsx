import { Pencil } from "lucide-react";

import type { Vehicle } from "../../types/vehicle";
import { VEHICLE_TYPE_CONFIG } from "./vehicleConfig";
import VehicleTypeIcon from "./VehicleTypeIcon";
import { VehicleTypeBadge } from "./VehicleTypeBadge";
import styles from "./VehicleCard.module.css";

type Props = {
  vehicle: Vehicle;
  onEdit?: () => void;
  isLoading?: boolean;
  className?: string;
};

function mpgLabel(vehicle: Vehicle) {
  if (vehicle.mileage_city != null && vehicle.mileage_highway != null) {
    return `${vehicle.mileage_city}/${vehicle.mileage_highway}`;
  }
  return "—";
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <div className={[styles.iconBox, styles.shimmer].join(" ")} />
        <div className={styles.headerBody}>
          <div className={styles.titleRow}>
            <div className={[styles.titleSkeleton, styles.shimmer].join(" ")} />
          </div>
          <div className={styles.badgesRow}>
            <span className={[styles.pillSkeleton, styles.shimmer].join(" ")} />
            <span className={[styles.pillSkeletonWide, styles.shimmer].join(" ")} />
          </div>
        </div>
      </div>
      <div className={styles.insetDivider} />
      <div className={styles.statsGrid}>
        <div className={styles.statColumn}>
          <div className={[styles.labelSkeleton, styles.shimmer].join(" ")} />
          <div className={[styles.valueSkeleton, styles.shimmer].join(" ")} />
        </div>
        <div className={styles.separator} />
        <div className={styles.statColumn}>
          <div className={[styles.labelSkeleton, styles.shimmer].join(" ")} />
          <div className={[styles.valueSkeleton, styles.shimmer].join(" ")} />
        </div>
        <div className={styles.separator} />
        <div className={styles.statColumn}>
          <div className={[styles.labelSkeleton, styles.shimmer].join(" ")} />
          <div className={[styles.valueSkeleton, styles.shimmer].join(" ")} />
        </div>
        <div className={styles.separator} />
        <div className={styles.statColumn}>
          <div className={[styles.labelSkeleton, styles.shimmer].join(" ")} />
          <div className={[styles.valueSkeleton, styles.shimmer].join(" ")} />
        </div>
      </div>
      <div className={styles.footer}>
        <div className={[styles.footerSkeleton, styles.shimmer].join(" ")} />
      </div>
    </article>
  );
}

export function VehicleCard({ vehicle, onEdit, isLoading = false, className }: Props) {
  if (isLoading) {
    return <SkeletonCard className={className} />;
  }

  const config = VEHICLE_TYPE_CONFIG[vehicle.vehicle_type];

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <VehicleTypeIcon type={vehicle.vehicle_type} size={58} />
        </div>

        <div className={styles.headerBody}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {onEdit ? (
              <button type="button" className={styles.editButton} onClick={onEdit}>
                <Pencil size={14} />
                <span>Edit</span>
              </button>
            ) : null}
          </div>

          <div className={styles.badgesRow}>
            <span className={styles.plateBadge}>{vehicle.plate_number}</span>
            <VehicleTypeBadge type={vehicle.vehicle_type} size="sm" />
            <span className={styles.activeBadge}>
              <span className={vehicle.is_active ? styles.activeDot : styles.inactiveDot} />
              <span className={vehicle.is_active ? styles.activeText : styles.inactiveText}>
                {vehicle.is_active ? "Active" : "Inactive"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.insetDivider} />

      <div className={styles.statsGrid}>
        <div className={styles.statColumn}>
          <p className={styles.statLabel}>Color</p>
          <p className={styles.statValue}>{vehicle.color || "—"}</p>
        </div>
        <div className={styles.separator} />
        <div className={`${styles.statColumn} ${styles.paddedColumn}`}>
          <p className={styles.statLabel}>Seats</p>
          <p className={styles.statValue}>{String(vehicle.seat_capacity)}</p>
        </div>
        <div className={styles.separator} />
        <div className={`${styles.statColumn} ${styles.paddedColumn}`}>
          <p className={styles.statLabel}>Fuel Type</p>
          <p className={styles.statValue}>{vehicle.fuel_type || "—"}</p>
        </div>
        <div className={styles.separator} />
        <div className={`${styles.statColumn} ${styles.paddedColumn}`}>
          <p className={styles.statLabel}>MPG</p>
          <p className={styles.statValue}>{mpgLabel(vehicle)}</p>
        </div>
      </div>

      <div className={styles.fullDivider} />

      <footer className={styles.footer}>
        <p className={styles.footerText} style={{ color: config.color === "#92400E" ? "var(--text-secondary, #5f675f)" : undefined }}>
          {config.description}
        </p>
      </footer>
    </article>
  );
}

export default VehicleCard;
