import { createOpenGraphImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Batreads: tu próxima lectura está aquí";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const runtime = "nodejs";

export default function Image() {
  return createOpenGraphImage({ description: "Encuentra tu próxima obsesión literaria" });
}
