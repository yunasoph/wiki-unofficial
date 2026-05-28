import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  SCENE_1_FROM, SCENE_1_DUR,
  SCENE_2_FROM, SCENE_2_DUR,
  SCENE_3_FROM, SCENE_3_DUR,
  SCENE_4_FROM, SCENE_4_DUR,
  SCENE_5_FROM, SCENE_5_DUR,
  FPS, C, FONT,
} from "./constants";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Algorithm } from "./scenes/Scene3Algorithm";
import { Scene4Strike } from "./scenes/Scene4Strike";
import { Scene5Outro } from "./scenes/Scene5Outro";
import { Subtitles } from "./components/Subtitles";
import timestampData from "./timestamps.json";

export const Video: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: C.bg,
        overflow: "hidden",
        position: "relative",
        fontFamily: FONT,
      }}
    >
      {/* ── Audio ───────────────────────────────────────────────── */}
      {/* Drop voiceover.mp3 and bg-music.mp3 into /public */}
      <Audio src={staticFile("voiceover.mp3")} />
      <Audio src={staticFile("background_music.mp3")} volume={0.14} />

      {/* ── Scenes ──────────────────────────────────────────────── */}
      <Sequence from={SCENE_1_FROM} durationInFrames={SCENE_1_DUR}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={SCENE_2_FROM} durationInFrames={SCENE_2_DUR}>
        <Scene2Problem />
      </Sequence>

      <Sequence from={SCENE_3_FROM} durationInFrames={SCENE_3_DUR}>
        <Scene3Algorithm />
      </Sequence>

      <Sequence from={SCENE_4_FROM} durationInFrames={SCENE_4_DUR}>
        <Scene4Strike />
      </Sequence>

      <Sequence from={SCENE_5_FROM} durationInFrames={SCENE_5_DUR}>
        <Scene5Outro />
      </Sequence>

      {/* ── Word-synced subtitles (always on top) ───────────────── */}
      <Subtitles
        frame={frame}
        fps={FPS}
        words={timestampData.words}
        segments={timestampData.segments}
      />
    </div>
  );
};
