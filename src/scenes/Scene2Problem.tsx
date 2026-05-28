import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../constants";

// ─── Local frame timestamps ───────────────────────────────────────────────────
// Scene 2 starts at global 4.06 s. Inside this Sequence frame=0 → 4.06 s
// Key voice moments (relative to scene start):
//   "optimal stopping"  → ~1.66 s → f≈50   (4.06+1.66)
//   "paradox"           → ~5.42 s → f≈163  (4.06+5.42)
//   "commit too early"  → ~6.0 s  → f≈180
//   "explore too long"  → ~8.26 s → f≈248

const F = (s: number) => Math.round(s * 30);

const DOOR_W = 140;
const DOOR_H = 190;
const DOOR_GAP = 60;
const TOTAL_W = DOOR_W * 3 + DOOR_GAP * 2;
const DOORS_Y = 820;
const YOU_SIZE = 88;
const YOU_X = 540 - YOU_SIZE / 2;
const YOU_Y = 560;

const DOOR_VALUES = ["73", "41", "97"];
const DOOR_LABELS = ["Option A", "Option B", "Option C"];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene fade in
  const alpha = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── "You" square springs in
  const youIn = spring({ fps, frame, config: { damping: 16, stiffness: 200, mass: 0.8 } });
  const youScale = interpolate(youIn, [0, 1], [0.3, 1]);

  // ── Title appears
  const titleAlpha = interpolate(frame, [F(0.2), F(0.8)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── "OPTIMAL STOPPING" badge flashes in when VO says it
  const badgeAlpha = interpolate(frame, [F(1.3), F(2.0)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const badgeScale = interpolate(frame, [F(1.3), F(1.7)], [0.6, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Connector line from You to doors
  const lineP = interpolate(frame, [F(2.5), F(3.5)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Doors appear staggered
  const door0In = spring({ fps, frame: Math.max(0, frame - F(3.2)), config: { damping: 18, stiffness: 180 } });
  const door1In = spring({ fps, frame: Math.max(0, frame - F(3.6)), config: { damping: 18, stiffness: 180 } });
  const door2In = spring({ fps, frame: Math.max(0, frame - F(4.0)), config: { damping: 18, stiffness: 180 } });
  const doorSprings = [door0In, door1In, door2In];

  // ── Doors open sequentially (values revealed) after "paradox" at ~5.42 s
  const doorOpenProgress = [
    interpolate(frame, [F(5.4), F(6.0)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [F(5.9), F(6.5)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [F(6.4), F(7.0)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  ];

  // ── "You" square hesitation wiggle after doors open
  const wiggleStart = F(7.2);
  const wiggle =
    frame > wiggleStart
      ? Math.sin((frame - wiggleStart) * 0.55) * 11 * Math.max(0, 1 - (frame - wiggleStart) / 80)
      : 0;

  // ── NO-BACK arrow fades in
  const noBackAlpha = interpolate(frame, [F(6.8), F(7.5)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Bottom warning lines
  const warn1Alpha = interpolate(frame, [F(6.0), F(6.6)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const warn2Alpha = interpolate(frame, [F(8.3), F(8.9)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Scene fade-out
  const fadeOut = interpolate(frame, [F(10.6), F(10.98)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const doorsStartX = (1080 - TOTAL_W) / 2;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: alpha }}>
      {/* bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, #0b0e24 0%, #080810 80%)" }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 110, left: 0, right: 0, textAlign: "center",
        opacity: titleAlpha, fontFamily: FONT, fontSize: 32, fontWeight: 700,
        color: "rgba(255,255,255,0.45)", letterSpacing: 6, textTransform: "uppercase",
      }}>
        The Problem
      </div>

      {/* ── You square ── */}
      <div style={{
        position: "absolute",
        left: YOU_X + wiggle,
        top: YOU_Y,
        width: YOU_SIZE,
        height: YOU_SIZE,
        background: "transparent",
        border: `3px solid ${C.blue}`,
        borderRadius: 16,
        boxShadow: `0 0 28px ${C.blue}88`,
        transform: `scale(${youScale})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, fontSize: 19, fontWeight: 800, color: C.blue,
      }}>
        YOU
      </div>

      {/* ── Connector lines from You down to doors ── */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[0, 1, 2].map((di) => {
          const doorCX = doorsStartX + di * (DOOR_W + DOOR_GAP) + DOOR_W / 2;
          const fromX = 540;
          const fromY = YOU_Y + YOU_SIZE;
          const midY = fromY + 60;
          const toY = DOORS_Y;
          const dashLen = Math.hypot(doorCX - fromX, toY - midY) * lineP;
          return (
            <g key={di}>
              <line x1={fromX} y1={fromY} x2={fromX} y2={midY}
                stroke={C.blue} strokeWidth={2} opacity={lineP * 0.7} strokeDasharray="6 5" />
              <line x1={fromX} y1={midY} x2={doorCX} y2={midY}
                stroke={C.blue} strokeWidth={2} opacity={lineP * 0.7} strokeDasharray="6 5" />
              <line x1={doorCX} y1={midY} x2={doorCX} y2={toY}
                stroke={C.blue} strokeWidth={2} opacity={lineP * 0.7} strokeDasharray="6 5" />
            </g>
          );
        })}
      </svg>

      {/* ── Three doors ── */}
      {[0, 1, 2].map((di) => {
        const sp = doorSprings[di];
        const doorX = doorsStartX + di * (DOOR_W + DOOR_GAP);
        const openP = doorOpenProgress[di];
        const skew = openP * 35;

        return (
          <div key={di} style={{
            position: "absolute",
            left: doorX,
            top: DOORS_Y,
            width: DOOR_W,
            height: DOOR_H,
            transform: `scaleY(${sp})`,
            transformOrigin: "top center",
          }}>
            {/* Door frame */}
            <div style={{
              position: "absolute", inset: 0,
              border: `2px solid ${openP > 0 ? C.cyan : "rgba(150,170,255,0.55)"}`,
              borderRadius: 10,
              background: openP > 0
                ? `rgba(0,200,255,0.06)`
                : `rgba(20,25,60,0.8)`,
              overflow: "hidden",
              transition: "all 0.1s",
              boxShadow: openP > 0 ? `0 0 22px ${C.cyan}44` : "none",
            }}>
              {/* Door panel skew-open effect */}
              <div style={{
                position: "absolute", inset: 0,
                transform: `skewY(${-skew}deg) scaleX(${1 - openP * 0.5})`,
                transformOrigin: "top center",
                background: `rgba(15,18,45,0.9)`,
                borderRight: openP > 0 ? "none" : "none",
              }} />

              {/* Value revealed behind door */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                opacity: openP,
              }}>
                <div style={{
                  fontSize: 52, fontWeight: 900, fontFamily: FONT,
                  color: DOOR_VALUES[di] === "97" ? C.gold : C.white,
                  textShadow: DOOR_VALUES[di] === "97" ? `0 0 22px ${C.gold}` : "none",
                }}>
                  {DOOR_VALUES[di]}
                </div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", fontFamily: FONT, marginTop: 6 }}>
                  SCORE
                </div>
              </div>
            </div>

            {/* Label below door */}
            <div style={{
              position: "absolute", bottom: -32, left: 0, right: 0,
              textAlign: "center", fontFamily: FONT, fontSize: 18,
              color: "rgba(255,255,255,0.5)", fontWeight: 600,
              opacity: sp,
            }}>
              {DOOR_LABELS[di]}
            </div>
          </div>
        );
      })}

      {/* ── "OPTIMAL STOPPING" badge ── */}
      <div style={{
        position: "absolute", top: 1180, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeAlpha,
        transform: `scale(${badgeScale})`,
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1a1f4e 0%, #0d1030 100%)",
          border: `2px solid ${C.cyan}`,
          borderRadius: 14,
          padding: "14px 36px",
          boxShadow: `0 0 32px ${C.cyan}55`,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, letterSpacing: 4, color: C.cyan, textTransform: "uppercase" }}>
            Optimal Stopping
          </span>
        </div>
      </div>

      {/* ── No-back arrow ── */}
      <div style={{
        position: "absolute", top: 720, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: noBackAlpha,
      }}>
        <div style={{
          background: "rgba(255,51,51,0.12)",
          border: "1.5px solid rgba(255,51,51,0.55)",
          borderRadius: 10, padding: "8px 22px",
          fontFamily: FONT, fontSize: 19, fontWeight: 700,
          color: C.redSoft, letterSpacing: 2,
        }}>
          ← NO GOING BACK
        </div>
      </div>

      {/* ── Warning callouts ── */}
      <div style={{ position: "absolute", bottom: 280, left: 50, right: 50 }}>
        <div style={{
          opacity: warn1Alpha, marginBottom: 18,
          background: "rgba(255,80,60,0.10)", borderLeft: `3px solid ${C.redSoft}`,
          padding: "12px 20px", borderRadius: "0 10px 10px 0",
          fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.redSoft,
        }}>
          Commit too early → miss the best option
        </div>
        <div style={{
          opacity: warn2Alpha,
          background: "rgba(255,80,60,0.10)", borderLeft: `3px solid ${C.redSoft}`,
          padding: "12px 20px", borderRadius: "0 10px 10px 0",
          fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.redSoft,
        }}>
          Wait too long → all good options gone
        </div>
      </div>

      {/* Fade to next scene */}
      <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: fadeOut, pointerEvents: "none" }} />
    </div>
  );
};
