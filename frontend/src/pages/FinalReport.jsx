import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Target,
  Lightbulb,
  Printer,
  BarChart2,
  RotateCcw,
  Star,
} from "lucide-react";
import mockFeedback from "../data/mockFeedback";

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}
function scoreColour(score, max = 10) {
  const r = score / max;
  if (r >= 0.8) return "var(--mm-success)";
  if (r >= 0.6) return "var(--mm-warning)";
  return "var(--mm-danger)";
}
function scoreLabel(score, max = 10) {
  const r = score / max;
  if (r >= 0.8) return "Strong";
  if (r >= 0.6) return "Good";
  return "Needs Work";
}
function buildCategoryBreakdown(questionFeedback = []) {
  const map = {};
  for (const q of questionFeedback) {
    const skill = q.skill || "General";
    if (!map[skill]) map[skill] = { total: 0, count: 0 };
    map[skill].total += q.score || 0;
    map[skill].count += 1;
  }
  return Object.entries(map).map(([name, { total, count }]) => ({
    name,
    avg: Math.round((total / count) * 10),
    count,
  }));
}

/* ─── Score Ring SVG ──────────────────────────────────────────────────── */
function ScoreRing({ score, max = 100, size = 120 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = clamp(score / max);
  const colour = scoreColour(score, max);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mm-border)" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth={10}
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: colour, fontSize: size * 0.22, fontWeight: 800, letterSpacing: "-0.03em" }}>
        {score}
      </text>
      <text x="50%" y="67%" textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: "var(--mm-text-faint)", fontSize: size * 0.11, fontWeight: 500 }}>
        /{max}
      </text>
    </svg>
  );
}

/* ─── Category progress bar row ───────────────────────────────────────── */
function CategoryBar({ name, avg, count }) {
  const colour = scoreColour(avg, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--mm-text-primary)" }}>{name}</span>
        <span style={{ fontSize: "0.8125rem", color: colour, fontWeight: 700 }}>{avg}/100 · {scoreLabel(avg, 100)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--mm-border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${clamp(avg)}%`, borderRadius: 4, background: `linear-gradient(90deg, ${colour}, ${colour}bb)`, transition: "width 0.7s ease" }} />
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)" }}>{count} question{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

/* ─── Section heading ─────────────────────────────────────────────────── */
function SectionHeading({ icon, label, colour = "var(--mm-accent-glow)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
      <div style={{ width: 36, height: 36, borderRadius: "0.5rem", background: `${colour}18`, border: `1px solid ${colour}30`, display: "flex", alignItems: "center", justifyContent: "center", color: colour, flexShrink: 0 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{label}</h2>
    </div>
  );
}

/* ─── Collapsible question summary card ───────────────────────────────── */
function QuestionSummaryCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const colour = scoreColour(item.score, 10);
  return (
    <div style={{ background: "var(--mm-bg-card)", border: "1px solid var(--mm-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: "100%", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "var(--mm-accent-glow)" }}>
          {index + 1}
        </span>
        <p style={{ flex: 1, margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--mm-text-primary)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: open ? "normal" : "nowrap", minWidth: 0 }}>
          {item.question}
        </p>
        <span style={{ flexShrink: 0, fontSize: "0.8125rem", fontWeight: 700, color: colour, padding: "0.15rem 0.6rem", borderRadius: "999px", background: `${colour}14`, border: `1px solid ${colour}40`, whiteSpace: "nowrap" }}>
          {item.score}/10
        </span>
        <span style={{ flexShrink: 0, color: "var(--mm-text-faint)" }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid var(--mm-border)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {item.skill && (
              <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.6rem", borderRadius: "999px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "var(--mm-accent-glow)" }}>
                {item.skill}
              </span>
            )}
            {item.difficulty && (
              <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.6rem", borderRadius: "999px", background: item.difficulty === "Hard" ? "rgba(239,68,68,0.1)" : item.difficulty === "Medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${item.difficulty === "Hard" ? "rgba(239,68,68,0.25)" : item.difficulty === "Medium" ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}`, color: item.difficulty === "Hard" ? "var(--mm-danger)" : item.difficulty === "Medium" ? "var(--mm-warning)" : "var(--mm-success)" }}>
                {item.difficulty}
              </span>
            )}
          </div>
          {item.feedback && (
            <p style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.65, margin: 0 }}>{item.feedback}</p>
          )}
          {item.improvement && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)" }}>
              <Lightbulb size={15} style={{ color: "var(--mm-accent-glow)", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: "0.85rem", color: "var(--mm-text-primary)", margin: 0, lineHeight: 1.55 }}>{item.improvement}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Follow-up card ──────────────────────────────────────────────────── */
function FollowUpCard({ topic }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "var(--mm-bg-card)", border: "1px solid var(--mm-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: "100%", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={15} color="var(--mm-accent-glow)" />
          </div>
          <div>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mm-text-primary)", margin: 0 }}>{topic.topic}</p>
            {topic.reason && <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)", margin: 0, marginTop: "0.1rem" }}>{topic.reason}</p>}
          </div>
        </div>
        <span style={{ flexShrink: 0, color: "var(--mm-text-faint)" }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>
      {open && topic.resources && topic.resources.length > 0 && (
        <div style={{ borderTop: "1px solid var(--mm-border)", padding: "0.875rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mm-accent-glow)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Suggested Practice</p>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {topic.resources.map((r, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.55 }}>
                <span style={{ color: "var(--mm-accent-glow)", fontWeight: 700, flexShrink: 0 }}>-&gt;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN FINAL REPORT PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function FinalReport() {
  const location = useLocation();

  // BACKEND INTEGRATION POINT: replace mockFeedback with an API call
  const reportData = mockFeedback || {};
  const isMockData = true;

  const overallScore = reportData.overallScore ?? 0;
  const summary = reportData.summary || "Interview session completed.";
  const strengths = reportData.strengths || [];
  const improvementAreas = reportData.improvementAreas || [];
  const questionFeedback = reportData.questionFeedback || [];
  const followUp = reportData.followUp || [];

  const sessionAnswers = location?.state?.answers || {};
  const enrichedQuestions = questionFeedback.map(q => {
    const live = sessionAnswers[q.questionId];
    return live && live.trim() ? { ...q, candidateAnswer: live } : q;
  });

  const categories = buildCategoryBreakdown(questionFeedback);
  const overallColour = scoreColour(overallScore, 100);

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .mm-navbar, .no-print { display: none !important; }
          .mm-page { padding: 0 !important; min-height: unset !important; }
          .mm-container { max-width: 100% !important; padding: 0 1rem !important; }
          .mm-card { border: 1px solid #ddd !important; background: #fff !important; break-inside: avoid; }
          section { break-inside: avoid; page-break-inside: avoid; }
          button { display: none !important; }
          a { color: #333 !important; text-decoration: none !important; }
          h1, h2, h3, h4 { color: #111 !important; }
          p, span, li { color: #333 !important; }
        }
      `}</style>

      <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Top nav */}
          <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <Link to="/feedback" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--mm-text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
              <ArrowLeft size={15} /> Back to Feedback
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button type="button" onClick={() => window.print()} className="mm-btn mm-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Printer size={15} /> Print Report
              </button>
              <span className="mm-badge mm-badge-accent" style={{ display: "inline-flex", alignItems: "center" }}>
                <CheckCircle2 size={13} style={{ marginRight: "0.25rem" }} /> Interview Completed
              </span>
            </div>
          </div>

          {/* Page heading */}
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.625rem)", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Interview Final Report
            </h1>
            <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>
              Your MockMate Interview Results
            </p>
          </div>

          {/* Dev data banner */}
          {isMockData && (
            <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem 1.125rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.625rem", fontSize: "0.8125rem", color: "#fcd34d" }}>
              <span style={{ fontSize: "1rem" }}>🧪</span>
              <span><strong>Demo report</strong> — backend evaluation will be connected later. Data comes from <code>mockFeedback.js</code>.</span>
            </div>
          )}

          {/* Overall Result */}
          <section>
            <SectionHeading icon={<Award size={18} />} label="Overall Result" />
            <div className="mm-card" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <ScoreRing score={overallScore} max={100} size={130} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: overallColour, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {overallScore >= 80 ? "Excellent" : overallScore >= 65 ? "Good" : "Needs Improvement"}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.9375rem", color: "var(--mm-text-muted)", lineHeight: 1.7, margin: 0 }}>{summary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  {[
                    { val: questionFeedback.length, label: "Questions Answered", color: "var(--mm-text-primary)" },
                    { val: `${overallScore}/100`, label: "Overall Score", color: overallColour },
                    { val: categories.length, label: "Skill Areas", color: "var(--mm-text-primary)" },
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: "0.625rem 1rem", borderRadius: "0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid var(--mm-border)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "1.375rem", fontWeight: 800, color: stat.color }}>{stat.val}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)" }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Performance Breakdown */}
          {categories.length > 0 && (
            <section>
              <SectionHeading icon={<BarChart2 size={18} />} label="Performance Breakdown" />
              <div className="mm-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--mm-text-faint)", margin: 0, lineHeight: 1.5 }}>
                  Average scores per skill area, derived from your question-by-question responses.
                </p>
                {categories.map(cat => <CategoryBar key={cat.name} {...cat} />)}
              </div>
            </section>
          )}

          {/* Key Strengths */}
          <section>
            <SectionHeading icon={<Star size={18} />} label="Key Strengths" colour="var(--mm-success)" />
            <div className="mm-card">
              {strengths.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {strengths.map((s, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.9rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}>
                      <CheckCircle2 size={16} style={{ color: "var(--mm-success)", flexShrink: 0, marginTop: "0.15rem" }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--mm-text-faint)", margin: 0, fontSize: "0.875rem" }}>No session-level strengths recorded.</p>
              )}
            </div>
          </section>

          {/* Areas to Improve */}
          <section>
            <SectionHeading icon={<TrendingUp size={18} />} label="Areas to Improve" colour="var(--mm-warning)" />
            <div className="mm-card">
              {improvementAreas.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {improvementAreas.map((a, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.9rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}>
                      <AlertTriangle size={15} style={{ color: "var(--mm-warning)", flexShrink: 0, marginTop: "0.2rem" }} />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--mm-text-faint)", margin: 0, fontSize: "0.875rem" }}>No improvement areas recorded.</p>
              )}
            </div>
          </section>

          {/* Question Summary */}
          <section>
            <SectionHeading icon={<BarChart2 size={18} />} label="Question Summary" colour="#a78bfa" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {enrichedQuestions.length > 0
                ? enrichedQuestions.map((item, i) => <QuestionSummaryCard key={item.questionId || i} item={item} index={i} />)
                : <div className="mm-card" style={{ textAlign: "center", color: "var(--mm-text-faint)", padding: "2rem" }}>No question data available.</div>
              }
            </div>
          </section>

          {/* Follow-Up Recommendations */}
          <section>
            <SectionHeading icon={<Target size={18} />} label="Follow-up Recommendations" colour="#c084fc" />
            <div style={{ padding: "0.875rem 1.25rem", background: "rgba(192,132,252,0.07)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: "0.75rem", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}>
              <Lightbulb size={15} style={{ color: "#c084fc", marginRight: "0.4rem", verticalAlign: "middle" }} />
              Focus on these topics before your next interview. Expand each card to see suggested practice activities.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {followUp.length > 0
                ? followUp.map((topic, i) => <FollowUpCard key={i} topic={topic} />)
                : <div className="mm-card" style={{ textAlign: "center", color: "var(--mm-text-faint)", padding: "2rem" }}>No follow-up recommendations available.</div>
              }
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <SectionHeading icon={<ArrowRight size={18} />} label="Next Steps" />
            <div className="mm-card" style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", alignItems: "center", justifyContent: "center" }}>
              <Link to="/setup" className="mm-btn mm-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <RotateCcw size={15} /> Start Another Interview
              </Link>
              <Link to="/progress" className="mm-btn mm-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <BarChart2 size={15} /> View Progress
              </Link>
              <Link to="/" className="mm-btn mm-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Home size={15} /> Go to Home
              </Link>
            </div>
          </section>

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--mm-border)" }}>
            <Link to="/feedback" className="mm-btn mm-btn-secondary no-print" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <ArrowLeft size={15} /> Back to Feedback
            </Link>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" onClick={() => window.print()} className="mm-btn mm-btn-secondary no-print" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Printer size={15} /> Print Report
              </button>
              <Link to="/" className="mm-btn mm-btn-primary no-print" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Home size={15} /> Go to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
