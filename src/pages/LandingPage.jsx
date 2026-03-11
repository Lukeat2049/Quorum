import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowRight, BarChart2, FileText, Clock, Maximize2, History, MessageSquare, TrendingUp, Check, GripVertical } from "lucide-react";

const P = {
  red: "#e60023", redLight: "#ffeef0", redMid: "#ffccd2",
  gray50: "#fafafa", gray100: "#f0f0f0", gray200: "#e0e0e0", gray700: "#222", gray400: "#888", gray500: "#666", white: "#fff",
};

function Logo({ size = 38, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: light ? "rgba(255,255,255,0.15)" : P.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={size * 0.58} height={size * 0.72} viewBox="0 0 22 28" fill="none">
          <path d="M11 2C6.03 2 2 6.03 2 11c0 3.87 2.34 7.19 5.7 8.67-.08-.7-.15-1.77.03-2.53.16-.68 1.08-4.58 1.08-4.58s-.28-.55-.28-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.97-.77 3.07-.22.92.46 1.66 1.36 1.66 1.63 0 2.73-2.09 2.73-4.56 0-1.88-1.27-3.29-3.57-3.29-2.6 0-4.22 1.94-4.22 4.1 0 .74.21 1.27.55 1.67.15.18.17.25.11.46-.04.15-.13.5-.17.64-.05.21-.2.28-.38.2C5.7 13.7 4.8 12.1 4.8 10.2c0-2.93 2.48-6.44 7.41-6.44 3.96 0 6.57 2.88 6.57 5.97 0 4.1-2.27 7.17-5.6 7.17-1.12 0-2.18-.6-2.54-1.28l-.7 2.7c-.22.85-.69 1.7-1.1 2.37.83.25 1.7.39 2.6.39 4.97 0 9-4.03 9-9S15.97 2 11 2z" fill="white" />
        </svg>
      </div>
      <span style={{ fontSize: size * 0.58, fontWeight: 900, letterSpacing: -0.5, color: light ? P.white : P.gray700, fontFamily: "'DM Serif Display', serif" }}>Quorum</span>
    </div>
  );
}

const steps = [
  { num: "01", title: "Create your team", body: "Sign up, name your team, and share the invite code with your teammates. Everyone is up and running in minutes." },
  { num: "02", title: "Each member logs their week", body: "Before the standup, everyone fills in their metrics, how they split their time, and any notes. Takes about 2 minutes." },
  { num: "03", title: "Run the standup", body: "Hit Present Mode for full-screen slides per person. Generate a random speaking order. The built-in timer keeps it tight." },
  { num: "04", title: "AI does the rest", body: "Generate a polished executive summary from real data. Or ask the AI Analyst anything about team trends across the past year." },
];

const features = [
  { icon: TrendingUp, tag: "AI", title: "AI Analyst", desc: "Ask anything about your team's performance across 52 weeks of history. Trends, comparisons, anomalies — answered instantly." },
  { icon: FileText, tag: "AI", title: "AI Executive Summary", desc: "One click generates a board-ready summary from your team's actual data. Refine it in a chat interface until it's exactly right." },
  { icon: BarChart2, tag: "TRACKING", title: "Weekly Metrics", desc: "Every member logs their numbers each week. Visual, trackable, and comparable week over week." },
  { icon: Clock, tag: "TRACKING", title: "Time Breakdown", desc: "Pie charts show exactly where everyone's time went — with indicators showing what changed from last week." },
  { icon: Maximize2, tag: "MEETING", title: "Present Mode", desc: "Full-screen slide-by-slide presentation for remote standups. Keyboard navigation, member pills, live timer." },
  { icon: History, tag: "MEETING", title: "2-Year History", desc: "Every week stored for 2 years. Drill into any member's past week or view the whole team at a glance." },
  { icon: MessageSquare, tag: "MEETING", title: "Team Notes & Timer", desc: "Shared notes for blockers and decisions. Built-in countdown timer that persists through the whole meeting." },
  { icon: GripVertical, tag: "MEETING", title: "Custom Speaking Order", desc: "Drag to reorder, randomize, or manually set who goes when. Full control over how your standup flows." },
];


const tagColors = {
  AI: { bg: "#f0f4ff", color: "#4361ee" },
  TRACKING: { bg: "#f0fdf4", color: "#16a34a" },
  MEETING: { bg: "#ffeef0", color: "#e60023" },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: P.white, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero-tag { animation: fadeUp 0.5s ease 0.1s both; }
        .hero-h1 { animation: fadeUp 0.6s ease 0.2s both; }
        .hero-p { animation: fadeUp 0.6s ease 0.3s both; }
        .hero-cta { animation: fadeUp 0.6s ease 0.4s both; }
        .hero-sub { animation: fadeUp 0.6s ease 0.5s both; }
        .feature-card { transition: all 0.2s ease; }
        .feature-card:hover { border-color: #ffccd2 !important; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(230,0,35,0.09) !important; }
        .faq-item summary { list-style: none; cursor: pointer; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] summary { color: #e60023; }
        .step-num { background: linear-gradient(135deg, #e60023, #ff4d6d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${P.gray100}`, padding: "0 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={32} />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isSignedIn ? (
              <button onClick={() => navigate("/dashboard")} style={{ background: P.red, color: "white", border: "none", borderRadius: 24, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Go to Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate("/sign-in")} style={{ background: "none", border: "none", color: P.gray500, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "10px 16px", fontFamily: "inherit" }}>Sign in</button>
                <button onClick={() => navigate("/sign-up")} style={{ background: P.red, color: "white", border: "none", borderRadius: 24, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(230,0,35,0.25)" }}>Get started free</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", padding: "100px 24px 90px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,0,35,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 40, left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(67,97,238,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 60, right: "6%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,0,35,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>
          <div className="hero-tag" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #f0f4ff, #ffeef0)", border: `1px solid ${P.redMid}`, borderRadius: 24, padding: "7px 16px", marginBottom: 36 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: P.red, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: P.red, letterSpacing: 1 }}>AI-POWERED TEAM STANDUPS</span>
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(44px, 6.5vw, 76px)", fontWeight: 400, color: P.gray700, lineHeight: 1.08, marginBottom: 28, letterSpacing: -1.5 }}>
            Your standup,<br /><em style={{ color: P.red }}>finally intelligent.</em>
          </h1>
          <p className="hero-p" style={{ fontSize: 19, color: P.gray400, lineHeight: 1.7, marginBottom: 44, maxWidth: 540, margin: "0 auto 44px" }}>
            Quorum tracks your team's weekly metrics, runs your standup in present mode, and gives you an AI that knows your team's entire history.
          </p>
          <div className="hero-cta" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/sign-up")} style={{ display: "flex", alignItems: "center", gap: 8, background: P.red, color: "white", border: "none", borderRadius: 28, padding: "17px 36px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 28px rgba(230,0,35,0.32)", fontFamily: "inherit" }}>
              Start for free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate("/sign-in")} style={{ background: P.white, color: P.gray700, border: `2px solid ${P.gray200}`, borderRadius: 28, padding: "17px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
          </div>
          <p className="hero-sub" style={{ fontSize: 12, color: P.gray400, marginTop: 18, fontWeight: 500 }}>Free to start · No credit card required · Set up in 5 minutes</p>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: P.gray50, borderTop: `1px solid ${P.gray100}`, borderBottom: `1px solid ${P.gray100}`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[{ val: "2 min", label: "avg setup time" }, { val: "52 weeks", label: "of AI memory" }, { val: "1 click", label: "executive summary" }, { val: "100%", label: "free to start" }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: P.gray700, letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: P.gray400, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "96px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: P.red, letterSpacing: 3, textAlign: "center", marginBottom: 14 }}>HOW IT WORKS</p>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 44px)", textAlign: "center", color: P.gray700, marginBottom: 72, fontWeight: 400, letterSpacing: -0.5 }}>From setup to summary in one meeting</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: "0 32px", borderLeft: i > 0 ? `1px dashed ${P.gray200}` : "none" }}>
              <div className="step-num" style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: 16, fontFamily: "'DM Serif Display', serif" }}>{s.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: P.gray700, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: P.gray400, lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{ background: P.gray50, borderTop: `1px solid ${P.gray100}`, borderBottom: `1px solid ${P.gray100}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: P.red, letterSpacing: 3, textAlign: "center", marginBottom: 14 }}>EVERYTHING YOU NEED</p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 44px)", textAlign: "center", color: P.gray700, marginBottom: 16, fontWeight: 400, letterSpacing: -0.5 }}>Before, during, and after the standup</h2>
          <p style={{ fontSize: 16, color: P.gray400, textAlign: "center", maxWidth: 480, margin: "0 auto 64px" }}>Every feature your team needs, in one focused tool.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: P.white, borderRadius: 20, padding: "26px 28px", border: `1.5px solid ${P.gray100}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: tagColors[f.tag].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <f.icon size={20} color={tagColors[f.tag].color} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: tagColors[f.tag].color, background: tagColors[f.tag].bg, padding: "4px 10px", borderRadius: 20 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: P.gray700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: P.gray400, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI dark callout */}
      <div style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", background: "linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%)", borderRadius: 32, padding: "72px 60px", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(230,0,35,0.15)", border: "1px solid rgba(230,0,35,0.3)", borderRadius: 24, padding: "6px 14px", marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: P.red, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#ff6b80", letterSpacing: 1 }}>AI ANALYST</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 3.5vw, 40px)", color: "white", marginBottom: 20, fontWeight: 400, lineHeight: 1.2, letterSpacing: -0.5 }}>An AI that actually knows your team</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 32 }}>Most AI tools are generic. Quorum's AI Analyst has access to your team's real data — 52 weeks of metrics, time breakdowns, and trends. Ask it anything.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Who had the biggest change in output last month?", "How has our time on admin tasks trended this quarter?", "Summarize Luke's last 8 weeks"].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: P.red, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>"{q}"</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(230,0,35,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={15} color={P.red} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>AI Analyst</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>52 weeks loaded</span>
              </div>
              {[
                { role: "user", msg: "Who's been spending the most time on admin lately?" },
                { role: "ai", msg: "Over the past 6 weeks, Sarah has averaged 35% of her time on admin — up from 18% in Q4. Luke and Jordan are both under 15%. Worth a 1:1 to check if Sarah needs support." },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", background: m.role === "user" ? P.red : "rgba(255,255,255,0.08)", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px" }}>
                    <p style={{ fontSize: 12, color: m.role === "user" ? "white" : "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>{m.msg}</p>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Ask anything about your team...</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */
      <div style={{ margin: "0 24px 80px", borderRadius: 32, background: `linear-gradient(135deg, #c8001e 0%, #e60023 60%, #ff2d4a 100%)`, padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 350, height: 350, borderRadius: "50%", background: "rgba(0,0,0,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(30px, 4.5vw, 52px)", color: "white", marginBottom: 16, fontWeight: 400, letterSpacing: -0.5 }}>Ready to run a smarter standup?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 40 }}>Create your team in under 2 minutes. No credit card needed.</p>
          <button onClick={() => navigate("/sign-up")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: P.red, border: "none", borderRadius: 28, padding: "17px 40px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", marginBottom: 28 }}>
            Get started free <ArrowRight size={18} />
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {["Free to start", "Google sign-in", "Set up in 5 min"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={14} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${P.gray100}`, padding: "32px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Logo size={26} />
          <p style={{ fontSize: 12, color: P.gray400, fontWeight: 500 }}>© 2026 Quorum · Before, during, and after the standup.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <button onClick={() => navigate("/privacy")} style={{ fontSize: 12, color: P.gray400, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Privacy Policy</button>
            <button onClick={() => navigate("/terms")} style={{ fontSize: 12, color: P.gray400, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Terms of Service</button>
          </div>
        </div>
      </div>
    </div>
  );
}
