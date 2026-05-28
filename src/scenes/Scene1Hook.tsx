import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT } from "../constants";

// ─── Grid config ──────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 10;
const DOT_SPACING = 68;
const DOT_R = 6;
const GRID_W = (COLS - 1) * DOT_SPACING; // 612
const GRID_H = (ROWS - 1) * DOT_SPACING; // 612
const GRID_X = (1080 - GRID_W) / 2;      // 234
const GRID_Y = (1920 - GRID_H) / 2 - 120; // ~534

// ─── Key timestamps → frames ──────────────────────────────────────────────────
// "reject" starts at 1.30s → frame 39
const REJECT_F = 39;
// "37" ends at 2.66s → frame 79  (line should complete sweep by then)
const SWEEP_END_F = 79;
// Shattering begins right as sweep ends
const SHATTER_START_F = SWEEP_END_F;

// ─── Deterministic pseudo-random ─────────────────────────────────────────────
const pr = (seed: number): number => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const dotStartPos = (i: number): [number, number] => [
  pr(i * 7.13 + 1.4) * 1080,
  pr(i * 13.77 + 3.1) * 1920,
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade-in
  const sceneAlpha = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Red sweep line progress (0→1 as line crosses screen)
  const sweepP = interpolate(frame, [REJECT_F, SWEEP_END_F], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineX = -20 + sweepP * 1120;
  const showLine = frame >= REJECT_F && sweepP < 1.15;

  // Red flash overlay during sweep
  const flashAlpha = interpolate(
    frame,
    [REJECT_F, REJECT_F + 5, SWEEP_END_F - 5, SWEEP_END_F + 8],
    [0, 0.14, 0.14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scene fade-out
  const fadeOut = interpolate(frame, [109, 121], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Build 100 dots ──────────────────────────────────────────────────────────
  const dotElements: React.ReactNode[] = [];

  for (let i = 0; i < 100; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const targetX = GRID_X + col * DOT_SPACING;
    const targetY = GRID_Y + row * DOT_SPACING;
    const isFirst37 = i < 37;

    // Staggered spring cascade
    const delay = col * 1.4 + row * 1.6;
    const progress = spring({
      fps,
      frame: Math.max(0, frame - delay),
      config: { damping: 14, stiffness: 190, mass: 0.85 },
    });

    const [sx, sy] = dotStartPos(i);
    const x = sx + (targetX - sx) * progress;
    const y = sy + (targetY - sy) * progress;

    // Shatter animation for first 37 dots
    let dotAlpha = progress;
    let dotScale = 1;
    let shatterP = 0;

    if (isFirst37 && frame >= SHATTER_START_F) {
      const shatterDelay = col * 1.0 + row * 1.0;
      const localF = Math.max(0, frame - SHATTER_START_F - shatterDelay);
      shatterP = interpolate(localF, [0, 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      dotAlpha = (1 - shatterP) * progress;
      dotScale = 1 - shatterP * 0.6;
    }

    // Dot color — first 37 warm red as they shatter, rest cool white
    const r = isFirst37 && shatterP > 0 ? 255 : 210;
    const g = isFirst37 && shatterP > 0 ? Math.floor(80 * (1 - shatterP)) : 225;
    const b = isFirst37 && shatterP > 0 ? 50 : 255;
    const dotColor = `rgba(${r},${g},${b},${dotAlpha})`;

    dotElements.push(
      <g key={i}>
        {/* Main dot */}
        <circle
          cx={x}
          cy={y}
          r={DOT_R * dotScale}
          fill={dotColor}
          filter="url(#dotGlow)"
        />

        {/* Particle burst when shattering */}
        {isFirst37 && shatterP > 0 && shatterP < 1 &&
          [0, 60, 120, 180, 240, 300].map((angleDeg, pi) => {
            const shatterDelay = col * 1.0 + row * 1.0;
            const localF = Math.max(0, frame - SHATTER_START_F - shatterDelay);
            const pP = interpolate(localF, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const rad = (angleDeg * Math.PI) / 180;
            const dist = pP * 52;
            const px = targetX + Math.cos(rad) * dist;
            const py = targetY + Math.sin(rad) * dist;
            return (
              <circle
                key={pi}
                cx={px}
                cy={py}
                r={(1 - pP) * 3.5}
                fill={C.redSoft}
                opacity={(1 - pP) * 0.85}
              />
            );
          })}
      </g>
    );
  }

  // "37" label that travels with the sweep line
  const showLabel = showLine && sweepP > 0.1 && sweepP < 0.92;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneAlpha }}>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, #0c1028 0%, #080810 75%)",
        }}
      />

      {/* Red flash overlay */}
      {flashAlpha > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: C.red,
            opacity: flashAlpha,
          }}
        />
      )}

      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="dotGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lineGlow" x="-200%" y="-5%" width="500%" height="110%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dots */}
        {dotElements}

        {/* Sweeping red line */}
        {showLine && (
          <line
            x1={lineX}
            y1={0}
            x2={lineX}
            y2={1920}
            stroke={C.red}
            strokeWidth={3}
            opacity={0.92}
            filter="url(#lineGlow)"
          />
        )}
      </svg>

      {/* "37%" label alongside line */}
      {showLabel && (
        <div
          style={{
            position: "absolute",
            top: GRID_Y - 64,
            left: lineX + 14,
            color: C.red,
            fontSize: 30,
            fontWeight: 900,
            fontFamily: FONT,
            textShadow: `0 0 14px ${C.red}`,
            pointerEvents: "none",
          }}
        >
          37%
        </div>
      )}

      {/* Fade-out to next scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.bg,
          opacity: fadeOut,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
