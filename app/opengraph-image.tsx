import { createHomeOpenGraphImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Batreads: tu próxima obsesión empieza aquí. Dark romance y romantasy";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const runtime = "nodejs";

export default function Image() {
  return createHomeOpenGraphImage();
}
