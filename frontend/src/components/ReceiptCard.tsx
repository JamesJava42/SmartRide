export function ReceiptCard({
  fare,
  bookingFee,
  tolls,
  discounts,
}: {
  fare: string;
  bookingFee: string;
  tolls: string;
  discounts: string;
}) {
  const total = (Number(fare) + Number(bookingFee) + Number(tolls) - Number(discounts)).toFixed(2);

  return (
    <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-ink">Receipt summary</h3>
      <div className="mt-4 space-y-3 text-sm text-muted">
        <div className="flex justify-between">
          <span>Trip fare</span>
          <span className="text-ink">${fare}</span>
        </div>
        <div className="flex justify-between">
          <span>Booking fee</span>
          <span className="text-ink">${bookingFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Tolls</span>
          <span className="text-ink">${tolls}</span>
        </div>
        <div className="flex justify-between">
          <span>Discounts</span>
          <span className="text-ink">-${discounts}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
          <span>Total charged</span>
          <span>${total}</span>
        </div>
      </div>
    </div>
  );
}
