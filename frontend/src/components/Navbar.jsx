import { Link, NavLink } from "react-router-dom";
import { Mic, BarChart2, ChevronRight } from "lucide-react";

const navLinks = [
  { to: "/setup",    label: "New Interview" },
  { to: "/progress", label: "My Progress" },
];

export default function Navbar() {
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(10, 13, 20, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--mm-border)",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 1.5rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          textDecoration: "none",
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "0.5rem",
            background: "var(--mm-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Mic size={18} color="#fff" />
          </div>
          <span style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--mm-text-primary)",
          }}>
            Mock<span style={{ color: "var(--mm-accent-glow)" }}>Mate</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: "0.4rem 0.875rem",
                borderRadius: "0.4rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: isActive ? "var(--mm-accent-glow)" : "var(--mm-text-muted)",
                background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              })}
            >
              {label}
            </NavLink>
          ))}

          <Link
            to="/setup"
            className="mm-btn mm-btn-primary"
            style={{ marginLeft: "0.5rem", fontSize: "0.85rem", padding: "0.5rem 1.1rem" }}
          >
            Start Interview <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
