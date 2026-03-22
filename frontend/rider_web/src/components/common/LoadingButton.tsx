import type { ButtonHTMLAttributes, ReactNode } from "react";

export function LoadingButton({
  loading,
  children,
  loadingLabel,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}) {
  return (
    <button {...props} disabled={props.disabled || loading}>
      {loading ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              display: "inline-block",
              animation: "spin 1s linear infinite",
            }}
          />
          {loadingLabel ?? "Loading..."}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
