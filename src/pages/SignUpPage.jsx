import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e60023", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={21} height={26} viewBox="0 0 22 28" fill="none">
            <path d="M11 2C6.03 2 2 6.03 2 11c0 3.87 2.34 7.19 5.7 8.67-.08-.7-.15-1.77.03-2.53.16-.68 1.08-4.58 1.08-4.58s-.28-.55-.28-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.97-.77 3.07-.22.92.46 1.66 1.36 1.66 1.63 0 2.73-2.09 2.73-4.56 0-1.88-1.27-3.29-3.57-3.29-2.6 0-4.22 1.94-4.22 4.1 0 .74.21 1.27.55 1.67.15.18.17.25.11.46-.04.15-.13.5-.17.64-.05.21-.2.28-.38.2C5.7 13.7 4.8 12.1 4.8 10.2c0-2.93 2.48-6.44 7.41-6.44 3.96 0 6.57 2.88 6.57 5.97 0 4.1-2.27 7.17-5.6 7.17-1.12 0-2.18-.6-2.54-1.28l-.7 2.7c-.22.85-.69 1.7-1.1 2.37.83.25 1.7.39 2.6.39 4.97 0 9-4.03 9-9S15.97 2 11 2z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#222", fontFamily: "'DM Serif Display', serif" }}>Quorum</span>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: { width: "100%", maxWidth: 400 },
            card: { borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" },
            headerTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 24 },
            formButtonPrimary: { background: "#e60023", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, borderRadius: 24 },
            footerActionLink: { color: "#e60023" },
          }
        }}
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}
