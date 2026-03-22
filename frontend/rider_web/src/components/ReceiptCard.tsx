export function ReceiptCard({
  fare,
  bookingFee,
  tolls,
  discounts,
  totalCharged,
}: {
  fare?: string | null;
  bookingFee?: string | null;
  tolls?: string | null;
  discounts?: string | null;
  totalCharged?: string | null;
}) {
  const lineItems = [
    fare ? { label: "Trip fare", value: `$${fare}` } : null,
    bookingFee ? { label: "Booking fee", value: `$${bookingFee}` } : null,
    tolls ? { label: "Tolls", value: `$${tolls}` } : null,
    discounts ? { label: "Discounts", value: `-$${discounts}` } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  const computedTotal = fare && bookingFee && tolls && discounts ? (Number(fare) + Number(bookingFee) + Number(tolls) - Number(discounts)).toFixed(2) : null;
  const total = totalCharged ?? computedTotal;

  return (
    <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-ink">Receipt summary</h3>
      <div className="mt-4 space-y-3 text-sm text-muted">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}</span>
            <span className="text-ink">{item.value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
          <span>Total charged</span>
          <span>{total ? `$${total}` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
