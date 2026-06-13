"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { ThemeColors } from "@/lib/themes";

interface Measurement {
  id: number;
  dateStr: string;
  waistInches: number;
}

interface Photo {
  id: number;
  dateStr: string;
  photoType: string;
  dataUrl: string;
}

interface ProgressScreenProps {
  colors: ThemeColors;
  onBack: () => void;
}

export default function ProgressScreen({ colors, onBack }: ProgressScreenProps) {
  const [tab, setTab] = useState<"measurements" | "photos">("measurements");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newWaist, setNewWaist] = useState("");
  const [photoType, setPhotoType] = useState("front");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/measurements"),
        fetch("/api/photos"),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();
      if (Array.isArray(mData)) setMeasurements(mData);
      if (Array.isArray(pData)) setPhotos(pData);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addMeasurement = async () => {
    const val = parseFloat(newWaist);
    if (isNaN(val) || val <= 0) return;
    const today = new Date().toISOString().split("T")[0];
    await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateStr: today, waistInches: val }),
    });
    setNewWaist("");
    loadData();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const today = new Date().toISOString().split("T")[0];
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateStr: today, photoType, dataUrl }),
      });
      loadData();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Simple chart
  const chartHeight = 150;
  const chartWidth = 300;
  const maxVal = Math.max(...measurements.map((m) => m.waistInches), 1);
  const minVal = Math.min(...measurements.map((m) => m.waistInches), 0);
  const range = maxVal - minVal || 1;

  const points = measurements.map((m, i) => {
    const x = measurements.length > 1 ? (i / (measurements.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((m.waistInches - minVal) / range) * (chartHeight - 20) - 10;
    return { x, y, m };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="min-h-screen pb-8" style={{ background: colors.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ background: colors.bg }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: colors.bgSecondary }}
        >
          <svg className="w-5 h-5" fill="none" stroke={colors.text} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: colors.text }}>
          📈 Progress
        </h1>
      </div>

      {/* Tabs */}
      <div className="mx-4 mb-4 flex rounded-2xl p-1" style={{ background: colors.bgSecondary }}>
        <button
          onClick={() => setTab("measurements")}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tab === "measurements" ? colors.card : "transparent",
            color: tab === "measurements" ? colors.text : colors.textSecondary,
          }}
        >
          📏 Measurements
        </button>
        <button
          onClick={() => setTab("photos")}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: tab === "photos" ? colors.card : "transparent",
            color: tab === "photos" ? colors.text : colors.textSecondary,
          }}
        >
          📸 Photos
        </button>
      </div>

      {tab === "measurements" && (
        <div className="px-4 space-y-4">
          {/* Add measurement */}
          <div className="p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
            <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
              Log Waist Measurement
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 28.5"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border"
                style={{
                  background: colors.bgSecondary,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                }}
              />
              <button
                onClick={addMeasurement}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: colors.accent }}
              >
                Add
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
              Measure every 2 weeks for best tracking
            </p>
          </div>

          {/* Chart */}
          {measurements.length > 0 && (
            <div className="p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                Waist Measurement Trend
              </p>
              <div className="overflow-x-auto">
                <svg width={chartWidth + 40} height={chartHeight + 30} className="mx-auto">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                    const y = chartHeight - pct * (chartHeight - 20) - 10;
                    const val = (minVal + pct * range).toFixed(1);
                    return (
                      <g key={pct}>
                        <line x1={35} y1={y} x2={chartWidth + 35} y2={y} stroke={colors.cardBorder} strokeWidth={0.5} />
                        <text x={0} y={y + 4} fill={colors.textSecondary} fontSize={9}>
                          {val}
                        </text>
                      </g>
                    );
                  })}
                  {/* Line */}
                  <g transform="translate(35, 0)">
                    <path d={linePath} fill="none" stroke={colors.accent} strokeWidth={2} />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r={4} fill={colors.accent} />
                        <text x={p.x} y={p.y - 8} fill={colors.text} fontSize={9} textAnchor="middle">
                          {p.m.waistInches}
                        </text>
                      </g>
                    ))}
                  </g>
                  {/* Date labels */}
                  <g transform="translate(35, 0)">
                    {points.map((p, i) => (
                      <text key={i} x={p.x} y={chartHeight + 20} fill={colors.textSecondary} fontSize={8} textAnchor="middle">
                        {p.m.dateStr.slice(5)}
                      </text>
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* History */}
          {measurements.length > 0 && (
            <div className="p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                History
              </p>
              <div className="space-y-2">
                {[...measurements].reverse().map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between py-2 px-3 rounded-xl"
                    style={{ background: colors.bgSecondary }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      {m.dateStr}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: colors.text }}>
                      {m.waistInches}&quot;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "photos" && (
        <div className="px-4 space-y-4">
          {/* Upload */}
          <div className="p-4 rounded-2xl" style={{ background: colors.card, border: `1px solid ${colors.cardBorder}` }}>
            <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
              Upload Progress Photo
            </p>
            <div className="flex gap-2 mb-3">
              {["front", "side", "back"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPhotoType(t)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background: photoType === t ? colors.accent : colors.bgSecondary,
                    color: photoType === t ? "#fff" : colors.text,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed transition-all"
              style={{ borderColor: colors.accent, color: colors.accent }}
            >
              📷 Take / Upload Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs mt-2 text-center" style={{ color: colors.textSecondary }}>
              📌 Take photos at Week 4, 8, and 12 for best comparison
            </p>
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="space-y-4">
              {["front", "side", "back"].map((type) => {
                const filtered = photos.filter((p) => p.photoType === type);
                if (filtered.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="text-sm font-semibold mb-2 capitalize" style={{ color: colors.text }}>
                      {type} View
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {filtered.map((p) => (
                        <div key={p.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.cardBorder}` }}>
                          <img
                            src={p.dataUrl}
                            alt={`${p.photoType} - ${p.dateStr}`}
                            className="w-full aspect-[3/4] object-cover"
                          />
                          <p className="text-center text-[10px] py-1" style={{ color: colors.textSecondary, background: colors.card }}>
                            {p.dateStr}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
