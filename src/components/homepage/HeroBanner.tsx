"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { id: 1, image: "/homepage/baner/home.png",  label: "Living Room", tagline: "Where comfort meets design.", title: "Living Room" },
  { id: 2, image: "/homepage/baner/home2.png", label: "Bedroom",     tagline: "Rest in refined elegance.", title: "Bedroom"  },
  { id: 3, image: "/homepage/baner/home3.png", label: "Dining",      tagline: "Set the table for life.", title: "Dining Room"    },
  { id: 4, image: "/homepage/baner/home4.png", label: "Office",      tagline: "Craft your focus space.", title: "Home Office"    },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [tick, setTick] = useState(0);
  const autoRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isSwiping = useRef(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(index);
    setTick(t => t + 1);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 800);
  }, [animating, current]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) { 
      clearInterval(autoRef.current); 
      autoRef.current = null; 
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    autoRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
      setTick(t => t + 1);
    }, 5500);
  }, [stopAuto]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  const next = () => {
    if (animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent((current + 1) % slides.length);
    setTick(t => t + 1);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 800);
  };

  const back = () => {
    if (animating) return;
    setAnimating(true);
    setPrev(current);
    setCurrent((current - 1 + slides.length) % slides.length);
    setTick(t => t + 1);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 800);
  };

  const onStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    stopAuto();
    isSwiping.current = false;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x, y };
  }, [stopAuto]);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!startPos.current) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    if (Math.abs(x - startPos.current.x) > 10 && Math.abs(y - startPos.current.y) < 50) {
      isSwiping.current = true;
      e.preventDefault();
    }
  }, []);

  const onEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isSwiping.current) {
      const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const dist = startPos.current!.x - x;
      if (dist > 50) next();
      else if (dist < -50) back();
    }
    startAuto();
    startPos.current = null;
  }, [startAuto]);

  const slide = slides[current];

  return (
    <>
      <style>{`
        @keyframes slideReveal {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .slide-text-1 { animation: slideReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .slide-text-2 { animation: slideReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .slide-text-3 { animation: slideReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .slide-text-4 { animation: slideReveal 0.7s cubic-bezier(0.22,1,0.36,1) 0.42s both; }
        .slide-line   { animation: lineGrow  0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both; transform-origin: left; }
      `}</style>

      <section
        className="relative w-full h-[45vh] md:h-[82vh] min-h-[400px] md:min-h-[560px] overflow-hidden bg-neutral-900 select-none"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        style={{ touchAction: "pan-y" }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
              i === current ? "opacity-100 z-10"
              : i === prev  ? "opacity-0  z-[9]"
              :                "opacity-0  z-0"
            }`}
          >
            <img
              src={s.image}
              alt={s.label}
              className="w-full h-full object-cover object-center pointer-events-none"
              draggable={false}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />

        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 sm:px-12 lg:px-16 pt-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-light">Collection</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40 text-xs tracking-widest font-light tabular-nums">
            <span className="text-white/70 text-base font-extralight">0{current + 1}</span>
            <span className="text-white/25 mx-1">—</span>
            <span>0{slides.length}</span>
          </div>
        </div>

        <div key={tick} className="absolute inset-0 z-30 flex flex-col justify-center px-8 sm:px-12 lg:px-16 pb-8 pt-16">
          <div className="slide-line w-10 h-px bg-white/30 mb-6 origin-left" />

          <h2
            className="slide-text-2 font-extralight text-white leading-[1.1] mb-6"
            style={{
              fontFamily: "'Georgia', 'Palatino Linotype', serif",
              fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {slide.title}<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>
              Collection
            </span>
          </h2>

          <p className="slide-text-3 text-sm sm:text-base text-white/40 font-light tracking-wide mb-10 max-w-xs">
            {slide.tagline}
          </p>

          <div className="slide-text-4 flex items-center gap-6">
            <button className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/80 font-medium hover:text-white transition-colors duration-300">
              <span className="w-8 h-px bg-white/40 group-hover:w-12 transition-all duration-500 origin-left" />
              Explore Collection
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 z-30 flex items-center justify-between px-8 sm:px-12 lg:px-16">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  i === current
                    ? "w-6 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={back}
              aria-label="Previous"
              className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/90 transition-colors duration-300 border border-transparent hover:border-white/20 rounded-sm"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/90 transition-colors duration-300 border border-transparent hover:border-white/20 rounded-sm"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroBanner;