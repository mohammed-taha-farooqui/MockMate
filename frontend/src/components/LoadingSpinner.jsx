/**
 * LoadingSpinner.jsx
 * Reusable loading indicator.
 *
 * Props:
 *  - size: "sm" | "md" | "lg"  (default "md")
 *  - label: optional accessible text (default "Loading…")
 *  - color: CSS colour value (default accent)
 *  - fullPage: boolean — if true, centres in the full viewport
 */
export default function LoadingSpinner({
  size = "md",
  label = "Loading\u2026",
  fullPage = false,
}) {
  const dim = { sm: 20, md: 36, lg: 52 }[size] ?? 36;
  const border = { sm: 2, md: 3, lg: 4 }[size] ?? 3;

  const spinner = (
    <span
      role="status"
      aria-label={label}
      style={{
        display: "inline-block",
        width: dim,
        height: dim,
        borderRadius: "50%",
        border: `${border}px solid var(--mm-border)`,
        borderTopColor: "var(--mm-accent-glow)",
        animation: "mm-spin 0.75s linear infinite",
      }}
    />
  );

  if (fullPage) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          minHeight: "60dvh",
        }}
      >
        {spinner}
        {label && (
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9rem" }}>{label}</p>
        )}
      </div>
    );
  }

  return spinner;
}
