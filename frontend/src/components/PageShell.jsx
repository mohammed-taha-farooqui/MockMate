import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Reusable shell for placeholder pages.
 *
 * Props:
 *  - icon: JSX element (lucide icon)
 *  - badge: string label shown above the title
 *  - title: page heading
 *  - description: short text below heading
 *  - backTo: optional href for the back link
 *  - backLabel: optional label for the back link
 *  - children: optional additional content (cards, links, etc.)
 */
export default function PageShell({
  icon,
  badge,
  title,
  description,
  backTo,
  backLabel = "Back",
  children,
}) {
  return (
    <div className="mm-page">
      <div className="mm-container-sm" style={{ textAlign: "center" }}>
        {/* Back link */}
        {backTo && (
          <Link
            to={backTo}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              transition: "color 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.color = "var(--mm-text-primary)")}
            onMouseOut={e => (e.currentTarget.style.color = "var(--mm-text-muted)")}
          >
            <ArrowLeft size={15} /> {backLabel}
          </Link>
        )}

        {/* Icon bubble */}
        {icon && (
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "1.25rem",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--mm-accent-glow)",
          }}>
            {icon}
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span className="mm-badge mm-badge-accent" style={{ marginBottom: "1rem" }}>
            {badge}
          </span>
        )}

        {/* Title */}
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "0.75rem" }}>
          {title}
        </h1>

        {/* Description */}
        <p style={{
          color: "var(--mm-text-muted)",
          fontSize: "1.0625rem",
          lineHeight: 1.7,
          maxWidth: 480,
          margin: "0 auto 2rem",
        }}>
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}
