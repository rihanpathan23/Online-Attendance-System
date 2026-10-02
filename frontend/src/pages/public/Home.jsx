import { Link } from "react-router-dom";
import {
  ArrowRight,
  UserPlus,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import { C } from "../../theme";
import { studentAuth } from "../../services/api";

const features = [
  {
    icon: UserPlus,
    title: "Quick registration",
    text: "Pick your department and class, enter your details, and send your request in a minute.",
  },
  {
    icon: ShieldCheck,
    title: "Verified access",
    text: "Every request is reviewed by an administrator, so only genuine students get access.",
  },
  {
    icon: BarChart3,
    title: "Clear attendance",
    text: "Once approved, see your attendance in one simple, easy-to-read place.",
  },
];

const highlights = [
  "No complicated sign-up forms",
  "Works on phone, tablet and laptop",
  "Your request goes straight to the admin",
];

function Home() {
  // Evaluate login status before returning JSX
  const loggedIn = studentAuth.isLoggedIn();

  return (
    <PublicLayout>
      <section
        aria-labelledby="hero-title"
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }}
      >
        <div className="ae-container" style={{ padding: "clamp(40px, 8vw, 96px) clamp(16px, 5vw, 32px)" }}>
          <div className="ae-hero">
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", color: C.indigo }}>
                SMART CAMPUS ATTENDANCE
              </p>
              <h1
                id="hero-title"
                style={{ margin: "16px 0", fontSize: "clamp(36px, 6vw, 58px)", lineHeight: 1.06, fontWeight: 800 }}
              >
                Your attendance, made simple.
              </h1>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: C.muted, maxWidth: 520 }}>
                Request access with your student details, and once your request is approved you can view your
                attendance anytime.
              </p>
              
              {/* Conditional CTA Block */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
                {loggedIn ? (
                  <Link to="/student/dashboard" className="ae-btn ae-btn-primary ae-btn-lg">
                    View My Attendance
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link to="/departments" className="ae-btn ae-btn-primary ae-btn-lg">
                      Get Started
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <Link to="/student/login" className="ae-btn ae-btn-secondary ae-btn-lg">
                      Student Login
                    </Link>
                  </>
                )}
                <Link to="/about#how-it-works" className="ae-btn ae-btn-secondary ae-btn-lg">
                  How it works
                </Link>
              </div>
            </div>

            <aside
              className="ae-card"
              aria-label="Why students like AttendEase"
              style={{ padding: 28, boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}
            >
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  background: C.indigoSoft,
                  color: C.indigo,
                }}
              >
                <Sparkles size={24} aria-hidden="true" />
              </span>
              <h2 style={{ margin: "16px 0 14px", fontSize: 22 }}>Simple from the first step</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
                {highlights.map((h) => (
                  <li key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontWeight: 600 }}>
                    <CheckCircle2 size={22} color={C.green} style={{ flexShrink: 0 }} aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-title" style={{ background: "#fff", borderTop: `1px solid ${C.border}` }}>
        <div className="ae-container" style={{ padding: "clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px)" }}>
          <h2 id="features-title" style={{ margin: 0, fontSize: "clamp(26px, 4vw, 36px)", textAlign: "center" }}>
            Everything you need
          </h2>
          <p style={{ textAlign: "center", color: C.muted, margin: "12px auto 40px", maxWidth: 520, lineHeight: 1.6 }}>
            A student portal designed to be fast, clear and easy to use.
          </p>
          <ul className="ae-grid-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="ae-card" style={{ padding: 28, background: C.bg }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    background: C.indigoSoft,
                    color: C.indigo,
                  }}
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 style={{ margin: "16px 0 8px", fontSize: 18 }}>{title}</h3>
                <p style={{ margin: 0, color: C.muted, lineHeight: 1.6 }}>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="cta-title">
        <div className="ae-container" style={{ padding: "clamp(40px, 7vw, 72px) clamp(16px, 5vw, 32px)" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${C.indigo}, #3b82f6)`,
              color: "#fff",
              borderRadius: 28,
              padding: "clamp(28px, 6vw, 56px)",
              textAlign: "center",
            }}
          >
            <h2 id="cta-title" style={{ margin: 0, fontSize: "clamp(24px, 4vw, 34px)" }}>
              Ready to get started?
            </h2>
            <p style={{ margin: "12px auto 24px", maxWidth: 480, opacity: 0.92, lineHeight: 1.6 }}>
              Choose your department and class to send your registration request.
            </p>
            <Link
              to="/departments"
              className="ae-btn ae-btn-lg"
              style={{ background: "#fff", color: C.indigo }}
            >
              Get Started
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default Home;