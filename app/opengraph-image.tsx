import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Kemma Technologies — digital platforms, web products and business systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "design", "kemma-original.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#192338",
          color: "#f4f3ef",
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
            background: "rgba(240, 107, 80, 0.65)",
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
            background: "rgba(185, 200, 218, 0.15)",
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
            width={236}
            height={190}
            style={{ objectFit: "contain", objectPosition: "left center", marginLeft: -22 }}
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
              color: "#b9c8da",
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
              color: "#ff9277",
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
