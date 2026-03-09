import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase.js";
import { Plus, Users, ArrowRight, LogOut } from "lucide-react";

const P = {
  red: "#e60023", redLight: "#ffeef0", redMid: "#ffccd2",
  gray50: "#fafafa", gray100: "#f0f0f0", gray200: "#e0e0e0",
  gray400: "#888", gray700: "#222", white: "#fff",
};

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: P.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={17} height={22} viewBox="0 0 22 28" fill="none">
          <path d="M11 2C6.03 2 2 6.03 2 11c0 3.87 2.34 7.19 5.7 8.67-.08-.7-.15-1.77.03-2.53.16-.68 1.08-4.58 1.08-4.58s-.28-.55-.28-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.97-.77 3.07-.22.92.46 1.66 1.36 1.66 1.63 0 2.73-2.09 2.73-4.56 0-1.88-1.27-3.29-3.57-3.29-2.6 0-4.22 1.94-4.22 4.1 0 .74.21 1.27.55 1.67.15.18.17.25.11.46-.04.15-.13.5-.17.64-.05.21-.2.28-.38.2C5.7 13.7 4.8 12.1 4.8 10.2c0-2.93 2.48-6.44 7.41-6.44 3.96 0 6.57 2.88 6.57 5.97 0 4.1-2.27 7.17-5.6 7.17-1.12 0-2.18-.6-2.54-1.28l-.7 2.7c-.22.85-.69 1.7-1.1 2.37.83.25 1.7.39 2.6.39 4.97 0 9-4.03 9-9S15.97 2 11 2z" fill="white" />
        </svg>
      </div>
      <span style={{ fontSize: 18, fontWeight: 900, color: P.gray700, fontFamily: "'DM Serif Display', serif" }}>Quorum</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (user) loadTeams();
  }, [user]);

  async function loadTeams() {
    setLoading(true);
    const { data } = await supabase
      .from("team_members")
      .select("role, teams(id, name, invite_code, created_at)")
      .eq("user_id", user.id);
    setTeams(data || []);
    setLoading(false);
  }

  async function joinTeam() {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    const code = joinCode.trim().toUpperCase();
    const { data: team } = await supabase.from("teams").select("id, name").eq("invite_code", code).single();
    if (!team) { setJoinError("Team not found. Check the code and try again."); setJoining(false); return; }
    const { data: existing } = await supabase.from("team_members").select("id").eq("team_id", team.id).eq("user_id", user.id).single();
    if (existing) { navigate(`/team/${team.id}`); return; }
    await supabase.from("team_members").insert({ team_id: team.id, user_id: user.id, user_name: user.firstName || user.emailAddresses[0].emailAddress.split("@")[0], user_email: user.emailAddresses[0].emailAddress, role: "member" });
    navigate(`/team/${team.id}`);
  }

  const inp = { padding: "10px 14px", border: `1.5px solid ${P.gray200}`, borderRadius: 10, fontSize: 13, outline: "none", background: P.white, color: P.gray700, fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: P.gray50, fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: P.white, borderBottom: `1px solid ${P.gray100}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: P.gray700, marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p style={{ fontSize: 14, color: P.gray400 }}>Your teams are below. Create a new one or join with an invite code.</p>
        </div>

        {/* Teams */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${P.redMid}`, borderTopColor: P.red, animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
          </div>
        ) : teams.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 2 }}>YOUR TEAMS</p>
            {teams.map(({ role, teams: team }) => (
              <div key={team.id} onClick={() => navigate(`/team/${team.id}`)}
                style={{ background: P.white, borderRadius: 16, padding: "18px 20px", border: `1px solid ${P.gray100}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = P.redMid; e.currentTarget.style.boxShadow = "0 4px 16px rgba(230,0,35,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = P.gray100; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: P.redLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={20} color={P.red} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: P.gray700 }}>{team.name}</p>
                  <p style={{ fontSize: 12, color: P.gray400, marginTop: 2 }}>
                    {role === "admin" ? "👑 Admin" : "Member"} · Code: <strong>{team.invite_code}</strong>
                  </p>
                </div>
                <ArrowRight size={16} color={P.gray400} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: P.white, borderRadius: 16, padding: 32, textAlign: "center", border: `1px solid ${P.gray100}`, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: P.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Users size={24} color={P.red} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: P.gray700, marginBottom: 8 }}>No teams yet</p>
            <p style={{ fontSize: 13, color: P.gray400 }}>Create your first team or join one with an invite code.</p>
          </div>
        )}

        {/* Create team */}
        <button onClick={() => navigate("/team/new")}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 0", borderRadius: 16, border: "none", background: P.red, color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(230,0,35,0.25)", marginBottom: 16, fontFamily: "inherit" }}>
          <Plus size={18} />Create New Team
        </button>

        {/* Join team */}
        <div style={{ background: P.white, borderRadius: 16, padding: 20, border: `1px solid ${P.gray100}` }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: P.gray700, marginBottom: 12 }}>Join a team</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
              onKeyPress={e => e.key === "Enter" && joinTeam()}
              placeholder="Enter invite code (e.g. ABC123)"
              style={{ ...inp, flex: 1, textTransform: "uppercase", letterSpacing: 1 }} />
            <button onClick={joinTeam} disabled={joining || !joinCode.trim()}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: joinCode.trim() ? P.red : P.gray100, color: joinCode.trim() ? "white" : P.gray400, fontWeight: 700, fontSize: 13, cursor: joinCode.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              {joining ? "..." : "Join"}
            </button>
          </div>
          {joinError && <p style={{ fontSize: 12, color: P.red, marginTop: 8 }}>{joinError}</p>}
        </div>
      </div>
    </div>
  );
}
