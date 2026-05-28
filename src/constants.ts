export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_DURATION_S = 42.74;

/** Convert seconds to frame number */
export const f = (seconds: number): number => Math.floor(seconds * FPS);

// ─── Scene boundaries (global frames) ───────────────────────────────────────
export const SCENE_1_FROM = 0;
export const SCENE_1_DUR = f(4.06);

export const SCENE_2_FROM = f(4.06);
export const SCENE_2_DUR = f(15.04 - 4.06);

export const SCENE_3_FROM = f(15.04);
export const SCENE_3_DUR = f(26.78 - 15.04);

export const SCENE_4_FROM = f(26.78);
export const SCENE_4_DUR = f(35.74 - 26.78);

export const SCENE_5_FROM = f(35.74);
export const SCENE_5_DUR = f(42.74 - 35.74) + 60; // extra buffer for loop

// ─── Color palette ───────────────────────────────────────────────────────────
export const C = {
  bg: "#080810",
  white: "#FFFFFF",
  dimWhite: "rgba(220,230,255,0.85)",
  blue: "#4A9EFF",
  cyan: "#00D4FF",
  red: "#FF3333",
  redSoft: "#FF6644",
  grey: "rgba(100,100,160,0.75)",
  green: "#00FF88",
  gold: "#FFD700",
  goldGlow: "rgba(255,215,0,0.6)",
};

// ─── Shared font stack ───────────────────────────────────────────────────────
export const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
