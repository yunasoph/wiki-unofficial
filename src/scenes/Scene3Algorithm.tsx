import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../constants";

const F = (s: number) => Math.round(s * 30);

// Scene 3 spans global 15.04s → 26.78s  (11.74 s = 352 frames)
// Local key moments:
//  "37 percent"  → VO at ~2.2 s local  → f≈66
//  "37% of your search" → ~4.94 s local → f≈148
//  "gather data" → ~8.22 s local        → f≈247

const BAR_W = 880;
const BAR_H = 52;
const BAR_X = (1080 - BAR_W) / 2;
const BAR_Y = 880;

// ── Ticker numbers racing up in background ──────────────────────────────────
const TICKER_SEEDS = [11, 23, 37, 41, 53, 67, 79, 83, 97];
const pr = (n: number) => (Math.sin(n * 127.1) * 43758.5) % 1;

export const Scene3Algorithm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const alpha = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // ── Big % number sweeps from 0 to 37 as VO says it ──────────────────────
  const bigNumP = interpolate(frame, [F(1.8), F(3.6)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const bigNum = Math.round(bigNumP * 37);

  const bigNumScale = spring({ fps, frame: Math.max(0, frame - F(1.8)), config: { damping: 14, stiffness: 140 } });

  // ── Progress bar fills to 37% ────────────────────────────────────────────
  const barFill = interpolate(frame, [F(1.8), F(4.5)], [0, 0.37], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── "CALIBRATION PHASE" label appears ───────────────────────────────────
  const labelAlpha = interpolate(frame, [F(3.6), F(4.4)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Vertical "37% MARK" rule line with pulsing glow ─────────────────────
  const ruleAlpha = interpolate(frame, [F(4.0), F(4.8)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const rulePulse = 0.7 + 0.3 * Math.sin(frame * 0.18);

  // ── Data bullets appear one by one after "gather data" ─────────────────
  const bullets = [
    { text: "What is a good score?", t: F(8.0) },
    { text: "What is the range of options?", t: F(8.8) },
    { text: "What does 'above average' look like?", t: F(9.6) },
  ];

  // ── Scatter dots inside calibration zone (animated) ─────────────────────
  const dotCount = 18;

  // ── Scene fade-out ────────────────────────────────────────────────────────
  const fadeOut = interpolate(frame, [F(11.3), F(11.74)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: alpha }}>
      {/* bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, #0c1128 0%, #080810 80%)" }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 110, left: 0, right: 0, textAlign: "center",
        fontFamily: FONT, fontSize: 32, fontWeight: 700,
        color: "rgba(255,255,255,0.4)", letterSpacing: 6, textTransform: "uppercase",
      }}>
        The Algorithm
      </div>

      {/* ── Giant 37% number ── */}
      <div style={{
        position: "absolute", top: 220, left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "baseline", gap: 0,
        transform: `scale(${bigNumScale})`,
        transformOrigin: "center top",
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 230, fontWeight: 900,
          color: C.white,
          textShadow: `0 0 60px rgba(74,158,255,0.5), 0 0 120px rgba(74,158,255,0.2)`,
          lineHeight: 1,
        }}>{bigNum}</span>
        <span style={{
          fontFamily: FONT, fontSize: 110, fontWeight: 900,
          color: C.blue,
          textShadow: `0 0 40px ${C.blue}`,
          lineHeight: 1,
          paddingBottom: 20,
        }}>%</span>
      </div>

      {/* ── Subtitle beneath number ── */}
      <div style={{
        position: "absolute", top: 548, left: 0, right: 0, textAlign: "center",
        fontFamily: FONT, fontSize: 24, fontWeight: 600,
        color: "rgba(255,255,255,0.5)", letterSpacing: 2,
        opacity: interpolate(frame, [F(2.4), F(3.1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        The exact optimal threshold — proven by math
      </div>

      {/* ── Progress bar track ── */}
      <div style={{
        position: "absolute", left: BAR_X, top: BAR_Y,
        width: BAR_W, height: BAR_H,
        background: "rgba(255,255,255,0.06)",
        borderRadius: BAR_H / 2,
        border: "1.5px solid rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}>
        {/* Grey calibration fill */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${barFill * 100}%`,
          background: "linear-gradient(90deg, rgba(100,110,180,0.55) 0%, rgba(130,140,210,0.75) 100%)",
          borderRadius: BAR_H / 2,
          transition: "none",
          boxShadow: "2px 0 18px rgba(100,140,255,0.35)",
        }} />

        {/* Animated shimmer */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${barFill * 100}%`,
          background: `linear-gradient(90deg, transparent 60%, rgba(255,255,255,${0.08 + 0.06 * Math.sin(frame * 0.15)}) 80%, transparent 100%)`,
          borderRadius: BAR_H / 2,
        }} />
      </div>

      {/* ── "CALIBRATION PHASE" text inside bar ── */}
      <div style={{
        position: "absolute",
        left: BAR_X + 18,
        top: BAR_Y + (BAR_H - 22) / 2,
        opacity: labelAlpha,
        fontFamily: FONT, fontSize: 18, fontWeight: 800,
        color: "rgba(255,255,255,0.85)",
        letterSpacing: 3, textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        ◈ Calibration Phase
      </div>

      {/* ── 37% tick mark + vertical rule ── */}
      <div style={{
        position: "absolute",
        left: BAR_X + BAR_W * 0.37 - 1.5,
        top: BAR_Y - 60,
        width: 3,
        height: BAR_H + 120,
        background: C.cyan,
        opacity: ruleAlpha * rulePulse,
        boxShadow: `0 0 18px ${C.cyan}`,
        borderRadius: 2,
      }} />
      <div style={{
        position: "absolute",
        left: BAR_X + BAR_W * 0.37 - 28,
        top: BAR_Y - 88,
        opacity: ruleAlpha,
        fontFamily: FONT, fontSize: 19, fontWeight: 900,
        color: C.cyan,
        textShadow: `0 0 12px ${C.cyan}`,
        letterSpacing: 1,
      }}>
        37% MARK
      </div>

      {/* ── "0%" and "100%" labels ── */}
      <div style={{
        position: "absolute", left: BAR_X, top: BAR_Y + BAR_H + 16,
        fontFamily: FONT, fontSize: 18, color: "rgba(255,255,255,0.35)", fontWeight: 600,
      }}>0%</div>
      <div style={{
        position: "absolute", left: BAR_X + BAR_W - 36, top: BAR_Y + BAR_H + 16,
        fontFamily: FONT, fontSize: 18, color: "rgba(255,255,255,0.35)", fontWeight: 600,
      }}>100%</div>

      {/* ── Floating scatter dots inside calibration area ── */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: dotCount }).map((_, i) => {
          const xRatio = pr(i * 17.3 + 5.1) * 0.35;
          const cx = BAR_X + xRatio * BAR_W;
          const cy = BAR_Y + BAR_H + 60 + pr(i * 23.7 + 2.8) * 260;
          const dotAlpha = interpolate(frame, [F(4.0) + i * 3, F(5.0) + i * 3], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const float = Math.sin(frame * 0.04 + i * 1.3) * 5;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy + float} r={5} fill={C.blue}
                opacity={dotAlpha * 0.7} />
              <circle cx={cx} cy={cy + float} r={9} fill={C.blue}
                opacity={dotAlpha * 0.2} />
            </g>
          );
        })}
      </svg>

      {/* ── Data bullet points ── */}
      <div style={{ position: "absolute", top: 1080, left: 80, right: 80 }}>
        {bullets.map((b, i) => {
          const bAlpha = interpolate(frame, [b.t, b.t + F(0.5)], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const bX = interpolate(frame, [b.t, b.t + F(0.4)], [30, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{
              opacity: bAlpha,
              transform: `translateX(${bX}px)`,
              display: "flex", alignItems: "center", gap: 16,
              marginBottom: 24,
              fontFamily: FONT, fontSize: 25, fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
            }}>
              <span style={{ color: C.blue, fontSize: 20, flexShrink: 0 }}>▶</span>
              {b.text}
            </div>
          );
        })}
      </div>

      {/* Fade to next scene */}
      <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: fadeOut, pointerEvents: "none" }} />
    </div>
  );
};
