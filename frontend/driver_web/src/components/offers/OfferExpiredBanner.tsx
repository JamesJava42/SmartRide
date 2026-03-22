import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type OfferExpiredBannerProps = {
  message?: string;
};

export function OfferExpiredBanner({ message = "Offer expired — the rider found another driver" }: OfferExpiredBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid #ef4444",
        background: "#fef2f2",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", fontSize: 13 }}>
        <AlertCircle size={16} />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          border: "none",
          borderRadius: 10,
          padding: "10px 12px",
          background: "#ffffff",
          color: "#dc2626",
          fontWeight: 600,
        }}
      >
        Back to dashboard
      </button>
    </div>
  );
}
