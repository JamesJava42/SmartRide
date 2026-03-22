import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getDriverEarnings, getDriverPerformance, getDriverRideHistory } from "../../api/driverActivity";
import { DriverRideCard } from "../../components/activity/DriverRideCard";
import { DriverRideDetailPanel } from "../../components/activity/DriverRideDetailPanel";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { formatCurrency, formatMiles, formatMonthYear } from "../../utils/formatters";
import styles from "./DriverRideHistoryPage.module.css";

function groupByMonth<T extends { created_at: string }>(rides: T[]) {
  const groups: Record<string, T[]> = {};
  rides.forEach((ride) => {
    const key = formatMonthYear(ride.created_at);
    groups[key] ??= [];
    groups[key].push(ride);
  });
  return groups;
}

function renderStars(rating: number) {
  const filled = Math.round(rating);
  return "★★★★★".slice(0, filled) + "☆☆☆☆☆".slice(0, 5 - filled);
}

export default function DriverRideHistoryPage() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [activeTab, setActiveTab] = useState<"HISTORY" | "EARNINGS" | "PERFORMANCE">("HISTORY");
  const [activeStatus, setActiveStatus] = useState<"ALL" | "RIDE_COMPLETED" | "CANCELLED">("ALL");
  const [activePeriod, setActivePeriod] = useState("all_time");
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["driver-activity", activeStatus, activePeriod],
    queryFn: () => getDriverRideHistory({ status: activeStatus, period: activePeriod as "all_time" }),
  });
  const earningsQuery = useQuery({
    queryKey: ["driver-earnings", activePeriod],
    queryFn: () => getDriverEarnings({ period: activePeriod }),
    enabled: activeTab === "EARNINGS",
  });
  const performanceQuery = useQuery({
    queryKey: ["driver-performance"],
    queryFn: getDriverPerformance,
    enabled: activeTab === "PERFORMANCE",
  });

  const rideGroups = useMemo(() => groupByMonth(historyQuery.data?.rides ?? []), [historyQuery.data?.rides]);

  return (
    <DriverLayout>
      <div className={styles.page}>
        <div className={styles.body}>
          <div className={styles.listCol}>
            <div className={styles.tabs}>
              {[
                ["HISTORY", "Ride history"],
                ["EARNINGS", "Earnings"],
                ["PERFORMANCE", "Performance"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "HISTORY" && (
              <>
                <div className={styles.summaryStrip}>
                  <div className={styles.summaryCell}><strong>{historyQuery.data?.summary.total_rides ?? 0}</strong><span>Total rides</span></div>
                  <div className={styles.summaryCell}><strong className={styles.accent}>{formatCurrency(historyQuery.data?.summary.total_earned ?? 0)}</strong><span>Total earned</span></div>
                  <div className={styles.summaryCell}><strong>{(historyQuery.data?.summary.average_rating ?? 0).toFixed(1)}★</strong><span>Avg rating</span></div>
                  <div className={styles.summaryCell}><strong>{formatMiles(historyQuery.data?.summary.average_distance_km ?? 0)}</strong><span>Avg distance</span></div>
                </div>
                <div className={styles.filters}>
                  {[
                    ["ALL", "All"],
                    ["RIDE_COMPLETED", "Completed"],
                    ["CANCELLED", "Cancelled"],
                    ["this_month", "This month"],
                    ["last_3_months", "Last 3 months"],
                  ].map(([value, label]) => {
                    const active = value === activeStatus || value === activePeriod;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.pill} ${active ? styles.pillActive : ""}`}
                        onClick={() => {
                          if (value === "ALL" || value === "RIDE_COMPLETED" || value === "CANCELLED") {
                            setActiveStatus(value as typeof activeStatus);
                          } else {
                            setActivePeriod(value);
                          }
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.rideList}>
                  {historyQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => <div key={index} className={styles.skeleton} />)
                  ) : historyQuery.data?.rides.length ? (
                    Object.entries(rideGroups).map(([month, rides]) => (
                      <div key={month}>
                        <div className={styles.monthHeader}>{month}</div>
                        {rides.map((ride) => (
                          <DriverRideCard
                            key={ride.ride_id}
                            ride={ride}
                            mobile={isMobile}
                            selected={!isMobile && selectedRideId === ride.ride_id}
                            onSelect={() => setSelectedRideId(ride.ride_id)}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>No rides found for the selected filters.</div>
                  )}
                </div>
              </>
            )}

            {activeTab === "EARNINGS" && earningsQuery.data && (
              <>
                <div className={styles.hero}>
                  <div className={styles.heroLabel}>This week</div>
                  <div className={styles.heroAmount}>{formatCurrency(earningsQuery.data.total_payout)}</div>
                  <div className={styles.heroSub}>
                    {earningsQuery.data.ride_count} rides · {earningsQuery.data.period_start} - {earningsQuery.data.period_end}
                  </div>
                  <div className={styles.chipRow}>
                    {["Week", "Month", "Year"].map((label, index) => (
                      <button key={label} type="button" className={`${styles.chip} ${index === 0 ? styles.chipActive : ""}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.label}>Daily earnings</div>
                  <div className={styles.chart}>
                    {earningsQuery.data.daily_breakdown.map((item) => (
                      <div key={item.date} className={styles.barCol}>
                        <div className={styles.bar} style={{ height: `${Math.max(4, item.amount)}px`, opacity: item.amount > 40 ? 1 : 0.55 }} />
                        <div className={styles.barLabel}>{new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.card}>
                  {[
                    ["Ride fares", formatCurrency(earningsQuery.data.ride_fares)],
                    ["Tips", formatCurrency(earningsQuery.data.tips)],
                    ["Bonuses", formatCurrency(earningsQuery.data.bonuses)],
                    ["Platform fee", `-${formatCurrency(earningsQuery.data.platform_fee)}`],
                    ["Total payout", formatCurrency(earningsQuery.data.total_payout)],
                  ].map(([label, value], index, rows) => (
                    <div className={styles.row} key={label}>
                      <span className={styles.label}>{label}</span>
                      <span className={`${styles.value} ${index === rows.length - 1 ? styles.accent : ""}`}>{value}</span>
                    </div>
                  ))}
                  <div className={styles.note}>Next payout: {new Date(earningsQuery.data.next_payout_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                </div>
              </>
            )}

            {activeTab === "PERFORMANCE" && performanceQuery.data && (
              <>
                <div className={styles.ratingHero}>
                  <div className={styles.ratingValue}>{performanceQuery.data.average_rating.toFixed(2)}</div>
                  <div className={styles.stars}>{renderStars(performanceQuery.data.average_rating)}</div>
                  <div className={styles.sub}>Based on {performanceQuery.data.total_ratings} ratings</div>
                </div>
                <div className={styles.card}>
                  {(["5", "4", "3", "2", "1"] as const).map((key) => (
                    <div key={key} className={styles.breakdownRow}>
                      <span className={styles.label}>{key} ★</span>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${performanceQuery.data.total_ratings ? (performanceQuery.data.rating_breakdown[key] / performanceQuery.data.total_ratings) * 100 : 0}%` }} />
                      </div>
                      <span className={styles.value}>{performanceQuery.data.rating_breakdown[key]}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.card}>
                  {[
                    ["Acceptance rate", `${performanceQuery.data.acceptance_rate}%`],
                    ["Completion rate", `${performanceQuery.data.completion_rate}%`],
                    ["Cancellation rate", `${performanceQuery.data.cancellation_rate}%`],
                    ["Avg response time", `${performanceQuery.data.average_response_time_seconds} sec`],
                    ["Hours online (week)", `${performanceQuery.data.online_hours_this_week} hrs`],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.row}>
                      <span className={styles.label}>{label}</span>
                      <span className={styles.value}>{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`${styles.detailCol} ${!selectedRideId || activeTab !== "HISTORY" ? styles.hidden : ""}`}>
            {selectedRideId && activeTab === "HISTORY" ? <DriverRideDetailPanel rideId={selectedRideId} onClose={() => setSelectedRideId(null)} /> : null}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
}
