import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase.js";
import {
  Shuffle, Users, ChevronDown, ChevronUp, Plus, X, ArrowLeft,
  BarChart2, Clock, FileText, MessageSquare, Play, Pause, RefreshCw,
  StickyNote, PieChart, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Copy, Check, Settings, LogOut, Crown, History, Sparkles, TrendingUp
} from "lucide-react";

const P = {
  red: "#e60023", redHover: "#ad081b", redLight: "#ffeef0", redMid: "#ffccd2",
  gray50: "#f9f9f9", gray100: "#efefef", gray200: "#e2e2e2",
  gray400: "#999", gray700: "#333", white: "#fff",
};
const SWATCHES = ["#e60023","#0076d3","#00a86b","#7e5bef","#ff6b35","#f5a623","#00bcd4","#e91e8c","#4caf50","#ff9800"];
const card = { background: P.white, borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.08)" };

function getWeekKey(offset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}
function getWeekLabel(weekKey) {
  if (!weekKey) {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Week of ${fmt(mon)} – ${fmt(fri)}, ${now.getFullYear()}`;
  }
  const [year, w] = weekKey.split("-W");
  const jan1 = new Date(parseInt(year), 0, 1);
  const monday = new Date(jan1);
  monday.setDate(jan1.getDate() + (parseInt(w) - 1) * 7 - jan1.getDay() + 1);
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Week of ${fmt(monday)} – ${fmt(friday)}, ${year}`;
}
function fmtTime(s) { const m = Math.floor(s / 60), sec = s % 60; return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "8px 4px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .15s", background: active ? P.white : "transparent", color: active ? P.red : P.gray400, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none", fontFamily: "inherit" }}>
      {label}
    </button>
  );
}

function Avatar({ name, size = 36 }) {
  const hue = (name || "?").charCodeAt(0) * 13 % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},50%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.4, flexShrink: 0 }}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function Logo({ size = 32, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: light ? "rgba(255,255,255,0.15)" : P.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={size * 0.58} height={size * 0.72} viewBox="0 0 22 28" fill="none">
          <path d="M11 2C6.03 2 2 6.03 2 11c0 3.87 2.34 7.19 5.7 8.67-.08-.7-.15-1.77.03-2.53.16-.68 1.08-4.58 1.08-4.58s-.28-.55-.28-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.97-.77 3.07-.22.92.46 1.66 1.36 1.66 1.63 0 2.73-2.09 2.73-4.56 0-1.88-1.27-3.29-3.57-3.29-2.6 0-4.22 1.94-4.22 4.1 0 .74.21 1.27.55 1.67.15.18.17.25.11.46-.04.15-.13.5-.17.64-.05.21-.2.28-.38.2C5.7 13.7 4.8 12.1 4.8 10.2c0-2.93 2.48-6.44 7.41-6.44 3.96 0 6.57 2.88 6.57 5.97 0 4.1-2.27 7.17-5.6 7.17-1.12 0-2.18-.6-2.54-1.28l-.7 2.7c-.22.85-.69 1.7-1.1 2.37.83.25 1.7.39 2.6.39 4.97 0 9-4.03 9-9S15.97 2 11 2z" fill="white" />
        </svg>
      </div>
      <span style={{ fontSize: size * 0.6, fontWeight: 900, letterSpacing: -0.5, color: light ? P.white : P.gray700, fontFamily: "'DM Serif Display', serif" }}>Quorum</span>
    </div>
  );
}

function DonutChart({ slices, size = 220, label = "", light = false }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (!total) return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: light ? "rgba(255,255,255,0.1)" : P.gray100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 12, color: light ? "rgba(255,255,255,0.4)" : P.gray400, fontWeight: 700 }}>No data</span>
    </div>
  );
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;
  let cum = 0;
  const toXY = (pct) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const paths = slices.map(a => {
    const pct = a.value / total;
    const start = cum;
    cum += pct;
    const [x1, y1] = toXY(start);
    const [x2, y2] = toXY(cum);
    const large = pct > 0.5 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { ...a, d, pct };
  });

  function handleMouseMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }} onMouseMove={handleMouseMove} onMouseLeave={() => setHovered(null)}>
      <svg width={size} height={size}>
        {paths.map((a, i) => (
          <path key={i} d={a.d} fill={a.color}
            opacity={hovered && hovered !== a ? 0.55 : 1}
            stroke={light ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"}
            strokeWidth={hovered === a ? 3 : 2}
            strokeLinejoin="round"
            style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s", filter: hovered === a ? "brightness(1.08)" : "none" }}
            onMouseEnter={() => setHovered(a)}
          />
        ))}
      </svg>
      {hovered && (
        <div style={{ position: "absolute", left: mousePos.x + 14, top: mousePos.y - 40, background: light ? "rgba(255,255,255,0.95)" : P.gray700, color: light ? P.gray700 : P.white, padding: "7px 13px", borderRadius: 10, fontSize: 12, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 99 }}>
          <span style={{ color: hovered.color, marginRight: 6 }}>●</span>{hovered.label} — {Math.round(hovered.value / total * 100)}%
        </div>
      )}
    </div>
  );
}


// ── Meeting Timer ─────────────────────────────────────────────────────────────
function MeetingTimer({ duration, elapsed, setElapsed, running, setRunning }) {
  const total = duration * 60, remaining = Math.max(0, total - elapsed);
  const pct = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  const isWarn = pct >= 75 && pct < 90, isDanger = pct >= 90, isOver = elapsed >= total && total > 0;
  const ringColor = isDanger ? "#e60023" : isWarn ? "#ff8c00" : "#00a86b";
  const r = 50, circ = 2 * Math.PI * r;
  return (
    <div style={{ ...card, padding: 24, marginBottom: 16, background: isDanger ? "#fff5f5" : isWarn ? "#fff8f0" : P.white }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={16} color={isDanger ? P.red : isWarn ? "#ff8c00" : P.gray400} /><span style={{ fontWeight: 800, fontSize: 15, color: P.gray700 }}>Meeting Timer</span></div>
        {isOver && <span style={{ background: P.red, color: "white", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>⏰ Time's up!</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={60} cy={60} r={r} fill="none" stroke={P.gray100} strokeWidth={10} />
            <circle cx={60} cy={60} r={r} fill="none" stroke={ringColor} strokeWidth={10} strokeDasharray={circ} strokeDashoffset={circ - (circ * pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear,stroke .5s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: isDanger ? P.red : isWarn ? "#ff8c00" : P.gray700 }}>{total > 0 ? fmtTime(remaining) : fmtTime(elapsed)}</span>
            <span style={{ fontSize: 10, color: P.gray400, fontWeight: 600 }}>{total > 0 ? "remaining" : "elapsed"}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {duration > 0 && <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: P.gray400, fontWeight: 600, marginBottom: 6 }}><span>0:00</span><span>{fmtTime(total)}</span></div>
            <div style={{ height: 8, background: P.gray100, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: ringColor, width: `${pct}%`, transition: "width 1s linear" }} /></div>
            <p style={{ fontSize: 11, color: P.gray400, fontWeight: 600, marginTop: 6 }}>{duration} min scheduled</p>
          </div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setRunning(!running)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: running ? P.redLight : P.red, color: running ? P.red : "white", fontFamily: "inherit" }}>
              {running ? <><Pause size={14} />Pause</> : <><Play size={14} />Start</>}
            </button>
            <button onClick={() => { setRunning(false); setElapsed(0); }} style={{ padding: "10px 14px", borderRadius: 20, border: "none", background: P.gray100, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCw size={14} color={P.gray400} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Present Mode (with Next Person) ──────────────────────────────────────────
function PresentMode({ members, initialMemberIndex, weekDataMap, prevWeekDataMap, onExit, duration, timerElapsed, timerRunning, setTimerRunning }) {
  const [memberIdx, setMemberIdx] = useState(initialMemberIndex || 0);
  const [slide, setSlide] = useState(0);

  const member = members[memberIdx];
  const weekData = weekDataMap[member?.id] || { metrics: [], time: [], notes: "" };
  const prevWeekData = prevWeekDataMap?.[member?.id] || null;

  const metrics = weekData.metrics || [];
  const time = weekData.time || [];
  const notes = weekData.notes || "";
  const totalPct = time.reduce((s, t) => s + (parseFloat(t.value) || 0), 0);
  const timeSlices = time.map((t, i) => ({ label: t.label, value: parseFloat(t.value) || 0, color: SWATCHES[i % SWATCHES.length], pct: t.value })).filter(s => s.value > 0);
  const hue = (member?.user_name || "?").charCodeAt(0) * 13 % 360;
  const slides = [
    { key: "intro", label: "Overview" },
    ...(metrics.length > 0 ? [{ key: "metrics", label: "Metrics" }] : []),
    ...(time.length > 0 ? [{ key: "time", label: "Time %" }] : []),
    ...(notes.trim() ? [{ key: "notes", label: "Notes" }] : []),
  ];
  const current = slides[slide] || slides[0];

  // Reset slide when member changes
  useEffect(() => { setSlide(0); }, [memberIdx]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (slide < slides.length - 1) setSlide(s => s + 1);
        else if (memberIdx < members.length - 1) { setMemberIdx(i => i + 1); }
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (slide > 0) setSlide(s => s - 1);
        else if (memberIdx > 0) { setMemberIdx(i => i - 1); }
      }
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slides.length, slide, memberIdx, members.length]);

  const bg = `linear-gradient(135deg, hsl(${hue},55%,22%) 0%, hsl(${hue},45%,35%) 100%)`;
  const weekLabel = getWeekLabel();

  function goNextPerson() {
    if (memberIdx < members.length - 1) { setMemberIdx(i => i + 1); }
  }
  function goPrevPerson() {
    if (memberIdx > 0) { setMemberIdx(i => i - 1); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: bg, zIndex: 100, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Logo size={28} light />
        {/* Member selector pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {members.map((m, i) => (
            <button key={m.id} onClick={() => setMemberIdx(i)} style={{
              padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              background: i === memberIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
              color: i === memberIdx ? P.gray700 : "white",
              transition: "all 0.15s"
            }}>{m.user_name}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Compact timer in present mode */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "8px 16px" }}>
            <Clock size={13} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 14, fontWeight: 900, color: timerRunning || timerElapsed > 0 ? "white" : "rgba(255,255,255,0.5)", fontFamily: "inherit" }}>
              {duration > 0 ? fmtTime(Math.max(0, duration * 60 - timerElapsed)) : fmtTime(timerElapsed)}
            </span>
            <button onClick={() => setTimerRunning(r => !r)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 20, padding: "4px 10px", color: "white", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              {timerRunning ? "Pause" : "Start"}
            </button>
          </div>
          <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "8px 16px", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            <Minimize2 size={13} />Exit
          </button>
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 12 }}>
        {slides.map((s, i) => (
          <button key={s.key} onClick={() => setSlide(i)} style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", background: i === slide ? "white" : "rgba(255,255,255,0.3)", padding: 0 }} />
        ))}
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflow: "auto" }}>
        {current?.key === "intro" && (
          <div style={{ textAlign: "center" }}>
            <Avatar name={member.user_name} size={100} />
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "white", margin: "24px 0 12px", letterSpacing: -1 }}>{member.user_name}</h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{weekLabel}</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
              {metrics.length > 0 && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px" }}><p style={{ fontSize: 24, fontWeight: 900, color: "white", margin: 0 }}>{metrics.length}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, margin: 0 }}>Metrics</p></div>}
              {time.length > 0 && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px" }}><p style={{ fontSize: 24, fontWeight: 900, color: "white", margin: 0 }}>{time.length}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, margin: 0 }}>Time Cats</p></div>}
              {notes && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 20px" }}><p style={{ fontSize: 24, fontWeight: 900, color: "white", margin: 0 }}>✓</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, margin: 0 }}>Notes</p></div>}
            </div>
          </div>
        )}
        {current?.key === "metrics" && (
          <div style={{ width: "100%", maxWidth: 600 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 12, textAlign: "center" }}>WEEKLY METRICS</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 32px", textAlign: "center", letterSpacing: -1 }}>What I accomplished</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {metrics.map((m, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: SWATCHES[i % SWATCHES.length] }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{m.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {current?.key === "time" && (
          <div style={{ width: "100%", maxWidth: 860, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: 3, marginBottom: 16, textAlign: "center" }}>TIME BREAKDOWN</p>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: "white", margin: "0 0 40px", textAlign: "center", letterSpacing: -1.5 }}>How I spent my time</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center" }}>
              <DonutChart slices={[...timeSlices, ...(100 - totalPct > 0 ? [{ label: "Unallocated", value: 100 - totalPct, color: "rgba(255,255,255,0.12)" }] : [])]} size={360} label="" light />
              <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 220 }}>
                {timeSlices.map((t, i) => {
                  const prevTime = prevWeekData?.time?.find(p => p.label === t.label);
                  const prevPct = prevTime ? parseFloat(prevTime.value) : null;
                  const diff = prevPct !== null ? parseFloat(t.pct) - prevPct : null;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: t.color, flexShrink: 0, border: "2px solid rgba(255,255,255,0.3)" }} />
                      <span style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", fontWeight: 700, flex: 1 }}>{t.label}</span>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "white", minWidth: 48, textAlign: "right" }}>{t.pct}%</span>
                      {diff !== null && diff !== 0 && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: diff > 0 ? "#4ade80" : "#f87171", background: diff > 0 ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", padding: "3px 8px", borderRadius: 20, minWidth: 46, textAlign: "center" }}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(0)}%
                        </span>
                      )}
                      {diff === null && prevWeekData && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", minWidth: 46, textAlign: "center" }}>new</span>
                      )}
                    </div>
                  );
                })}
                {prevWeekData && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, margin: "4px 0 0", textAlign: "right" }}>vs. last week</p>}
              </div>
            </div>
          </div>
        )}
        {current?.key === "notes" && (
          <div style={{ width: "100%", maxWidth: 600 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 12, textAlign: "center" }}>NOTES</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 32px", textAlign: "center", letterSpacing: -1 }}>My notes this week</h2>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: 32 }}>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderTop: "1px solid rgba(255,255,255,0.1)", gap: 12 }}>
        {/* Slide prev */}
        <button onClick={() => setSlide(s => Math.max(s - 1, 0))} disabled={slide === 0} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "10px 16px", color: slide === 0 ? "rgba(255,255,255,0.3)" : "white", fontWeight: 700, fontSize: 13, cursor: slide === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          <ChevronLeft size={15} />Prev Slide
        </button>

        {/* Center: person nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={goPrevPerson} disabled={memberIdx === 0} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "10px 14px", color: memberIdx === 0 ? "rgba(255,255,255,0.3)" : "white", cursor: memberIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center" }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{memberIdx + 1} / {members.length}</span>
          <button onClick={goNextPerson} disabled={memberIdx === members.length - 1} style={{ background: memberIdx < members.length - 1 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "10px 20px", color: memberIdx < members.length - 1 ? P.gray700 : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 13, cursor: memberIdx < members.length - 1 ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            Next Person <ChevronRight size={15} />
          </button>
        </div>

        {/* Slide next */}
        <button onClick={() => setSlide(s => Math.min(s + 1, slides.length - 1))} disabled={slide === slides.length - 1} style={{ display: "flex", alignItems: "center", gap: 6, background: slide < slides.length - 1 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, padding: "10px 16px", color: slide < slides.length - 1 ? P.gray700 : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 13, cursor: slide < slides.length - 1 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          Next Slide<ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ member, onBack }) {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => { loadHistory(); }, [member.id]);

  async function loadHistory() {
    setLoading(true);
    const { data } = await supabase.from("member_week_data").select("*").eq("member_id", member.id).order("week_key", { ascending: false }).limit(104);
    setWeeks(data || []);
    setLoading(false);
  }

  const filteredWeeks = weeks.filter(w => {
    if (filterFrom && w.week_key < filterFrom) return false;
    if (filterTo && w.week_key > filterTo) return false;
    return true;
  });

  const years = [...new Set(weeks.map(w => w.week_key.split("-")[0]))].sort((a,b) => b - a);

  if (selectedWeek) {
    const timeSlices = (selectedWeek.time || []).map((t, i) => ({ label: t.label, value: parseFloat(t.value) || 0, color: SWATCHES[i % SWATCHES.length], pct: t.value })).filter(s => s.value > 0);
    const totalPct = (selectedWeek.time || []).reduce((s, t) => s + (parseFloat(t.value) || 0), 0);
    return (
      <div style={{ minHeight: "100vh", background: P.gray50, padding: "40px 40px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <button onClick={() => setSelectedWeek(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 24, fontFamily: "inherit" }}><ArrowLeft size={16} />Back to History</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Avatar name={member.user_name} size={44} />
            <div>
              <p style={{ fontWeight: 900, fontSize: 18, color: P.gray700, margin: 0 }}>{member.user_name}</p>
              <p style={{ fontSize: 12, color: P.gray400, margin: 0 }}>{getWeekLabel(selectedWeek.week_key)}</p>
            </div>
          </div>

          {selectedWeek.metrics?.length > 0 && (
            <div style={{ ...card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><BarChart2 size={14} color={P.red} /><span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>Metrics</span></div>
              {selectedWeek.metrics.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < selectedWeek.metrics.length - 1 ? `1px solid ${P.gray100}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SWATCHES[i % SWATCHES.length] }} />
                    <span style={{ fontSize: 13, color: P.gray700, fontWeight: 600 }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: P.gray700 }}>{m.value || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {selectedWeek.time?.length > 0 && (
            <div style={{ ...card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><PieChart size={14} color={P.red} /><span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>Time Breakdown</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <DonutChart slices={[...timeSlices, ...(100 - totalPct > 0 ? [{ label: "Unallocated", value: 100 - totalPct, color: P.gray100 }] : [])]} size={180} label={`${totalPct.toFixed(0)}%`} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {timeSlices.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: P.gray700, flex: 1 }}>{t.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: P.gray700 }}>{t.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedWeek.notes?.trim() && (
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><StickyNote size={14} color={P.red} /><span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>Notes</span></div>
              <p style={{ fontSize: 13, color: P.gray700, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{selectedWeek.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, padding: "40px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 24, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Avatar name={member.user_name} size={44} />
          <div>
            <p style={{ fontWeight: 900, fontSize: 20, color: P.gray700, margin: 0 }}>{member.user_name}</p>
            <p style={{ fontSize: 12, color: P.gray400, margin: 0 }}>Up to 2 years of history</p>
          </div>
        </div>
        {weeks.length > 4 && !loading && (
          <div style={{ ...card, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 1, marginBottom: 10 }}>FILTER BY YEAR</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => { setFilterFrom(""); setFilterTo(""); }} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${!filterFrom && !filterTo ? P.red : P.gray200}`, background: !filterFrom && !filterTo ? P.redLight : P.white, color: !filterFrom && !filterTo ? P.red : P.gray400, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>All</button>
              {years.map(y => (
                <button key={y} onClick={() => { setFilterFrom(y + "-W01"); setFilterTo(y + "-W53"); }} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filterFrom === y + "-W01" ? P.red : P.gray200}`, background: filterFrom === y + "-W01" ? P.redLight : P.white, color: filterFrom === y + "-W01" ? P.red : P.gray400, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{y}</button>
              ))}
            </div>
          </div>
        )}
                {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${P.redMid}`, borderTopColor: P.red, animation: "spin 0.8s linear infinite" }} />
            <style>{"@keyframes spin{to{transform:rotate(360deg);}}"}</style>
          </div>
        ) : weeks.length === 0 ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: P.gray400 }}>No history yet — data will appear here after each week.</p>
          </div>
        ) : filteredWeeks.length === 0 ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: P.gray400 }}>No entries for that period.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredWeeks.map((w, i) => {
              const isCurrentWeek = w.week_key === getWeekKey();
              const metricCount = w.metrics?.length || 0;
              const timeCount = w.time?.length || 0;
              const hasNotes = w.notes?.trim();
              return (
                <div key={w.week_key} onClick={() => setSelectedWeek(w)} style={{ ...card, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, borderLeft: isCurrentWeek ? `4px solid ${P.red}` : "4px solid transparent" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.08)"}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>{getWeekLabel(w.week_key)}</span>
                      {isCurrentWeek && <span style={{ fontSize: 10, fontWeight: 800, background: P.redLight, color: P.red, padding: "2px 8px", borderRadius: 20 }}>Current</span>}
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {metricCount > 0 && <span style={{ fontSize: 11, color: P.gray400 }}>📊 {metricCount} metrics</span>}
                      {timeCount > 0 && <span style={{ fontSize: 11, color: P.gray400 }}>⏱ {timeCount} categories</span>}
                      {hasNotes && <span style={{ fontSize: 11, color: P.gray400 }}>📝 Notes</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} color={P.gray400} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Person View ───────────────────────────────────────────────────────────────
function PersonView({ member, isOwnProfile, onBack, members, weekDataMap, onPresentAll }) {
  const weekKey = getWeekKey();
  const weekLabel = getWeekLabel();
  const [tab, setTab] = useState("metrics");
  const [weekData, setWeekData] = useState({ metrics: [], time: [], notes: "" });
  const [nML, setNML] = useState(""); const [nMV, setNMV] = useState("");
  const [nTL, setNTL] = useState(""); const [nTV, setNTV] = useState("");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadWeekData(); }, [member.id]);

  async function loadWeekData() {
    const { data } = await supabase.from("member_week_data").select("*").eq("member_id", member.id).eq("week_key", weekKey).single();
    if (data) setWeekData({ metrics: data.metrics || [], time: data.time || [], notes: data.notes || "" });
    else setWeekData({ metrics: [], time: [], notes: "" });
  }

  async function persist(update) {
    if (!isOwnProfile) return;
    setSaving(true);
    setWeekData(update);
    await supabase.from("member_week_data").upsert({ member_id: member.id, week_key: weekKey, ...update }, { onConflict: "member_id,week_key" });
    setSaving(false);
  }

  function addMetric() { if (!nML.trim()) return; persist({ ...weekData, metrics: [...weekData.metrics, { label: nML.trim(), value: nMV.trim() }] }); setNML(""); setNMV(""); }
  function updateMetric(i, f, v) { persist({ ...weekData, metrics: weekData.metrics.map((m, idx) => idx === i ? { ...m, [f]: v } : m) }); }
  function removeMetric(i) { persist({ ...weekData, metrics: weekData.metrics.filter((_, idx) => idx !== i) }); }
  function addTime() {
    if (!nTL.trim()) return;
    const used = weekData.time.reduce((s, t) => s + (parseFloat(t.value) || 0), 0);
    if (used >= 100) return;
    const capped = Math.min(parseFloat(nTV) || 0, 100 - used);
    persist({ ...weekData, time: [...weekData.time, { label: nTL.trim(), value: String(capped) }] });
    setNTL(""); setNTV("");
  }
  function updateTime(i, f, v) {
    if (f === "value") { const others = weekData.time.reduce((s, t, idx) => idx === i ? s : s + (parseFloat(t.value) || 0), 0); v = String(Math.min(parseFloat(v) || 0, 100 - others)); }
    persist({ ...weekData, time: weekData.time.map((t, idx) => idx === i ? { ...t, [f]: v } : t) });
  }
  function removeTime(i) { persist({ ...weekData, time: weekData.time.filter((_, idx) => idx !== i) }); }

  const totalPct = weekData.time.reduce((s, t) => s + (parseFloat(t.value) || 0), 0);
  const timeSlices = weekData.time.map((t, i) => ({ label: t.label, value: parseFloat(t.value) || 0, color: SWATCHES[i % SWATCHES.length], pct: t.value })).filter(s => s.value > 0);
  const inp = (extra = {}) => ({ padding: "10px 12px", border: `1.5px solid ${P.gray200}`, borderRadius: 10, fontSize: 13, outline: "none", background: P.gray50, color: P.gray700, fontFamily: "inherit", ...extra });

  if (showHistory) return <HistoryView member={member} onBack={() => setShowHistory(false)} />;

  const memberIndex = members ? members.findIndex(m => m.id === member.id) : 0;

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, padding: "40px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 24, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={member.user_name} size={48} />
            <div>
              <p style={{ fontWeight: 900, fontSize: 22, color: P.gray700, margin: 0 }}>{member.user_name}</p>
              <p style={{ fontSize: 12, color: P.gray400, margin: 0 }}>{weekLabel} {saving && "· Saving..."}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowHistory(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${P.gray200}`, background: P.white, color: P.gray400, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              <History size={13} />History
            </button>
            <button onClick={() => onPresentAll(memberIndex)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 20, border: "none", background: P.red, color: "white", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              <Maximize2 size={14} />Present
            </button>
          </div>
        </div>
        <div style={{ display: "flex", background: P.gray100, borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 }}>
          {["metrics", "time", "notes"].map(t => <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />)}
        </div>

        {!isOwnProfile && (
          <div style={{ background: "#fffbea", border: "1px solid #f5e642", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#856404" }}>
            👁 Viewing {member.user_name}'s data — read only
          </div>
        )}

        {tab === "metrics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><BarChart2 size={15} color={P.red} /><span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>Weekly Metrics</span></div>
              {!weekData.metrics.length && <p style={{ fontSize: 13, color: P.gray400, marginBottom: 12 }}>{isOwnProfile ? "No metrics yet — add one below." : "No metrics entered yet."}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {weekData.metrics.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SWATCHES[i % SWATCHES.length], flexShrink: 0 }} />
                    <input style={inp({ flex: 1 })} value={m.label} onChange={e => updateMetric(i, "label", e.target.value)} placeholder="Metric name" disabled={!isOwnProfile} />
                    <input style={inp({ width: 110 })} value={m.value} onChange={e => updateMetric(i, "value", e.target.value)} placeholder="Value" disabled={!isOwnProfile} />
                    {isOwnProfile && <button onClick={() => removeMetric(i)} style={{ background: P.gray100, border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12} color={P.gray400} /></button>}
                  </div>
                ))}
              </div>
              {isOwnProfile && (
                <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${P.gray100}` }}>
                  <input style={inp({ flex: 1 })} value={nML} onChange={e => setNML(e.target.value)} onKeyPress={e => e.key === "Enter" && addMetric()} placeholder="Metric name" />
                  <input style={inp({ width: 120 })} value={nMV} onChange={e => setNMV(e.target.value)} onKeyPress={e => e.key === "Enter" && addMetric()} placeholder="Value" />
                  <button onClick={addMetric} disabled={!nML.trim()} style={{ background: nML.trim() ? P.red : P.gray200, border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: nML.trim() ? "pointer" : "not-allowed" }}><Plus size={16} color="white" /></button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "time" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><PieChart size={15} color={P.red} /><span style={{ fontWeight: 800, fontSize: 14, color: P.gray700 }}>Time Breakdown</span></div>
                <span style={{ fontSize: 12, color: totalPct > 100 ? P.red : P.gray400, fontWeight: 700 }}>{totalPct.toFixed(0)}% / 100%</span>
              </div>
              {timeSlices.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <DonutChart slices={[...timeSlices, ...(100 - totalPct > 0 ? [{ label: "Unallocated", value: 100 - totalPct, color: P.gray100 }] : [])]} size={240} label={`${totalPct.toFixed(0)}%\nallocated`} />
                </div>
              )}
              {!weekData.time.length && <p style={{ fontSize: 13, color: P.gray400, marginBottom: 12 }}>{isOwnProfile ? "No time breakdown yet." : "No time data entered."}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {weekData.time.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SWATCHES[i % SWATCHES.length], flexShrink: 0 }} />
                    <input style={inp({ flex: 1 })} value={t.label} onChange={e => updateTime(i, "label", e.target.value)} placeholder="Category" disabled={!isOwnProfile} />
                    <div style={{ position: "relative", width: 80 }}><input style={inp({ width: "100%", textAlign: "right", paddingRight: 20, boxSizing: "border-box" })} value={t.value} onChange={e => updateTime(i, "value", e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" disabled={!isOwnProfile} /><span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: P.gray400 }}>%</span></div>
                    {isOwnProfile && <button onClick={() => removeTime(i)} style={{ background: P.gray100, border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12} color={P.gray400} /></button>}
                  </div>
                ))}
              </div>
              {isOwnProfile && (
                <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${P.gray100}` }}>
                  <input style={inp({ flex: 1 })} value={nTL} onChange={e => setNTL(e.target.value)} onKeyPress={e => e.key === "Enter" && addTime()} placeholder="Category" />
                  <div style={{ position: "relative", width: 80 }}><input style={inp({ width: "100%", textAlign: "right", paddingRight: 20, boxSizing: "border-box" })} value={nTV} onChange={e => setNTV(e.target.value.replace(/[^0-9.]/g, ""))} onKeyPress={e => e.key === "Enter" && addTime()} placeholder="0" /><span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: P.gray400 }}>%</span></div>
                  <button onClick={addTime} disabled={!nTL.trim() || totalPct >= 100} style={{ background: nTL.trim() && totalPct < 100 ? P.red : P.gray200, border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: nTL.trim() && totalPct < 100 ? "pointer" : "not-allowed" }}><Plus size={16} color="white" /></button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "notes" && (
          <div style={{ ...card, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <StickyNote size={15} color={P.red} />
              <span style={{ fontWeight: 800, fontSize: 15, color: P.gray700 }}>Notes</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: P.gray400, background: P.gray100, padding: "2px 8px", borderRadius: 20 }}>{isOwnProfile ? "Personal" : "Read only"}</span>
            </div>
            <textarea value={weekData.notes || ""} onChange={e => isOwnProfile && persist({ ...weekData, notes: e.target.value })}
              placeholder={isOwnProfile ? "Your personal notes for this week..." : "No notes entered yet."}
              disabled={!isOwnProfile}
              style={{ width: "100%", height: 240, padding: "12px 14px", border: `1.5px solid ${P.gray200}`, borderRadius: 12, fontSize: 13, color: P.gray700, resize: "none", outline: "none", background: P.gray50, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }} />
            <p style={{ fontSize: 11, color: P.gray400, marginTop: 8, textAlign: "right" }}>{(weekData.notes || "").length} chars</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team History View ─────────────────────────────────────────────────────────
function TeamHistoryView({ members, onBack, onSelectMember }) {
  const pastWeeks = Array.from({ length: 8 }, (_, i) => ({
    key: getWeekKey(-i),
    label: getWeekLabel(getWeekKey(-i)),
    isCurrent: i === 0
  }));

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, padding: "40px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 24, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
        <p style={{ fontWeight: 900, fontSize: 22, color: P.gray700, marginBottom: 8 }}>Team History</p>
        <p style={{ fontSize: 13, color: P.gray400, marginBottom: 24 }}>Tap a team member to see their history across all weeks.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map(m => (
            <div key={m.id} onClick={() => onSelectMember(m)} style={{ ...card, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.08)"}>
              <Avatar name={m.user_name} size={44} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 15, color: P.gray700, margin: 0 }}>{m.user_name}</p>
                <p style={{ fontSize: 12, color: P.gray400, margin: 0 }}>View weekly history</p>
              </div>
              <ChevronRight size={16} color={P.gray400} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AI Analyst ────────────────────────────────────────────────────────────────
function AnalystPanel({ members, teamId, userId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [allData, setAllData] = useState("");
  const [convId, setConvId] = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    async function init() {
      // Load or create conversation record
      const { data: existing } = await supabase
        .from("analyst_conversations")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (existing) {
        setConvId(existing.id);
        setMessages(existing.messages || []);
      }
      setLoadingConv(false);

      // Load team data
      const blocks = [];
      for (const m of members) {
        const { data } = await supabase.from("member_week_data").select("*").eq("member_id", m.id).order("week_key", { ascending: false }).limit(52);
        if (data?.length) {
          const weeks = data.map(w => {
            const [year, wk] = w.week_key.split("-W");
            const weekNum = parseInt(wk);
            const jan4 = new Date(parseInt(year), 0, 4);
            const startOfW1 = new Date(jan4);
            startOfW1.setDate(jan4.getDate() - jan4.getDay() + 1);
            const weekStart = new Date(startOfW1);
            weekStart.setDate(startOfW1.getDate() + (weekNum - 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 4);
            const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const weekLabel = `${fmt(weekStart)}-${fmt(weekEnd)} ${year}`;
            const parts = [`Week of ${weekLabel}`];
            if (w.metrics?.length) parts.push(`Metrics: ${w.metrics.map(x => `${x.label}=${x.value}`).join(", ")}`);
            if (w.time?.length) parts.push(`Time: ${w.time.map(x => `${x.label}=${x.value}%`).join(", ")}`);
            if (w.notes?.trim()) parts.push(`Notes: ${w.notes.trim().slice(0, 100)}`);
            return parts.join(" | ");
          }).join("\n");
          blocks.push(`### ${m.user_name}\n${weeks}`);
        }
      }
      setAllData(blocks.join("\n\n"));
      setHistoryLoaded(true);
    }
    init();
  }, []);

  async function saveMessages(msgs) {
    if (convId) {
      await supabase.from("analyst_conversations").update({ messages: msgs, updated_at: new Date().toISOString() }).eq("id", convId);
    } else {
      const { data } = await supabase.from("analyst_conversations").insert({ team_id: teamId, user_id: userId, messages: msgs }).select().single();
      if (data) setConvId(data.id);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !historyLoaded) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, allData })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const finalMessages = [...newMessages, { role: "assistant", content: data.answer }];
      setMessages(finalMessages);
      await saveMessages(finalMessages);
    } catch(e) {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
    }
    setLoading(false);
  }

  async function clearConversation() {
    setMessages([]);
    if (convId) {
      await supabase.from("analyst_conversations").update({ messages: [], updated_at: new Date().toISOString() }).eq("id", convId);
    }
  }

  const suggestions = [
    "Who has been most consistent over the past month?",
    "What's taking up the most time across the team?",
    "Is anyone's workload increasing significantly?",
    "Summarize trends from the last 4 weeks",
  ];

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: P.white, borderBottom: `1px solid ${P.gray100}`, padding: "16px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
          <div style={{ width: 1, height: 20, background: P.gray200 }} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={16} color="white" /></div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: P.gray700, margin: 0 }}>AI Analyst</p>
            <p style={{ fontSize: 11, color: P.gray400, margin: 0 }}>{historyLoaded ? `${members.length} members · up to 52 weeks of data loaded` : "Loading team data..."}</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Sparkles size={28} color="white" /></div>
              <p style={{ fontWeight: 900, fontSize: 18, color: P.gray700, marginBottom: 8 }}>Ask me anything about your team</p>
              <p style={{ fontSize: 13, color: P.gray400, marginBottom: 28 }}>{historyLoaded ? "I have access to your full team history." : "Loading team data, just a moment..."}</p>
              {historyLoaded && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480, margin: "0 auto" }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setInput(s)}
                      style={{ padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${P.gray200}`, background: P.white, color: P.gray700, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", gap: 10, maxWidth: "90%" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><Sparkles size={14} color="white" /></div>
                  <div style={{ ...card, padding: 20 }}>
                    <p style={{ fontSize: 14, color: P.gray700, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div style={{ background: "#6366f1", color: "white", borderRadius: "18px 18px 4px 18px", padding: "12px 18px", fontSize: 14, fontWeight: 600, maxWidth: "70%", lineHeight: 1.5 }}>
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={14} color="white" /></div>
              <div style={{ ...card, padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s ${i*0.15}s infinite` }} />)}
                <style>{"@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}"}</style>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: P.white, borderTop: `1px solid ${P.gray100}`, padding: "16px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={historyLoaded ? "Ask anything about your team data..." : "Loading data..."}
            disabled={!historyLoaded}
            style={{ flex: 1, padding: "12px 18px", border: `1.5px solid ${P.gray200}`, borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", color: P.gray700, background: P.gray50 }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading || !historyLoaded}
            style={{ padding: "12px 20px", borderRadius: 24, border: "none", background: input.trim() && !loading && historyLoaded ? "#6366f1" : P.gray200, color: "white", fontWeight: 800, fontSize: 14, cursor: input.trim() && !loading && historyLoaded ? "pointer" : "default", fontFamily: "inherit" }}>
            Ask
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: P.gray400, marginTop: 8 }}>Press Enter to ask · Powered by Groq AI</p>
      </div>
    </div>
  );
}

// ── AI Summary ────────────────────────────────────────────────────────────────
function SummaryPanel({ members, onClose }) {
  const weekLabel = getWeekLabel();
  const weekKey = getWeekKey();
  const [messages, setMessages] = useState([]); // {role, content}
  const [currentSummary, setCurrentSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [dataBlock, setDataBlock] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function buildDataBlock() {
    const memberData = [];
    for (const m of members) {
      const { data } = await supabase.from("member_week_data").select("*").eq("member_id", m.id).eq("week_key", weekKey).single();
      if (data && (data.metrics?.length || data.time?.length || data.notes?.trim())) {
        memberData.push({ name: m.user_name, ...data });
      }
    }
    if (!memberData.length) return null;
    return memberData.map(m => {
      const parts = [];
      if (m.metrics?.length) parts.push(`Metrics:\n${m.metrics.map(x => `  - ${x.label}: ${x.value || "—"}`).join("\n")}`);
      if (m.time?.length) parts.push(`Time:\n${m.time.map(x => `  - ${x.label}: ${x.value}%`).join("\n")}`);
      if (m.notes?.trim()) parts.push(`Notes:\n  ${m.notes.trim()}`);
      return `### ${m.name}\n${parts.join("\n")}`;
    }).join("\n\n");
  }

  async function generate() {
    setLoading(true); setError(""); setMessages([]); setCurrentSummary("");
    const block = await buildDataBlock();
    if (!block) { setError("No data entered this week yet."); setLoading(false); return; }
    setDataBlock(block);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekLabel, dataBlock: block, messages: [] }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrentSummary(data.summary);
      setMessages([{ role: "assistant", content: data.summary }]);
    } catch(e) { setError("Something went wrong. Try again."); }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekLabel, dataBlock, messages: newMessages }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrentSummary(data.summary);
      setMessages([...newMessages, { role: "assistant", content: data.summary }]);
    } catch(e) { setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]); }
    setLoading(false);
  }

  function copy() { navigator.clipboard.writeText(currentSummary).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }
  useEffect(() => { generate(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: P.white, borderBottom: `1px solid ${P.gray100}`, padding: "16px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
            <div style={{ width: 1, height: 20, background: P.gray200 }} />
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: P.red, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} color="white" /></div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: P.gray700, margin: 0 }}>Executive Summary</p>
              <p style={{ fontSize: 11, color: P.gray400, margin: 0 }}>AI-generated · {weekLabel}</p>
            </div>
          </div>
          {currentSummary && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, border: "none", background: copied ? "#00a86b" : P.red, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
              </button>
              <button onClick={generate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: `2px solid ${P.redMid}`, background: P.redLight, color: P.red, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                <RefreshCw size={13} />Restart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 0", color: P.gray400 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${P.redMid}`, borderTopColor: P.red, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <style>{"@keyframes spin{to{transform:rotate(360deg);}}"}</style>
              <p style={{ fontWeight: 600, fontSize: 13 }}>Generating summary...</p>
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: P.red, fontWeight: 600, marginBottom: 16 }}>{error}</p>
              <button onClick={generate} style={{ background: P.red, color: "white", border: "none", borderRadius: 20, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", gap: 10, maxWidth: "90%" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><FileText size={14} color="white" /></div>
                  <div style={{ ...card, padding: 20 }}>
                    {i === 0 && <p style={{ fontSize: 10, fontWeight: 800, color: P.gray400, letterSpacing: 2, marginBottom: 12, margin: "0 0 12px" }}>READY FOR SENIOR MANAGEMENT</p>}
                    <p style={{ fontSize: 14, color: P.gray700, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div style={{ background: P.red, color: "white", borderRadius: "18px 18px 4px 18px", padding: "12px 18px", fontSize: 14, fontWeight: 600, maxWidth: "70%", lineHeight: 1.5 }}>
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {loading && messages.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: P.red, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={14} color="white" /></div>
              <div style={{ ...card, padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: P.red, animation: `bounce 1s ${i*0.15}s infinite` }} />)}
                <style>{"@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}"}</style>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input bar */}
      {(currentSummary || error) && (
        <div style={{ background: P.white, borderTop: `1px solid ${P.gray100}`, padding: "16px 32px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder='Refine it... e.g. "make it shorter" or "focus more on metrics"'
              style={{ flex: 1, padding: "12px 18px", border: `1.5px solid ${P.gray200}`, borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", color: P.gray700, background: P.gray50 }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              style={{ padding: "12px 20px", borderRadius: 24, border: "none", background: input.trim() && !loading ? P.red : P.gray200, color: "white", fontWeight: 800, fontSize: 14, cursor: input.trim() && !loading ? "pointer" : "default", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              Send
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: P.gray400, marginTop: 8 }}>Press Enter to send · Ask AI to refine until it's perfect</p>
        </div>
      )}
    </div>
  );
}

// ── Main Team App ─────────────────────────────────────────────────────────────
export default function TeamApp() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState([]);
  const [showOrderManager, setShowOrderManager] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showAnalyst, setShowAnalyst] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(30);
  const [teamNotes, setTeamNotes] = useState("");
  const [showTeamNotes, setShowTeamNotes] = useState(false);
  const [showTeamHistory, setShowTeamHistory] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const [presentStartIdx, setPresentStartIdx] = useState(0);
  const [weekDataMap, setWeekDataMap] = useState({});
  const [prevWeekDataMap, setPrevWeekDataMap] = useState({});
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIv = useRef(null);
  useEffect(() => {
    if (timerRunning) { timerIv.current = setInterval(() => setTimerElapsed(e => e + 1), 1000); }
    else clearInterval(timerIv.current);
    return () => clearInterval(timerIv.current);
  }, [timerRunning]);

  useEffect(() => { if (user) loadTeam(); }, [teamId, user]);

  async function loadTeam() {
    setLoading(true);
    const { data: teamData } = await supabase.from("teams").select("*").eq("id", teamId).single();
    if (!teamData) { navigate("/dashboard"); return; }
    setTeam(teamData);
    setDuration(teamData.duration || 30);
    const { data: membersData } = await supabase.from("team_members").select("*").eq("team_id", teamId).order("created_at");
    setMembers(membersData || []);
    const me = (membersData || []).find(m => m.user_id === user.id);
    if (!me) { navigate("/dashboard"); return; }
    setMyRole(me.role);
    const { data: notesData } = await supabase.from("team_notes").select("notes").eq("team_id", teamId).eq("week_key", getWeekKey()).single();
    if (notesData) setTeamNotes(notesData.notes || "");

    // Load current + previous week data for present mode
    const weekKey = getWeekKey();
    // Compute previous week key
    const [yr, wk] = weekKey.split("-W").map(Number);
    const prevWk = wk === 1 ? 52 : wk - 1;
    const prevYr = wk === 1 ? yr - 1 : yr;
    const prevWeekKey = `${prevYr}-W${String(prevWk).padStart(2, "0")}`;
    const map = {};
    const prevMap = {};
    for (const m of (membersData || [])) {
      const { data } = await supabase.from("member_week_data").select("*").eq("member_id", m.id).eq("week_key", weekKey).single();
      if (data) map[m.id] = data;
      const { data: prev } = await supabase.from("member_week_data").select("*").eq("member_id", m.id).eq("week_key", prevWeekKey).single();
      if (prev) prevMap[m.id] = prev;
    }
    setWeekDataMap(map);
    setPrevWeekDataMap(prevMap);
    setLoading(false);
  }

  async function saveTeamNotes(val) {
    setTeamNotes(val);
    await supabase.from("team_notes").upsert({ team_id: teamId, week_key: getWeekKey(), notes: val }, { onConflict: "team_id,week_key" });
  }

  async function saveDuration(val) {
    setDuration(val);
    await supabase.from("teams").update({ duration: val }).eq("id", teamId);
  }

  async function removeMember(memberId) {
    await supabase.from("team_members").delete().eq("id", memberId);
    setMembers(members.filter(m => m.id !== memberId));
    setOrder(order.filter(id => id !== memberId));
  }

  async function toggleAdmin(member) {
    const newRole = member.role === "admin" ? "member" : "admin";
    await supabase.from("team_members").update({ role: newRole }).eq("id", member.id);
    setMembers(members.map(m => m.id === member.id ? { ...m, role: newRole } : m));
  }


  function copyCode() {
    navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePresentAll(startIdx = 0) {
    setPresentStartIdx(startIdx);
    setPresenting(true);
    setSelectedMember(null);
  }

  const isAdmin = myRole === "admin";
  const myMember = members.find(m => m.user_id === user.id);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: P.gray50 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${P.redMid}`, borderTopColor: P.red, animation: "spin 0.8s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg);}}"}</style>
    </div>
  );

  if (presenting) return <PresentMode members={members} initialMemberIndex={presentStartIdx} weekDataMap={weekDataMap} prevWeekDataMap={prevWeekDataMap} onExit={() => setPresenting(false)} duration={duration} timerElapsed={timerElapsed} timerRunning={timerRunning} setTimerRunning={setTimerRunning} />;

  if (historyMember) return <HistoryView member={historyMember} onBack={() => setHistoryMember(null)} />;

  if (showTeamHistory) return <TeamHistoryView members={members} onBack={() => setShowTeamHistory(false)} onSelectMember={m => { setShowTeamHistory(false); setHistoryMember(m); }} />;

  if (selectedMember) {
    const isOwnProfile = selectedMember.user_id === user.id;
    return <PersonView member={selectedMember} isOwnProfile={isOwnProfile} onBack={() => setSelectedMember(null)} members={members} weekDataMap={weekDataMap} onPresentAll={handlePresentAll} />;
  }

  if (showSummary) return <SummaryPanel members={members} onClose={() => setShowSummary(false)} />;
  if (showAnalyst) return <AnalystPanel members={members} teamId={teamId} userId={user.id} onClose={() => setShowAnalyst(false)} />;

  if (showTeamNotes) return (
    <div style={{ minHeight: "100vh", background: P.gray50, padding: "40px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <button onClick={() => setShowTeamNotes(false)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 24, fontFamily: "inherit" }}><ArrowLeft size={16} />Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: P.redLight, display: "flex", alignItems: "center", justifyContent: "center" }}><MessageSquare size={20} color={P.red} /></div>
          <div><p style={{ fontWeight: 900, fontSize: 20, color: P.gray700 }}>Team Notes</p><p style={{ fontSize: 12, color: P.gray400 }}>Shared · {getWeekLabel()}</p></div>
        </div>
        <div style={{ ...card, padding: 24 }}>
          <textarea value={teamNotes} onChange={e => saveTeamNotes(e.target.value)} placeholder="Shared notes — blockers, decisions, action items..."
            style={{ width: "100%", height: 240, padding: "12px 14px", border: `1.5px solid ${P.gray200}`, borderRadius: 12, fontSize: 13, color: P.gray700, resize: "none", outline: "none", background: P.gray50, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }} />
          <p style={{ fontSize: 11, color: P.gray400, marginTop: 8, textAlign: "right" }}>{teamNotes.length} chars · visible to all members</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, fontFamily: "'DM Sans', sans-serif" }}>

      <nav style={{ background: P.white, borderBottom: `1px solid ${P.gray100}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="quorum-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: P.gray400, padding: 6 }}><ArrowLeft size={18} /></button>
            <Logo size={28} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: P.gray700 }}>{team?.name}</div>
            {isAdmin && <span style={{ fontSize: 10, fontWeight: 800, background: P.redLight, color: P.red, padding: "3px 10px", borderRadius: 20 }}>ADMIN</span>}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 40px" }}>

        {/* Week header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 2, marginBottom: 6 }}>THIS WEEK</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: P.gray700 }}>{getWeekLabel()}</p>
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button onClick={() => { if (!order.length) setOrder([...members]); setShowOrderManager(true); }} disabled={!members.length}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", borderRadius: 16, border: "none", cursor: "pointer", fontWeight: 900, fontSize: 15, background: P.red, color: "white", boxShadow: "0 4px 16px rgba(230,0,35,.2)", fontFamily: "inherit" }}>
            <GripHorizontal size={18} />Set Order
          </button>
          <button onClick={() => handlePresentAll(0)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px", borderRadius: 16, border: `2px solid ${P.gray200}`, background: P.white, color: P.gray700, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            <Maximize2 size={16} />Present
          </button>
          <button onClick={() => setShowTeamNotes(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 16px", borderRadius: 16, border: `2px solid ${P.redMid}`, background: P.redLight, color: P.red, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            <MessageSquare size={16} />Notes
          </button>
        </div>

        {/* My Update */}
        {myMember && (
          <div onClick={() => setSelectedMember(myMember)} style={{ ...card, padding: 20, marginBottom: 20, cursor: "pointer", borderLeft: `4px solid ${P.red}`, display: "flex", alignItems: "center", gap: 16 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(230,0,35,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.08)"}>
            <Avatar name={myMember.user_name} size={48} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 16, color: P.gray700, margin: 0 }}>My Update</p>
              <p style={{ fontSize: 13, color: P.gray400, margin: "4px 0 0" }}>Add your metrics, time breakdown & notes</p>
            </div>
            <ChevronRight size={18} color={P.gray400} />
          </div>
        )}

        {/* Order Manager Modal */}
        {showOrderManager && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: P.white, borderRadius: 24, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: P.gray700 }}>Speaking Order</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setOrder([...members].sort(() => Math.random() - .5))}
                    style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${P.gray200}`, background: P.white, color: P.gray500, cursor: "pointer", fontFamily: "inherit" }}>
                    Randomize
                  </button>
                  <button onClick={() => setOrder([...members])}
                    style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${P.gray200}`, background: P.white, color: P.gray500, cursor: "pointer", fontFamily: "inherit" }}>
                    Reset
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: P.gray400, marginBottom: 16, fontWeight: 600 }}>Drag to reorder, or use arrows</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {order.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 14, background: i === 0 ? P.redLight : P.gray50, border: `1.5px solid ${i === 0 ? P.redMid : "transparent"}` }}
                    draggable onDragStart={e => e.dataTransfer.setData("idx", i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      const from = parseInt(e.dataTransfer.getData("idx"));
                      const to = i;
                      if (from === to) return;
                      const newOrder = [...order];
                      const [moved] = newOrder.splice(from, 1);
                      newOrder.splice(to, 0, moved);
                      setOrder(newOrder);
                    }}>
                    <GripHorizontal size={16} color={P.gray400} style={{ cursor: "grab", flexShrink: 0 }} />
                    <span style={{ fontSize: 16, fontWeight: 900, color: P.red, width: 22 }}>{i + 1}</span>
                    <Avatar name={m.user_name} size={32} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: P.gray700, flex: 1 }}>{m.user_name}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button onClick={() => { if (i === 0) return; const o = [...order]; [o[i-1], o[i]] = [o[i], o[i-1]]; setOrder(o); }} disabled={i === 0}
                        style={{ background: "none", border: "none", cursor: i === 0 ? "not-allowed" : "pointer", padding: "1px 4px", color: i === 0 ? P.gray200 : P.gray400, fontSize: 10 }}>▲</button>
                      <button onClick={() => { if (i === order.length-1) return; const o = [...order]; [o[i], o[i+1]] = [o[i+1], o[i]]; setOrder(o); }} disabled={i === order.length-1}
                        style={{ background: "none", border: "none", cursor: i === order.length-1 ? "not-allowed" : "pointer", padding: "1px 4px", color: i === order.length-1 ? P.gray200 : P.gray400, fontSize: 10 }}>▼</button>
                    </div>
                    {i === 0 && <span style={{ fontSize: 10, fontWeight: 800, background: P.red, color: "white", padding: "3px 10px", borderRadius: 20 }}>First</span>}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowOrderManager(false)}
                style={{ width: "100%", padding: "13px 0", borderRadius: 14, border: "none", background: P.red, color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Today's order - compact display */}
        {order.length > 0 && (
          <div style={{ ...card, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 2 }}>TODAY'S ORDER</p>
              <button onClick={() => setShowOrderManager(true)} style={{ fontSize: 12, fontWeight: 700, color: P.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.map((m, i) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: i === 0 ? P.redLight : P.gray50 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: P.red, width: 24, textAlign: "center" }}>{i + 1}</span>
                  <Avatar name={m.user_name} size={32} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: P.gray700, flex: 1 }}>{m.user_name}</span>
                  {i === 0 && <span style={{ fontSize: 10, fontWeight: 800, background: P.red, color: "white", padding: "3px 10px", borderRadius: 20 }}>First up</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Timer */}
        <div style={{ marginBottom: 20 }}><MeetingTimer duration={duration} elapsed={timerElapsed} setElapsed={setTimerElapsed} running={timerRunning} setRunning={setTimerRunning} /></div>

        {/* Team members */}
        <div style={{ ...card, marginBottom: 12 }}>
          <button onClick={() => setMembersOpen(!membersOpen)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 22, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={18} color={P.gray400} />
              <span style={{ fontWeight: 900, fontSize: 16, color: P.gray700 }}>Team</span>
              <span style={{ fontSize: 13, color: P.gray400, fontWeight: 600 }}>{members.length} members</span>
            </div>
            {membersOpen ? <ChevronUp size={18} color={P.gray400} /> : <ChevronDown size={18} color={P.gray400} />}
          </button>
          {membersOpen && (
            <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${P.gray100}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: P.gray50 }}>
                    <Avatar name={m.user_name} size={36} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: P.gray700 }}>{m.user_name}</span>
                      {m.user_id?.startsWith("placeholder_") && <span style={{ fontSize: 10, color: P.gray400, fontWeight: 600, marginLeft: 6 }}>· pending</span>}
                    </div>
                    {m.role === "admin" && <Crown size={13} color={P.red} />}
                    <button onClick={() => setSelectedMember(m)} style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${P.gray200}`, background: P.white, color: P.gray400, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>View</button>
                    {isAdmin && m.user_id !== user.id && (
                      <>
                        <button onClick={() => toggleAdmin(m)} title={m.role === "admin" ? "Remove admin" : "Make admin"}
                          style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${m.role === "admin" ? P.redMid : P.gray200}`, background: m.role === "admin" ? P.redLight : P.white, color: m.role === "admin" ? P.red : P.gray400, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          {m.role === "admin" ? "Admin ✓" : "Make Admin"}
                        </button>
                        <button onClick={() => removeMember(m.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={14} color={P.gray400} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Team History */}
        <button onClick={() => setShowTeamHistory(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 0", borderRadius: 16, border: `2px solid ${P.gray200}`, background: P.white, color: P.gray700, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 24 }}>
          <History size={16} />Team History
        </button>

        {/* Admin Settings */}
        {isAdmin && (
          <div style={{ ...card, padding: 22, marginBottom: 24, borderTop: `3px solid ${P.red}` }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Crown size={16} color={P.red} />
                <span style={{ fontWeight: 800, fontSize: 15, color: P.gray700 }}>Admin Settings</span>
              </div>
              {showSettings ? <ChevronUp size={16} color={P.gray400} /> : <ChevronDown size={16} color={P.gray400} />}
            </button>
            {showSettings && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${P.gray100}`, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ background: "linear-gradient(135deg, #fff5f6, #fff0f1)", border: `1.5px solid ${P.redMid}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Users size={15} color={P.red} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: P.red }}>Invite Teammates</span>
                  </div>
                  <div style={{ background: P.white, borderRadius: 12, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: P.gray400, margin: "0 0 4px", letterSpacing: 1 }}>INVITE CODE</p>
                      <p style={{ fontSize: 24, fontWeight: 900, letterSpacing: 6, color: P.gray700, margin: 0 }}>{team?.invite_code}</p>
                    </div>
                    <button onClick={copyCode} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "none", background: copied ? "#e8f5e9" : P.redLight, color: copied ? "#2e7d32" : P.red, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy Code</>}
                    </button>
                  </div>
                  <button onClick={() => {
                    const msg = `Join my team on Quorum! 🎯\n\nGo to: quorum-lac.vercel.app\nSign up and enter invite code: ${team?.invite_code}`;
                    navigator.clipboard.writeText(msg);
                    setCopied(true); setTimeout(() => setCopied(false), 2000);
                  }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 12, border: `1.5px solid ${P.redMid}`, background: "none", color: P.red, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    <MessageSquare size={14} />Copy Invite Message
                  </button>
                  <p style={{ fontSize: 11, color: P.gray400, marginTop: 10, textAlign: "center" }}>Teammates go to <strong>quorum-lac.vercel.app</strong>, sign up, and enter this code</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 1, marginBottom: 8 }}>MEETING DURATION (MIN)</label>
                  <input type="number" min="1" max="480" value={duration} onChange={e => saveDuration(parseInt(e.target.value) || 30)}
                    style={{ padding: "12px 16px", border: `1.5px solid ${P.gray200}`, borderRadius: 12, fontSize: 14, outline: "none", background: P.white, color: P.gray700, width: 110, fontFamily: "inherit" }} />
                </div>
                <div style={{ paddingTop: 16, borderTop: `1px solid ${P.redMid}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button onClick={() => setShowSummary(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 14, border: "none", background: P.red, color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                      <FileText size={16} />Generate Executive Summary
                    </button>
                    <button onClick={() => setShowAnalyst(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                      <Sparkles size={16} />Ask AI Analyst
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: P.gray200, fontWeight: 700, marginTop: 8, letterSpacing: .5 }}>QUORUM · BEFORE, DURING, AND AFTER</p>
      </div>
    </div>
  );
}
