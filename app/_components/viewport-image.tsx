"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { EditorialImageProps } from "./editorial-image";

const transparentPixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

export function ViewportImage({ src, alt, width, height, sizes, className, fetchPriority }: EditorialImageProps) {
  const placeholderRef = useRef<HTMLImageElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder || nearViewport) return;
    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    observer.observe(placeholder);
    return () => observer.disconnect();
  }, [nearViewport]);

  if (!nearViewport) {
    return <>
      <img ref={placeholderRef} src={transparentPixel} alt="" width={width} height={height} className={className} aria-hidden="true" />
      <noscript><img src={src} alt={alt} width={width} height={height} className={className} /></noscript>
    </>;
  }

  if (src.startsWith("/images/")) {
    return <Image src={src} alt={alt} width={width} height={height} sizes={sizes}
      className={className} loading="eager" fetchPriority={fetchPriority} />;
  }

  return <img src={src} alt={alt} width={width} height={height}
    className={className} loading="eager" decoding="async" fetchPriority={fetchPriority} />;
}
