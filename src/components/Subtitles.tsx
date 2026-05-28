import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../constants";

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  text: string;
  start: number;
  end: number;
}

interface SubtitlesProps {
  frame: number;
  fps: number;
  words: Word[];
  segments: Segment[];
}

export const Subtitles: React.FC<SubtitlesProps> = ({
  frame,
  fps,
  words,
  segments,
}) => {
  const currentTime = frame / fps;

  // Find the active segment (with a small look-ahead so first words appear instantly)
  const activeSegment = segments.find(
    (s) => currentTime >= s.start - 0.05 && currentTime <= s.end + 0.4
  );

  if (!activeSegment) return null;

  // Words that belong to this segment time range
  const segWords = words.filter(
    (w) =>
      w.start >= activeSegment.start - 0.08 &&
      w.end <= activeSegment.end + 0.15
  );

  if (segWords.length === 0) return null;

  // Fade the segment in/out
  const opacity = interpolate(
    currentTime,
    [
      activeSegment.start - 0.05,
      activeSegment.start + 0.12,
      activeSegment.end + 0.05,
      activeSegment.end + 0.38,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 36,
        right: 36,
        opacity,
        zIndex: 200,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(4,4,18,0.65)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          padding: "18px 26px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 10px",
        }}
      >
        {segWords.map((w, i) => {
          const isActive = currentTime >= w.start && currentTime <= w.end + 0.05;
          const isPast = currentTime > w.end + 0.05;

          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontSize: isActive ? 40 : 36,
                fontWeight: isActive ? 900 : 600,
                display: "inline-block",
                color: isActive
                  ? "#FFD700"
                  : isPast
                  ? "rgba(255,255,255,0.55)"
                  : "rgba(255,255,255,0.92)",
                textShadow: isActive
                  ? "0 0 22px rgba(255,215,0,0.7), 0 2px 8px rgba(0,0,0,0.9)"
                  : "0 2px 6px rgba(0,0,0,0.8)",
                transform: isActive ? "scale(1.12)" : "scale(1)",
                transformOrigin: "center bottom",
                lineHeight: 1.3,
                letterSpacing: -0.3,
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
