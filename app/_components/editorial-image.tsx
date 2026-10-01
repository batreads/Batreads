import Image from "next/image";
import { ViewportImage } from "./viewport-image";

export type EditorialImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

export function EditorialImage({
  src, alt, width, height, sizes, className, loading = "lazy", fetchPriority,
}: EditorialImageProps) {
  if (loading === "lazy") {
    return <ViewportImage src={src} alt={alt} width={width} height={height}
      sizes={sizes} className={className} fetchPriority={fetchPriority} />;
  }

  if (src.startsWith("/images/")) {
    return <Image src={src} alt={alt} width={width} height={height} sizes={sizes}
      className={className} loading={loading} fetchPriority={fetchPriority} />;
  }

  // Remote Notion URLs are displayed until the image is imported as a stable local asset.
  return <img src={src} alt={alt} width={width} height={height}
    className={className} loading={loading} decoding="async" fetchPriority={fetchPriority} />;
}
