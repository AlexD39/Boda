"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { GalleryImage } from "../lib/invitation-config";

type GalleryCarouselProps = {
  images: GalleryImage[];
  autoplay?: boolean;
  compact?: boolean;
};

export default function GalleryCarousel({ images, autoplay = true, compact = false }: GalleryCarouselProps) {
  const availableImages = images.filter((image) => image.url.trim());
  const [active, setActive] = useState(0);
  const current = availableImages.length ? active % availableImages.length : 0;

  useEffect(() => {
    if (!autoplay || availableImages.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % availableImages.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [autoplay, availableImages.length]);

  if (!availableImages.length) {
    return <div className={`carousel-frame carousel-empty ${compact ? "compact" : ""}`}><ImageIcon/><span>Agrega una foto para ver la galería</span></div>;
  }

  const previous = () => setActive((index) => (index - 1 + availableImages.length) % availableImages.length);
  const next = () => setActive((index) => (index + 1) % availableImages.length);

  return (
    <div className={`carousel-frame ${compact ? "compact" : ""}`} aria-roledescription="carrusel">
      <div className="carousel-slides">
        {availableImages.map((image, index) => (
          <figure className={index === current ? "active" : ""} key={`${image.url}-${index}`} aria-hidden={index !== current}>
            <img src={image.url} alt={image.caption || `Recuerdo ${index + 1}`} loading={index === 0 ? "eager" : "lazy"}/>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {availableImages.length > 1 && <>
        <button type="button" className="carousel-arrow previous" onClick={previous} aria-label="Foto anterior"><ChevronLeft/></button>
        <button type="button" className="carousel-arrow next" onClick={next} aria-label="Foto siguiente"><ChevronRight/></button>
      </>}
      <div className="carousel-dots" aria-label="Seleccionar fotografía">
        {availableImages.map((_, index) => <button type="button" key={index} onClick={() => setActive(index)} className={index === current ? "active" : ""} aria-label={`Ver foto ${index + 1}`} aria-current={index === current ? "true" : undefined}/>) }
      </div>
    </div>
  );
}
