import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Shuffle, BarChart2, FileText, Clock, ArrowRight, Users, Zap } from "lucide-react";

const P = {
  red: "#e60023", redLight: "#ffeef0", redMid: "#ffccd2",
  gray50: "#fafafa", gray100: "#f0f0f0", gray700: "#222", gray400: "#888", white: "#fff",
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

const features = [
  { icon: Shuffle, title: "Smart Order", desc: "Randomize who goes first. Fair every time, no awkward silence deciding." },
  { icon: BarChart2, title: "Weekly Metrics", desc: "Each team member logs what they shipped. Visual, trackable, comparable week over week." },
  { icon: Clock, title: "Time Breakdown", desc: "See how everyone actually spent their time with interactive donut charts." },
  { icon: FileText, title: "AI Executive Summary", desc: "One click turns your team's week into a board-ready summary for senior management." },
  { icon: Users, title: "Team Roles", desc: "Admins control the meeting. Members own their own data. Everyone stays in their lane." },
  { icon: Zap, title: "Present Mode", desc: "Full-screen presentation mode for each team member's standup update." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: P.white, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${P.gray100}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={32} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {isSignedIn ? (
              <button onClick={() => navigate("/dashboard")} style={{ background: P.red, color: "white", border: "none", borderRadius: 24, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/sign-in")} style={{ background: "none", border: "none", color: P.gray700, fontWeight: 600, fontSize: 14, cursor: "pointer", padding: "10px 16px", fontFamily: "inherit" }}>
                  Sign in
                </button>
                <button onClick={() => navigate("/sign-up")} style={{ background: P.red, color: "white", border: "none", borderRadius: 24, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Get started free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, #fff 0%, #fff8f8 50%, #fff 100%)`, padding: "100px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,0,35,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: P.redLight, border: `1px solid ${P.redMid}`, borderRadius: 24, padding: "6px 14px", marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.red }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: P.red, letterSpacing: 0.5 }}>TEAM STANDUP, REIMAGINED</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(44px, 7vw, 72px)", fontWeight: 400, color: P.gray700, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
            Your team's week,<br /><em style={{ color: P.red }}>beautifully captured.</em>
          </h1>
          <p style={{ fontSize: 18, color: P.gray400, lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
            Quorum runs your weekly standup, tracks metrics, visualizes time, and writes your executive summary — all in one place.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/sign-up")} style={{ display: "flex", alignItems: "center", gap: 8, background: P.red, color: "white", border: "none", borderRadius: 28, padding: "16px 32px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(230,0,35,0.3)", fontFamily: "inherit" }}>
              Start for free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate("/sign-in")} style={{ background: "white", color: P.gray700, border: `2px solid ${P.gray100}`, borderRadius: 28, padding: "16px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
              Sign in
            </button>
          </div>
          <p style={{ fontSize: 12, color: P.gray400, marginTop: 16, fontWeight: 500 }}>Free to start · No credit card required</p>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: P.red, letterSpacing: 3, textAlign: "center", marginBottom: 16 }}>EVERYTHING YOU NEED</p>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 42px)", textAlign: "center", color: P.gray700, marginBottom: 60, fontWeight: 400 }}>
          Before, during, and after the standup
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: P.white, borderRadius: 20, padding: 28, border: `1px solid ${P.gray100}`, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.redMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,0,35,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.gray100; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: P.redLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={20} color={P.red} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: P.gray700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: P.gray400, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ margin: "0 24px 80px", borderRadius: 32, background: `linear-gradient(135deg, #c8001e 0%, #e60023 50%, #ff1f3d 100%)`, padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 48px)", color: "white", marginBottom: 16, fontWeight: 400 }}>
          Ready to run a better standup?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>Create your team in under 2 minutes.</p>
        <button onClick={() => navigate("/sign-up")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: P.red, border: "none", borderRadius: 28, padding: "16px 36px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
          Get started free <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${P.gray100}` }}>
        <Logo size={24} />
        <p style={{ fontSize: 12, color: P.gray400, marginTop: 12, fontWeight: 500 }}>© 2025 Quorum · Before, during, and after.</p>
      </div>
    </div>
  );
}
