import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const logoAsset = readFileSync(join(process.cwd(), "public", "aiyomi-logo-cropped.png"));
const logoSource = `data:image/png;base64,${logoAsset.toString("base64")}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7ee",
          borderRadius: 112,
          overflow: "hidden",
        }}
      >
        <img src={logoSource} width={440} height={482} style={{ objectFit: "contain" }} />
      </div>
    ),
    size,
  );
}
