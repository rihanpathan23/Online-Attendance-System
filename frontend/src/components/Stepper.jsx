import { Check } from "lucide-react";
import { C } from "../theme";

const STEPS = ["Department", "Class", "Student Details"];

export default function Stepper({ current }) {
  return (
    <nav aria-label="Registration progress" style={{ marginBottom: 32 }}>
      <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: C.indigo }}>
        Step {current} of {STEPS.length}
      </p>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: n < STEPS.length ? 1 : "none",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: done || active ? C.indigo : "#e2e8f0",
                  color: done || active ? "#fff" : C.muted,
                  boxShadow: active ? "0 0 0 4px #e0e7ff" : "none",
                }}
              >
                {done ? <Check size={15} aria-hidden="true" /> : n}
              </span>
              <span
                className={active ? "" : "ae-hide-sm"}
                style={{
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? C.navy : C.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
                {done && <span className="ae-visually-hidden"> (completed)</span>}
              </span>
              {n < STEPS.length && (
                <span
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 12,
                    borderRadius: 2,
                    background: done ? C.indigo : "#e2e8f0",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}