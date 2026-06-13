"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  name: string;
  accentColor: string;
  cardBg: string;
}

export default function VideoPlayer({ src, name, accentColor, cardBg }: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only load video when it scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  if (!src) return null;

  return (
    <>
      <div ref={containerRef} className="relative rounded-xl overflow-hidden" style={{ background: cardBg, minHeight: "120px" }}>
        {!isVisible ? (
          // Placeholder while not in view
          <div className="w-full aspect-video rounded-xl flex items-center justify-center" style={{ background: cardBg }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-40" style={{ background: accentColor }}>
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={src}
              loop
              muted
              playsInline
              preload="none"
              className="w-full aspect-video object-cover rounded-xl"
              onClick={togglePlay}
              onLoadedMetadata={() => setHasLoaded(true)}
            />
            {!hasLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: accentColor + "40", borderTopColor: accentColor }} />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && hasLoaded && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center opacity-90"
                  style={{ background: accentColor }}
                >
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)" }}
              title="Fullscreen"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="px-3 py-1 rounded-lg text-xs font-medium text-white"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
            </div>
          </>
        )}
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-full max-w-2xl px-4">
            <p className="text-white text-center mb-3 font-semibold text-lg">{name}</p>
            <video
              src={src}
              loop
              controls
              autoPlay
              playsInline
              className="w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
