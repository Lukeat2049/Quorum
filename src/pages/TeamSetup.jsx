import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase.js";
import { ArrowLeft, Users } from "lucide-react";

const P = {
  red: "#e60023", redLight: "#ffeef0", redMid: "#ffccd2",
  gray100: "#f0f0f0", gray200: "#e0e0e0", gray400: "#888", gray700: "#222", white: "#fff",
};

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function TeamSetup() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const invite_code = generateCode();
      const { data: team, error: teamErr } = await supabase
        .from("teams")
        .insert({ name: teamName.trim(), invite_code, created_by: user.id })
        .select()
        .single();
      if (teamErr) throw teamErr;
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        user_name: user.firstName || user.emailAddresses[0].emailAddress.split("@")[0],
        user_email: user.emailAddresses[0].emailAddress,
        role: "admin",
      });
      navigate(`/team/${team.id}`);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setCreating(false);
    }
  }

  const inp = { padding: "12px 16px", border: `1.5px solid ${P.gray200}`, borderRadius: 12, fontSize: 15, outline: "none", background: P.white, color: P.gray700, fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: P.gray400, fontSize: 13, cursor: "pointer", fontWeight: 700, marginBottom: 32, fontFamily: "inherit" }}>
          <ArrowLeft size={16} />Back
        </button>
        <div style={{ background: P.white, borderRadius: 24, padding: 36, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: `1px solid ${P.gray100}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: P.redLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Users size={26} color={P.red} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, color: P.gray700, marginBottom: 8 }}>Create your team</h1>
          <p style={{ fontSize: 14, color: P.gray400, marginBottom: 28, lineHeight: 1.6 }}>
            Give your team a name. You'll get an invite code to share with your teammates.
          </p>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: P.gray400, letterSpacing: 1, marginBottom: 8 }}>TEAM NAME</label>
            <input
              autoFocus
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              onKeyPress={e => e.key === "Enter" && createTeam()}
              placeholder="e.g. Sales Team West, Pricing Pod..."
              style={inp}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: P.red, marginBottom: 16 }}>{error}</p>}
          <button onClick={createTeam} disabled={!teamName.trim() || creating}
            style={{ width: "100%", padding: "14px 0", borderRadius: 24, border: "none", background: teamName.trim() ? P.red : P.gray100, color: teamName.trim() ? "white" : P.gray400, fontWeight: 800, fontSize: 15, cursor: teamName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: teamName.trim() ? "0 4px 16px rgba(230,0,35,0.25)" : "none" }}>
            {creating ? "Creating..." : "Create Team"}
          </button>
          <p style={{ fontSize: 12, color: P.gray400, textAlign: "center", marginTop: 16 }}>You'll be the admin and can manage members.</p>
        </div>
      </div>
    </div>
  );
}
