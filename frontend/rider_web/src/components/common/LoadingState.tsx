export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 border-b border-[#F3F4F6] bg-[linear-gradient(90deg,#F4F5F2_25%,#ECEEE9_50%,#F4F5F2_75%)] bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite] last:border-b-0"
        />
      ))}
    </div>
  );
}
