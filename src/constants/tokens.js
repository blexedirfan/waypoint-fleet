/* ── Design tokens ─────────────────────────────────────────────────────────
   Static color palette + CSS-variable references resolved at runtime.
   Theme-variable values (paper, card, etc.) are set on <html> by App.jsx.
   ───────────────────────────────────────────────────────────────────────── */

export const C = {
  ink:           "#0B1220",
  inkSoft:       "#141C2E",
  inkBorder:     "#222C42",
  inkText:       "#9AA6BD",
  amber:         "#F2994A",
  amberDeep:     "#C96A1B",
  teal:          "#129B8E",
  indigo:        "#5B5FEF",
  emerald:       "#1FA971",
  amberWarn:     "#D98B0E",
  rose:          "#E5484D",
  /* Theme-variable colors — resolved via CSS custom properties at runtime */
  paper:         "var(--wp-paper)",
  card:          "var(--wp-card)",
  line:          "var(--wp-line)",
  text:          "var(--wp-text)",
  muted:         "var(--wp-muted)",
  slateSoft:     "var(--wp-slateSoft)",
  amberSoft:     "var(--wp-amberSoft)",
  tealSoft:      "var(--wp-tealSoft)",
  indigoSoft:    "var(--wp-indigoSoft)",
  emeraldSoft:   "var(--wp-emeraldSoft)",
  amberWarnSoft: "var(--wp-amberWarnSoft)",
  roseSoft:      "var(--wp-roseSoft)",
};

export const LIGHT_THEME = {
  paper: "#F3F5FA", card: "#FFFFFF", line: "#E7E9F2",
  text: "#10131A", muted: "#6B7280", slateSoft: "#EEF0F5",
  amberSoft: "#FCE8D6", tealSoft: "#D8F2EE", indigoSoft: "#E6E6FC",
  emeraldSoft: "#DBF5E7", amberWarnSoft: "#FCEFD3", roseSoft: "#FBE2E3",
  rowHover: "#F8F9FC",
};

export const DARK_THEME = {
  paper: "#0D1117", card: "#161B22", line: "#30363D",
  text: "#E6EDF3", muted: "#8B949E", slateSoft: "#1C2128",
  amberSoft: "#2D1B0E", tealSoft: "#0D201E", indigoSoft: "#16163A",
  emeraldSoft: "#0D2116", amberWarnSoft: "#2A1A06", roseSoft: "#2A0D0F",
  rowHover: "#1C2128",
};

/* Global font imports + keyframe animations injected as a <style> tag */
export const FONT_FACE = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

.wp-display { font-family: 'Space Grotesk', sans-serif; }
.wp-body { font-family: 'Inter', sans-serif; }
.wp-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }

@keyframes wpPulseRing {
  0% { transform: scale(0.75); opacity: 0.65; }
  70% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
}
@keyframes wpFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wpFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wpDash {
  to { stroke-dashoffset: -60; }
}
@keyframes wpGlow {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
@keyframes wpFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes wpSweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.wp-anim-up { animation: wpFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.wp-anim-in { animation: wpFadeIn 0.4s ease both; }
.wp-float { animation: wpFloat 4.5s ease-in-out infinite; }
.wp-dash { stroke-dasharray: 6 6; animation: wpDash 1.4s linear infinite; }
.wp-glow { animation: wpGlow 2.2s ease-in-out infinite; }
.wp-sweep { animation: wpSweep 3.5s linear infinite; transform-origin: center; }

.wp-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.wp-scrollbar::-webkit-scrollbar-thumb { background: #D7DBE6; border-radius: 999px; }
.wp-scrollbar::-webkit-scrollbar-track { background: transparent; }

.wp-row-hover:hover { background-color: #F8F9FC; }

@keyframes wpShimmer {
  0% { background-position: -300% center; }
  100% { background-position: 300% center; }
}
.wp-shimmer-gold {
  background: linear-gradient(90deg, #F2994A, #FFD89B, #C96A1B, #FFD89B, #F2994A);
  background-size: 250% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: wpShimmer 4s linear infinite;
}

@keyframes wpPageIn {
  from { opacity: 0; transform: translateY(12px) scale(0.984); }
  to   { opacity: 1; transform: translateY(0)    scale(1);     }
}
.wp-page-in { animation: wpPageIn 0.52s cubic-bezier(0.16,1,0.3,1) both; }

.wp-lift { transition: transform 0.22s ease, box-shadow 0.22s ease; }
.wp-lift:hover { transform: translateY(-4px); box-shadow: 0 18px 44px -10px rgba(0,0,0,0.14); }

@keyframes wpGlowBorder {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 1; }
}
.wp-glow-border { animation: wpGlowBorder 3s ease-in-out infinite; }

@keyframes wpNeonPulse {
  0%, 100% { box-shadow: 0 0 8px var(--glow-c, #F2994A88), 0 0 24px var(--glow-c, #F2994A44); }
  50%       { box-shadow: 0 0 18px var(--glow-c, #F2994Aaa), 0 0 48px var(--glow-c, #F2994A66); }
}
@keyframes wpBorderFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes wpSlideRight {
  from { transform: translateX(-6px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes wpParticle {
  0%   { transform: translateY(0) scale(1);   opacity: 0.6; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}

.wp-glass {
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}

.wp-card-hover {
  transition: transform 0.26s cubic-bezier(0.16,1,0.3,1), box-shadow 0.26s ease, border-color 0.26s ease;
  cursor: pointer;
}
.wp-card-hover:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 24px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(242,153,74,0.18);
  border-color: rgba(242,153,74,0.28) !important;
}

.wp-btn-primary {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #F2994A, #C96A1B) !important;
  box-shadow: 0 4px 18px -4px rgba(242,153,74,0.45);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.wp-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px -6px rgba(242,153,74,0.65), 0 0 0 1px rgba(242,153,74,0.3);
  filter: brightness(1.08);
}
.wp-btn-primary:active { transform: scale(0.97) translateY(0); }
.wp-btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 55%);
  pointer-events: none;
}

.wp-btn-ghost {
  transition: all 0.18s ease;
}
.wp-btn-ghost:hover {
  background: rgba(242,153,74,0.08) !important;
  border-color: rgba(242,153,74,0.35) !important;
  color: #F2994A !important;
  box-shadow: 0 0 0 3px rgba(242,153,74,0.10);
  transform: translateY(-1px);
}
.wp-btn-ghost:active { transform: scale(0.97); }

.wp-nav-hover {
  transition: all 0.18s ease;
}
.wp-nav-hover:hover {
  background: rgba(242,153,74,0.10) !important;
  transform: translateX(3px);
  color: rgba(255,255,255,0.9) !important;
}

.wp-input-glow { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
.wp-input-glow:focus-within {
  border-color: rgba(242,153,74,0.5) !important;
  box-shadow: 0 0 0 3px rgba(242,153,74,0.12), 0 0 16px rgba(242,153,74,0.08) !important;
}

.wp-sidebar-shadow {
  box-shadow: 4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.04);
}

.wp-row-hover:hover {
  background: linear-gradient(90deg, rgba(242,153,74,0.07), var(--wp-rowHover)) !important;
}

.wp-badge-active  { box-shadow: 0 0 10px rgba(31,169,113,0.45),  0 0 28px rgba(31,169,113,0.18);  }
.wp-badge-warn    { box-shadow: 0 0 10px rgba(217,139,14,0.45),   0 0 28px rgba(217,139,14,0.18);  }
.wp-badge-muted   { box-shadow: 0 0 6px  rgba(107,114,128,0.3); }

.wp-grad-border {
  background: linear-gradient(var(--bg,#fff), var(--bg,#fff)) padding-box,
              linear-gradient(135deg, #F2994A, #129B8E, #5B5FEF, #F2994A) border-box;
  border: 1.5px solid transparent;
  background-size: 200% 200%;
  animation: wpBorderFlow 5s ease infinite;
}
`;
