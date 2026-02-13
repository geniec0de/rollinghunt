import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Theme-aligned favicon: "rolling" dice dots + accent, premium and clean. */
export default function Icon() {
  const primary = "#02080f";
  const paper = "#ffffff";
  const accent = "#b91c1c";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: primary,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dice "3" diagonal = rolling; center dot in accent = launch/hunt */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 20,
            height: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: paper,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: paper,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
