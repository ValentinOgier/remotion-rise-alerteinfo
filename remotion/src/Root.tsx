import { Composition } from "remotion";
import { RiseNews } from "./components/RiseNews";
import { NewsSchema } from "./schema";
import React from "react";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RiseNews"
        component={RiseNews}
        durationInFrames={600}
        fps={60}
        width={2160}
        height={3840}
        schema={NewsSchema}
        defaultProps={{
          title: "",
          content: "",
          highlightedContent: [],
          source: "",
          showSource: true,
          subtitle: "",
          showSubtitle: false,
          contentDescription: "",
          showContentDescription: true,
          backgroundImage: "",
          isBackgroundImageUrl: false,
          accentColor: "#000000",
          boxColor: "#FFFFFF",
          textColor: "#000000",
        }}
      />
    </>
  );
};
