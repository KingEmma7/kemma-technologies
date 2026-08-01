import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Kemma Technologies — digital platforms, web products and business systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#040406",
          color: "#ffffff",
          padding: "62px 72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            right: -180,
            top: -250,
            borderRadius: 620,
            background: "rgba(0, 123, 148, 0.20)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            left: -220,
            bottom: -320,
            borderRadius: 520,
            background: "rgba(200, 155, 60, 0.18)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "relative",
          }}
        >
          <img
            src={`data:image/png;base64,${logo}`}
            alt=""
            width={292}
            height={219}
            style={{ objectFit: "contain", objectPosition: "left center", marginLeft: -34 }}
          />

          <div
            style={{
              display: "flex",
              maxWidth: 970,
              marginTop: 2,
              fontSize: 58,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            Digital platforms that move organisations forward.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 25,
              color: "#C8C8C8",
              letterSpacing: "0.2px",
            }}
          >
            Product engineering · Web applications · Business systems
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignItems: "center",
              color: "#C89B3C",
              fontSize: 20,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Accra · Building worldwide
          </div>
        </div>
      </div>
    ),
    size,
  );
}
