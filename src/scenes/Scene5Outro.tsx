import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { C, FONT } from "../constants";

// Scene 5: global 35.74 s → end (~42.74 s) = 7 s = 210 frames
// Local key moments:
//   "guarantee"        → ~0.42 s  → f≈13
//   "mathematically"   → ~1.96 s  → f≈59
//   "success"          → ~4.38 s  → f≈131
//   "subscribe"        → ~4.5 s   → f≈135  (we show this after "success")
//   "holding out"      → ~5.1 s   → f≈153
//   loop back          → ~7.0 s   → f≈210

const F = (s: number) => Math.round(s * 30);

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene fade-in ─────────────────────────────────────────────────────────
  const alpha = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  // ── Crown logo springs in ─────────────────────────────────────────────────
  const crownSpring = spring({
    fps, frame,
    config: { damping: 14, stiffness: 130, mass: 1.1 },
  });
  const crownScale = interpolate(crownSpring, [0, 1], [0.4, 1]);
  const crownAlpha = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Crown halo pulse
  const haloR = 165 + 10 * Math.sin(frame * 0.12);
  const haloAlpha = 0.22 + 0.08 * Math.sin(frame * 0.12);

  // ── "highest probability of success" text slides in ──────────────────────
  const statAlpha = interpolate(frame, [F(1.5), F(2.2)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const statY = interpolate(frame, [F(1.5), F(2.2)], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── "doesn't guarantee perfect" and "mathematically guarantees" ──────────
  const line1Alpha = interpolate(frame, [F(0.3), F(1.0)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const line2Alpha = interpolate(frame, [F(1.96), F(2.6)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Subscribe card slides up ──────────────────────────────────────────────
  const subCardFrom = F(4.3);
  const subCardAlpha = interpolate(frame, [subCardFrom, subCardFrom + 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subCardY = interpolate(frame, [subCardFrom, subCardFrom + 18], [60, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── "holding out for perfection..." text ─────────────────────────────────
  const holdAlpha = interpolate(frame, [F(5.1), F(5.7)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Loop-back flash (white flash → cuts back to scene 1) ─────────────────
  const loopFlashAlpha = interpolate(frame, [F(6.6), F(7.0), F(7.2)], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Animated background particles ────────────────────────────────────────
  const pr = (n: number) => ((Math.sin(n * 127.1) * 43758.5) % 1 + 1) % 1;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: alpha }}>
      {/* Radial gradient bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 45%, #0e1030 0%, #080810 70%)",
      }} />

      {/* Floating ambient particles */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const cx = pr(i * 17.1) * 1080;
          const cy = pr(i * 23.4) * 1920;
          const drift = Math.sin(frame * 0.018 + i * 1.4) * 18;
          const pAlpha = 0.08 + 0.04 * Math.sin(frame * 0.06 + i);
          return (
            <circle key={i}
              cx={cx} cy={cy + drift} r={2 + pr(i * 7.3) * 3}
              fill={C.gold} opacity={pAlpha}
            />
          );
        })}
      </svg>

      {/* ── Crown logo + glow ── */}
      <div style={{
        position: "absolute", top: 340, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: crownAlpha,
        transform: `scale(${crownScale})`,
        transformOrigin: "center center",
      }}>
        <div style={{ position: "relative", width: 220, height: 220 }}>
          {/* Glow halo */}
          <svg width={220} height={220} style={{ position: "absolute", inset: 0 }}>
            <circle cx={110} cy={110} r={haloR * 0.67}
              fill={C.goldGlow}
              opacity={haloAlpha}
              style={{ filter: "blur(22px)" }}
            />
            <circle cx={110} cy={110} r={80}
              fill="none"
              stroke={C.gold}
              strokeWidth={1.5}
              opacity={0.3 + 0.1 * Math.sin(frame * 0.14)}
            />
          </svg>
          {/* Crown image */}
          <Img
            src={staticFile("crown-logo.png")}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain",
              filter: `drop-shadow(0 0 22px ${C.gold}) drop-shadow(0 0 50px rgba(255,215,0,0.3))`,
            }}
          />
        </div>
      </div>

      {/* ── Copy lines ── */}
      <div style={{ position: "absolute", top: 600, left: 60, right: 60 }}>
        <div style={{
          opacity: line1Alpha, marginBottom: 18,
          textAlign: "center",
          fontFamily: FONT, fontSize: 24, fontWeight: 600,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.5,
        }}>
          It doesn't guarantee a perfect outcome...
        </div>
        <div style={{
          opacity: line2Alpha,
          textAlign: "center",
          fontFamily: FONT, fontSize: 28, fontWeight: 800,
          color: C.white,
          lineHeight: 1.4,
        }}>
          But it{" "}
          <span style={{ color: C.gold, textShadow: `0 0 16px ${C.goldGlow}` }}>
            mathematically guarantees
          </span>
          <br />the highest probability of success.
        </div>
      </div>

      {/* ── Subscribe card ── */}
      <div style={{
        position: "absolute", bottom: 260, left: 50, right: 50,
        opacity: subCardAlpha,
        transform: `translateY(${subCardY}px)`,
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1a1f50 0%, #0e1138 100%)",
          border: `2px solid ${C.cyan}`,
          borderRadius: 20,
          padding: "28px 36px",
          boxShadow: `0 0 40px rgba(0,212,255,0.22), 0 8px 32px rgba(0,0,0,0.6)`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 32, fontWeight: 900,
            color: C.white, marginBottom: 10, letterSpacing: 1,
          }}>
            Subscribe for more
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 22, fontWeight: 700,
            color: C.cyan,
            textShadow: `0 0 12px ${C.cyan}`,
            letterSpacing: 3, textTransform: "uppercase",
          }}>
            ✦ Visual Logic ✦
          </div>
        </div>
      </div>

      {/* ── "holding out for perfection..." ── */}
      <div style={{
        position: "absolute", bottom: 160, left: 0, right: 0,
        textAlign: "center",
        opacity: holdAlpha,
        fontFamily: FONT, fontSize: 26, fontWeight: 700,
        color: "rgba(255,255,255,0.6)",
        fontStyle: "italic",
      }}>
        So if you're holding out for perfection...
      </div>

      {/* ── Loop-back white flash ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#ffffff",
        opacity: loopFlashAlpha,
        pointerEvents: "none",
      }} />
    </div>
  );
};
