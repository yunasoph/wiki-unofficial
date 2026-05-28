import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT } from "../constants";

// Scene 4: global 26.78 s → 35.74 s  (8.96 s = ~269 frames)
// Key local moments:
//  "37% mark, rule changes" → ~2.56 s local → f≈77
//  scanner activates        → ~4.0 s         → f≈120
//  golden dot passes        → ~5.5 s         → f≈165
//  LOCK                     → ~5.8 s         → f≈174

const F = (s: number) => Math.round(s * 30);

const SCANNER_X = 540;
const SCANNER_Y_TOP = 300;
const SCANNER_Y_BOT = 1580;
const LANE_Y = 920;
const DOT_R = 13;
const DOT_SPACING = 90;
const DOT_COUNT = 18;

// dot index 0-6 are "calibration" (first 37%→ ≈7/18)
const CALIBRATION_END = 6;
// The golden dot is at index CALIBRATION_END + 1 = 7 (first past threshold)
const GOLDEN_INDEX = 7;

const pr = (n: number) => ((Math.sin(n * 127.1) * 43758.5) % 1 + 1) % 1;

export const Scene4Strike: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const alpha = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // ── Scanner beam blink ────────────────────────────────────────────────────
  const scannerOn = frame >= F(3.6);
  const scannerAlpha = scannerOn
    ? 0.55 + 0.3 * Math.sin(frame * 0.35)
    : 0;
  const scannerGreen = frame >= F(5.5);

  // ── Dots conveyor belt ────────────────────────────────────────────────────
  // Each dot starts far right and moves left at constant speed
  // Speed: ~180px/s → 6px/frame
  const SPEED = 5.5;
  const START_DELAY_PER_DOT = 18; // frames between each dot entering

  // Lock state — when golden dot hits scanner
  const lockF = F(5.75);
  const isLocked = frame >= lockF;

  const lockScale = spring({
    fps, frame: Math.max(0, frame - lockF),
    config: { damping: 10, stiffness: 280, mass: 0.6 },
  });
  const lockX = isLocked ? SCANNER_X : undefined;
  const lockY = isLocked ? LANE_Y : undefined;

  // ── "RULE CHANGES" flash ─────────────────────────────────────────────────
  const ruleFlashAlpha = interpolate(frame, [F(2.56), F(3.0)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ruleFlashFade = interpolate(frame, [F(4.0), F(4.8)], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── "YOU STRIKE" text ────────────────────────────────────────────────────
  const strikeAlpha = interpolate(frame, [lockF + 10, lockF + 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const strikeScale = spring({
    fps, frame: Math.max(0, frame - lockF - 6),
    config: { damping: 12, stiffness: 200 },
  });

  // ── Lock ring expand ─────────────────────────────────────────────────────
  const lockRingR = isLocked ? 40 + (1 - lockScale) * 120 : 0;
  const lockRingAlpha = isLocked ? lockScale * 0.7 : 0;

  // ── "YOU DO NOT WAIT" label ──────────────────────────────────────────────
  const waitAlpha = interpolate(frame, [F(6.4), F(6.9)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Scene fade-out ────────────────────────────────────────────────────────
  const fadeOut = interpolate(frame, [F(8.55), F(8.96)], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Build dot positions ───────────────────────────────────────────────────
  const dots: React.ReactNode[] = [];

  for (let i = 0; i < DOT_COUNT; i++) {
    // Each dot enters at a staggered time
    const enterFrame = i * START_DELAY_PER_DOT;
    if (frame < enterFrame) continue;

    const travel = (frame - enterFrame) * SPEED;
    // Start right of screen, move left
    const rawX = 1200 - travel;

    const isCalibration = i <= CALIBRATION_END;
    const isGolden = i === GOLDEN_INDEX;
    const isBeyond = i > GOLDEN_INDEX;

    // If this is the golden dot and locked, freeze it at scanner
    let cx = rawX;
    let cy = LANE_Y;

    if (isGolden && isLocked && rawX <= SCANNER_X + 10) {
      cx = SCANNER_X;
      cy = LANE_Y;
    }

    // Skip if moved off left edge (not golden)
    if (!isGolden && rawX < -40) continue;
    // Skip if beyond lock for non-golden post-threshold dots (they freeze off-screen)
    if (isBeyond && isLocked) continue;

    const r = isGolden
      ? DOT_R * 1.9
      : isCalibration
      ? DOT_R
      : DOT_R * 1.1;

    const baseColor = isGolden
      ? C.gold
      : isCalibration
      ? "rgba(180,190,255,0.7)"
      : C.white;

    // Calibration dots fade out as they pass scanner
    const passedScanner = rawX < SCANNER_X - 20;
    const dotAlpha = isCalibration && passedScanner
      ? interpolate(rawX, [SCANNER_X - 20, SCANNER_X - 90], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;

    const pulse = isGolden
      ? 0.8 + 0.2 * Math.sin(frame * 0.25)
      : 1;

    dots.push(
      <g key={i}>
        {/* Glow halo */}
        <circle cx={cx} cy={cy} r={r * 2.2}
          fill={baseColor}
          opacity={isGolden ? 0.18 * pulse : 0.07}
          style={{ filter: "blur(6px)" }}
        />
        {/* Main dot */}
        <circle cx={cx} cy={cy} r={r}
          fill={baseColor}
          opacity={dotAlpha}
        />
        {/* Lock ring burst when golden is caught */}
        {isGolden && isLocked && (
          <circle cx={SCANNER_X} cy={LANE_Y} r={lockRingR}
            fill="none"
            stroke={C.gold}
            strokeWidth={3}
            opacity={lockRingAlpha}
          />
        )}
        {/* Number label on dot */}
        {(isGolden || isCalibration) && !isBeyond && (
          <text x={cx} y={cy + r * 0.38}
            textAnchor="middle"
            fontSize={isGolden ? 15 : 11}
            fontFamily={FONT}
            fontWeight="900"
            fill={isGolden ? "#1a1000" : "rgba(255,255,255,0.55)"}
          >
            {isGolden ? "★" : (i + 1)}
          </text>
        )}
      </g>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, opacity: alpha }}>
      {/* bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, #080f1c 0%, #080810 80%)" }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 110, left: 0, right: 0, textAlign: "center",
        fontFamily: FONT, fontSize: 32, fontWeight: 700,
        color: "rgba(255,255,255,0.4)", letterSpacing: 6, textTransform: "uppercase",
      }}>
        The Strike
      </div>

      {/* ── "RULE CHANGES" flash text ── */}
      <div style={{
        position: "absolute", top: 200, left: 0, right: 0, textAlign: "center",
        opacity: ruleFlashAlpha * ruleFlashFade,
        fontFamily: FONT, fontSize: 44, fontWeight: 900,
        color: C.cyan,
        textShadow: `0 0 30px ${C.cyan}`,
        letterSpacing: 3,
      }}>
        RULE CHANGES
      </div>

      {/* ── Lane line ── */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="scanGlow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Lane track */}
        <line x1={40} y1={LANE_Y} x2={1040} y2={LANE_Y}
          stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeDasharray="10 8" />

        {/* "Calibration" zone shading */}
        <rect x={40} y={LANE_Y - 45} width={SCANNER_X - 60} height={90}
          fill="rgba(100,110,200,0.06)" rx={8} />
        <text x={160} y={LANE_Y - 52} textAnchor="middle"
          fontFamily={FONT} fontSize={16} fontWeight={700}
          fill="rgba(150,160,255,0.5)" letterSpacing={3}>
          CALIBRATION ZONE
        </text>

        {/* Scanner vertical beam */}
        <line
          x1={SCANNER_X} y1={SCANNER_Y_TOP}
          x2={SCANNER_X} y2={SCANNER_Y_BOT}
          stroke={scannerGreen ? C.green : C.cyan}
          strokeWidth={2.5}
          opacity={scannerAlpha}
          filter="url(#scanGlow)"
        />
        {/* Scanner triangle markers */}
        <polygon
          points={`${SCANNER_X - 16},${SCANNER_Y_TOP + 10} ${SCANNER_X + 16},${SCANNER_Y_TOP + 10} ${SCANNER_X},${SCANNER_Y_TOP + 35}`}
          fill={scannerGreen ? C.green : C.cyan}
          opacity={scannerAlpha}
          filter="url(#scanGlow)"
        />
        <polygon
          points={`${SCANNER_X - 16},${SCANNER_Y_BOT - 10} ${SCANNER_X + 16},${SCANNER_Y_BOT - 10} ${SCANNER_X},${SCANNER_Y_BOT - 35}`}
          fill={scannerGreen ? C.green : C.cyan}
          opacity={scannerAlpha}
          filter="url(#scanGlow)"
        />

        {/* "37% MARK" label on scanner */}
        <text x={SCANNER_X + 14} y={LANE_Y - 58}
          fontFamily={FONT} fontSize={18} fontWeight={800}
          fill={C.cyan} opacity={scannerOn ? 0.9 : 0}>
          37% MARK
        </text>

        {/* ── Dots ── */}
        {dots}

        {/* ── Lock bracket around golden dot ── */}
        {isLocked && (
          <g filter="url(#goldGlow)" opacity={lockScale}>
            {/* Bracket TL */}
            <polyline points={`${SCANNER_X - 42},${LANE_Y - 40} ${SCANNER_X - 42},${LANE_Y - 52} ${SCANNER_X - 30},${LANE_Y - 52}`}
              fill="none" stroke={C.gold} strokeWidth={3} />
            {/* Bracket TR */}
            <polyline points={`${SCANNER_X + 42},${LANE_Y - 40} ${SCANNER_X + 42},${LANE_Y - 52} ${SCANNER_X + 30},${LANE_Y - 52}`}
              fill="none" stroke={C.gold} strokeWidth={3} />
            {/* Bracket BL */}
            <polyline points={`${SCANNER_X - 42},${LANE_Y + 40} ${SCANNER_X - 42},${LANE_Y + 52} ${SCANNER_X - 30},${LANE_Y + 52}`}
              fill="none" stroke={C.gold} strokeWidth={3} />
            {/* Bracket BR */}
            <polyline points={`${SCANNER_X + 42},${LANE_Y + 40} ${SCANNER_X + 42},${LANE_Y + 52} ${SCANNER_X + 30},${LANE_Y + 52}`}
              fill="none" stroke={C.gold} strokeWidth={3} />
          </g>
        )}
      </svg>

      {/* ── LOCKED / STRIKE text ── */}
      {isLocked && (
        <div style={{
          position: "absolute",
          top: LANE_Y + 80,
          left: 0, right: 0,
          textAlign: "center",
          opacity: strikeAlpha,
          transform: `scale(${strikeScale})`,
          transformOrigin: "center top",
        }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #2a1a00, #1a1000)",
            border: `2px solid ${C.gold}`,
            borderRadius: 14,
            padding: "14px 48px",
            boxShadow: `0 0 40px ${C.goldGlow}`,
          }}>
            <span style={{
              fontFamily: FONT, fontSize: 38, fontWeight: 900,
              color: C.gold,
              textShadow: `0 0 20px ${C.gold}`,
              letterSpacing: 4,
            }}>
              ⚡ LOCKED IN
            </span>
          </div>
        </div>
      )}

      {/* ── "YOU DO NOT WAIT. YOU STRIKE." ── */}
      <div style={{
        position: "absolute", bottom: 300, left: 50, right: 50,
        opacity: waitAlpha,
        textAlign: "center",
        fontFamily: FONT, fontSize: 34, fontWeight: 900,
        color: C.white,
        lineHeight: 1.4,
        textShadow: "0 2px 12px rgba(0,0,0,0.9)",
      }}>
        You do not wait.<br />
        <span style={{ color: C.gold, textShadow: `0 0 16px ${C.gold}` }}>You strike.</span>
      </div>

      {/* Fade to next scene */}
      <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: fadeOut, pointerEvents: "none" }} />
    </div>
  );
};
