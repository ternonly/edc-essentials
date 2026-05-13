import { useId } from "react";

type Props = {
  value: number; // 0..5, may be fractional
  size?: number;
  showValue?: boolean;
  count?: number;
  ariaLabel?: string;
};

export function StarRating({ value, size = 16, showValue = false, count, ariaLabel }: Props) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const uid = useId().replace(/[:]/g, "");
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: 8, lineHeight: 1 }}
      aria-label={ariaLabel ?? `Rated ${v.toFixed(1)} out of 5`}
      role="img"
    >
      <span style={{ display: "inline-flex", gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, v - i));
          const gid = `s72-star-${uid}-${i}`;
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fill * 100}%`} stopColor="#C9A96E" />
                  <stop offset={`${fill * 100}%`} stopColor="#E5E2DC" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.6l2.92 5.92 6.54.95-4.73 4.61 1.12 6.51L12 17.77l-5.85 3.07 1.12-6.51L2.54 9.72l6.54-.95L12 2.6z"
                fill={`url(#${gid})`}
                stroke="#C9A96E"
                strokeWidth="0.6"
              />
            </svg>
          );
        })}
      </span>
      {showValue && (
        <span style={{ fontSize: size * 0.85, color: "var(--text-secondary, #666)", fontWeight: 600 }}>
          {v.toFixed(1)}
          {typeof count === "number" && (
            <span style={{ color: "var(--text-muted, #888)", fontWeight: 400 }}> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}

export default StarRating;
