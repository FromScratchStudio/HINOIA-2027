"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShowcaseItem } from "@/types";

interface ShowcaseCarouselProps {
  items: ShowcaseItem[];
}

export function ShowcaseCarousel({ items }: ShowcaseCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!items.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  const item = items[current];

  return (
    <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden group">
      {item.type === "video" ? (
        <video
          src={item.src}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          aria-label={item.alt}
        />
      ) : item.type === "gif" ? (
        // Use a plain <img> for GIFs to preserve animation (Next.js Image may strip it)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className="object-cover"
          priority={current === 0}
          sizes="100vw"
        />
      )}

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-2xl opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-2xl opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            ›
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
