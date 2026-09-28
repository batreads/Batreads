import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OpenGraphTemplate, type OpenGraphTemplateProps } from "@/components/seo/OpenGraphTemplate";

export const OG_SIZE = { width: 1200, height: 630 };

function asDataUrl(bytes: Buffer, mime: string): string {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

const brandAssets = Promise.all([
  readFile(path.join(process.cwd(), "public/images/og-background.png")),
  readFile(path.join(process.cwd(), "public/images/og-logo.png")),
  readFile(path.join(process.cwd(), "public/fonts/LiberationSerif-Regular.ttf")),
  readFile(path.join(process.cwd(), "public/fonts/Geist-Regular.ttf")),
]).then(([background, logo, serifFont, sansFont]) => ({
  backgroundUrl: asDataUrl(background, "image/png"),
  logoUrl: asDataUrl(logo, "image/png"),
  serifFont,
  sansFont,
}));

async function getCoverDataUrl(coverUrl?: string | null): Promise<string | null> {
  if (!coverUrl) return null;

  try {
    let bytes: Buffer;
    if (coverUrl.startsWith("/images/") && !coverUrl.includes("..")) {
      const imagePath = path.resolve(process.cwd(), "public", `.${coverUrl}`);
      const imagesRoot = path.resolve(process.cwd(), "public/images");
      if (!imagePath.startsWith(`${imagesRoot}${path.sep}`)) return null;
      bytes = await readFile(imagePath);
    } else {
      const url = new URL(coverUrl);
      if (url.protocol !== "https:") return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } });
      const mime = response.headers.get("content-type")?.split(";")[0];
      if (!response.ok || !mime?.startsWith("image/")) return null;
      bytes = Buffer.from(await response.arrayBuffer());
    }

    if (bytes.length > 5_000_000) return null;
    // ImageResponse does not decode WebP reliably; normalize every cover first.
    return asDataUrl(await sharp(bytes).resize({ width: 700, withoutEnlargement: true }).png().toBuffer(), "image/png");
  } catch {
    return null;
  }
}

export async function createOpenGraphImage(props: Omit<OpenGraphTemplateProps, "backgroundUrl" | "logoUrl"> = {}): Promise<ImageResponse> {
  const [assets, coverUrl] = await Promise.all([brandAssets, getCoverDataUrl(props.coverUrl)]);
  return new ImageResponse(
    <OpenGraphTemplate {...props} backgroundUrl={assets.backgroundUrl} logoUrl={assets.logoUrl} coverUrl={coverUrl} />,
    { ...OG_SIZE, fonts: [
      { name: "Liberation Serif", data: assets.serifFont, weight: 400, style: "normal" },
      { name: "Geist", data: assets.sansFont, weight: 400, style: "normal" },
    ] },
  );
}
