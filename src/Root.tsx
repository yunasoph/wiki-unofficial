import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, WIDTH, HEIGHT, SCENE_5_FROM, SCENE_5_DUR } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OptimalStopping"
      component={Video}
      durationInFrames={SCENE_5_FROM + SCENE_5_DUR}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
