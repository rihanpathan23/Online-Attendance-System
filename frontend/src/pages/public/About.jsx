import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  BadgeCheck,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Heart,
} from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import { C } from "../../theme";

const steps = [
  {
    icon: Building2,
    title: "Select department and class",
    text: "Choose the department you belong to and the year you are studying in.",
  },
  {
    icon: ClipboardList,
    title: "Submit student details",
    text: "Enter your full name, roll number and mobile number to request access.",
  },
  {
    icon: BadgeCheck,
    title: "Get approved and view attendance",
    text: "After an administrator approves your request, you can view your attendance.",
  },
];

function About() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <PublicLayout>
      <section
        aria-labelledby="about-title"
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }}
      >
        <div
          className="ae-container"
          style={{ padding: "clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px)", textAlign: "center" }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", color: C.indigo }}>
            ABOUT
          </p>
          <h1 id="about-title" style={{ margin: "14px 0", fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1 }}>
            About AttendEase
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 640, fontSize: 18, color: C.muted, lineHeight: 1.7 }}>
            AttendEase is an online attendance system for colleges. Students request access with their details,
            and administrators review requests and manage class records, so attendance stays organised and easy
            to find.
          </p>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-title"
        style={{ background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, scrollMarginTop: 72 }}
      >
        <div className="ae-container" style={{ padding: "clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px)" }}>
          <h2 id="how-title" style={{ margin: 0, fontSize: "clamp(26px, 4vw, 36px)", textAlign: "center" }}>
            How it works
          </h2>
          <p style={{ textAlign: "center", color: C.muted, margin: "12px auto 40px", maxWidth: 520, lineHeight: 1.6 }}>
            Three quick steps from request to attendance.
          </p>
          <ol className="ae-grid-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="ae-card" style={{ padding: 28, background: C.bg }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
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
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.indigo }}>Step {i + 1}</span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h3>
                <p style={{ margin: 0, color: C.muted, lineHeight: 1.6 }}>{text}</p>
              </li>
            ))}
          </ol>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link to="/departments" className="ae-btn ae-btn-primary ae-btn-lg">
              Get Started
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="who-title">
        <div className="ae-container" style={{ padding: "clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px)" }}>
          <h2 id="who-title" style={{ margin: "0 0 28px", fontSize: "clamp(26px, 4vw, 36px)", textAlign: "center" }}>
            Built for students and staff
          </h2>
          <div className="ae-grid-2">
            <article className="ae-card" style={{ padding: 28 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo }}>
                <GraduationCap size={24} aria-hidden="true" />
              </span>
              <h3 style={{ margin: "16px 0 8px", fontSize: 20 }}>For students</h3>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.7 }}>
                Register in a few simple steps and view your attendance after approval, without paperwork or
                queues.
              </p>
            </article>
            <article className="ae-card" style={{ padding: 28 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo }}>
                <ShieldCheck size={24} aria-hidden="true" />
              </span>
              <h3 style={{ margin: "16px 0 8px", fontSize: 20 }}>For administrators</h3>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.7 }}>
                Review registration requests, manage students class by class, and download attendance reports
                as PDF.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="about-me"
        aria-labelledby="creator-title"
        style={{ background: "#fff", borderTop: `1px solid ${C.border}`, scrollMarginTop: 72 }}
      >
        <div className="ae-container" style={{ padding: "clamp(40px, 7vw, 80px) clamp(16px, 5vw, 32px)" }}>
          <div
            className="ae-card"
            style={{
              maxWidth: 760,
              margin: "0 auto",
              padding: "clamp(24px, 5vw, 40px)",
              display: "flex",
              gap: 24,
              alignItems: "center",
              flexWrap: "wrap",
              boxShadow: "0 20px 50px rgba(15,23,42,.08)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(135deg, ${C.indigo}, #3b82f6)`,
                color: "#fff",
                fontSize: 30,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              AS
            </span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: C.indigo }}>
                <Heart size={14} aria-hidden="true" /> ABOUT THE CREATOR
              </p>
              <h2 id="creator-title" style={{ margin: "8px 0 4px", fontSize: 26 }}>
                Made by Alfiya Shaikh
              </h2>
              <p style={{ margin: "0 0 10px", fontWeight: 600, color: C.muted }}>K.J. Somaiya College</p>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.7 }}>
                AttendEase was designed and built to make college attendance simpler, clearer and faster for
                both students and administrators.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default About;