export const C = {
  navy: "#0f172a",
  text: "#1e293b",
  muted: "#64748b",
  indigo: "#4f46e5",
  indigoDark: "#4338ca",
  indigoSoft: "#eef2ff",
  border: "#e2e8f0",
  bg: "#f8fafc",
  green: "#047857",
  greenSoft: "#ecfdf5",
  red: "#b91c1c",
  redSoft: "#fef2f2",
  amber: "#b45309",
  amberSoft: "#fffbeb",
};

export const FONT =
  "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const globalCss = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  .ae-root { font-family: ${FONT}; color: ${C.navy}; background: ${C.bg}; -webkit-font-smoothing: antialiased; line-height: 1.5; }
  .ae-root h1, .ae-root h2, .ae-root h3 { letter-spacing: -0.02em; }

  .ae-skip { position: absolute; left: -9999px; top: 8px; background: ${C.navy}; color: #fff; padding: 10px 16px; border-radius: 10px; z-index: 100; text-decoration: none; font-weight: 600; }
  .ae-skip:focus { left: 8px; }
  .ae-visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  .ae-container { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 5vw, 32px); }
  .ae-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
  .ae-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .ae-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .ae-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  .ae-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .ae-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: inherit; font-weight: 600; font-size: 15px; padding: 12px 22px; border-radius: 12px; border: 1.5px solid transparent; cursor: pointer; text-decoration: none; transition: transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; }
  .ae-btn:disabled { opacity: .55; cursor: not-allowed; }
  .ae-btn-primary { background: ${C.indigo}; color: #fff; box-shadow: 0 8px 20px rgba(79,70,229,.25); }
  .ae-btn-primary:hover:not(:disabled) { background: ${C.indigoDark}; transform: translateY(-1px); }
  .ae-btn-secondary { background: #fff; color: ${C.navy}; border-color: ${C.border}; }
  .ae-btn-secondary:hover:not(:disabled) { border-color: #c7d2fe; background: #f8faff; }
  .ae-btn-outline { background: #fff; color: ${C.indigo}; border-color: ${C.indigo}; }
  .ae-btn-outline:hover:not(:disabled) { background: ${C.indigoSoft}; }
  .ae-btn-success { background: ${C.greenSoft}; color: #065f46; border-color: #a7f3d0; }
  .ae-btn-success:hover:not(:disabled) { background: #d1fae5; }
  .ae-btn-danger { background: ${C.redSoft}; color: #991b1b; border-color: #fecaca; }
  .ae-btn-danger:hover:not(:disabled) { background: #fee2e2; }
  .ae-btn-danger-solid { background: ${C.red}; color: #fff; }
  .ae-btn-danger-solid:hover:not(:disabled) { background: #991b1b; }
  .ae-btn-success-solid { background: ${C.green}; color: #fff; }
  .ae-btn-success-solid:hover:not(:disabled) { background: #065f46; }
  .ae-btn-ghost { background: transparent; color: ${C.indigo}; padding: 8px 12px; }
  .ae-btn-ghost:hover:not(:disabled) { background: ${C.indigoSoft}; }
  .ae-btn-sm { padding: 7px 12px; font-size: 13px; border-radius: 10px; }
  .ae-btn-lg { padding: 15px 28px; font-size: 16px; }
  .ae-btn-block { width: 100%; }

  .ae-btn:focus-visible, .ae-link:focus-visible, .ae-input:focus-visible, .ae-choice:focus-visible, .ae-nav:focus-visible, .ae-navtop:focus-visible { outline: 3px solid #a5b4fc; outline-offset: 2px; }

  .ae-label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .ae-hint { margin: 6px 0 0; font-size: 13px; color: ${C.muted}; }
  .ae-error { margin: 6px 0 0; color: ${C.red}; font-size: 13px; display: flex; align-items: center; gap: 6px; }
  .ae-input { width: 100%; font: inherit; font-size: 16px; padding: 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; background: #fff; color: ${C.navy}; transition: border-color .15s ease; }
  .ae-input:focus { border-color: ${C.indigo}; }
  .ae-input[aria-invalid="true"] { border-color: ${C.red}; }
  .ae-input:disabled { background: #f1f5f9; cursor: not-allowed; }

  .ae-card { background: #fff; border: 1px solid ${C.border}; border-radius: 20px; box-shadow: 0 4px 14px rgba(15,23,42,.05); }

  .ae-choice { text-align: left; font: inherit; color: inherit; padding: 22px; border-radius: 20px; background: #fff; border: 2px solid ${C.border}; box-shadow: 0 4px 14px rgba(15,23,42,.05); cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease, background .15s ease; }
  .ae-choice:hover { transform: translateY(-2px); border-color: #c7d2fe; }
  .ae-choice[aria-pressed="true"] { background: ${C.indigoSoft}; border-color: ${C.indigo}; box-shadow: 0 10px 28px rgba(79,70,229,.18); }

  .ae-navtop { text-decoration: none; color: ${C.muted}; font-weight: 600; font-size: 15px; padding: 8px 12px; border-radius: 10px; }
  .ae-navtop:hover { color: ${C.navy}; background: ${C.indigoSoft}; }
  .ae-navtop.active { color: ${C.indigo}; background: ${C.indigoSoft}; }

  .ae-table-wrap { overflow-x: auto; }
  .ae-table { width: 100%; border-collapse: collapse; }
  .ae-table th { text-align: left; padding: 14px 16px; font-size: 12px; letter-spacing: .06em; color: ${C.muted}; background: ${C.bg}; border-bottom: 1px solid ${C.border}; white-space: nowrap; }
  .ae-table td { padding: 14px 16px; border-bottom: 1px solid ${C.border}; font-size: 14px; vertical-align: middle; }
  .ae-table tbody tr:hover { background: #f8faff; }
  .ae-table tbody tr:last-child td { border-bottom: none; }
  .ae-cards { display: none; }

  @keyframes ae-spin { to { transform: rotate(360deg); } }
  .ae-spin { animation: ae-spin .8s linear infinite; }

  @media (max-width: 860px) {
    .ae-hero { grid-template-columns: 1fr; gap: 36px; }
    .ae-grid-3 { grid-template-columns: 1fr; }
    .ae-grid-2 { grid-template-columns: 1fr; }
    .ae-table-wrap { display: none; }
    .ae-cards { display: grid; gap: 14px; }
  }
  @media (max-width: 640px) {
    .ae-two { grid-template-columns: 1fr; }
    .ae-hide-sm { display: none !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ae-btn, .ae-choice { transition: none; }
    .ae-btn:hover, .ae-choice:hover { transform: none !important; }
    .ae-spin { animation-duration: 2s; }
  }
`;