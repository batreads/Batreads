"use client";

import Image from "next/image";
import { useEffect, useState, type RefObject } from "react";

export function CarouselControls({ track, trackId, itemCount, previousLabel, nextLabel }: {
  track: RefObject<HTMLElement | null>;
  trackId: string;
  itemCount: number;
  previousLabel: string;
  nextLabel: string;
}) {
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setPosition({
      previous: element.scrollLeft > 3,
      next: element.scrollLeft + element.clientWidth < element.scrollWidth - 3,
    });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [track, itemCount]);

  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * .8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <>
      <button type="button" aria-label={previousLabel} aria-controls={trackId}
        disabled={!position.previous} onClick={() => scroll(-1)}>
        <Image className="carousel-arrow-previous" src="/icons/mood-arrow.svg" alt="" width={20} height={20} />
      </button>
      <button type="button" aria-label={nextLabel} aria-controls={trackId}
        disabled={!position.next} onClick={() => scroll(1)}>
        <Image src="/icons/mood-arrow.svg" alt="" width={20} height={20} />
      </button>
    </>
  );
}
