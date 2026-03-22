export type EarningsSummary = {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  pendingPayout: number;
  grossFares: number;
  platformFee: number;
  adjustments: number;
  netPayout: number;
  tripsToday: number;
};

export type PayoutHistoryItem = {
  payoutId: string;
  payoutDate: string;
  amount: number;
  method: string;
  status: string;
  referenceNumber: string;
};
