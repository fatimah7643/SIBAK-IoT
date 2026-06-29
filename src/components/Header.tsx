import React from "react";
import { Droplet, Cpu, Wifi, ShieldAlert, CheckCircle2, AlertTriangle, Battery } from "lucide-react";

interface HeaderProps {
  espOnline: boolean;
  activeAlertsCount: number;
  totalWaterProduced: number;
  averagepH: number;
  averageTurbidity: number;
}

export default function Header({
  espOnline,
  activeAlertsCount,
  totalWaterProduced,
  averagepH,
  averageTurbidity,
}: HeaderProps) {
  // Calculate quality index based on pH and turbidity
  const getQualityIndex = () => {
    let score = 100;
    if (averagepH < 6.5 || averagepH > 8.5) score -= 30;
    else score -= Math.abs(7.0 - averagepH) * 10; // Dev from neutral

    if (averageTurbidity > 5) score -= Math.min(40, (averageTurbidity - 5) * 5);
    else score -= averageTurbidity * 4;

    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const score = getQualityIndex();
  const getScoreStatus = (s: number) => {
    if (s >= 85) return { label: "Sangat Baik", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (s >= 70) return { label: "Baik", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (s >= 50) return { label: "Kurang Baik", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "Buruk / Butuh Pemeliharaan", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const statusInfo = getScoreStatus(score);

  return (
    <header className="mb-6" id="app-header">
      {/* Top Banner with Branding and Realtime status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <Droplet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                IoT Eco-System Desa Sungai Bakung
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                SIBAK - Sistem Iot Bersih Air Bakung
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Sistem Pemantauan IoT & Filtrasi Multi-Layer Air Bersih Mandiri Desa Cerdas.
          </p>
        </div>

        {/* ESP32 Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span>ESP32 Microcontroller:</span>
            {espOnline ? (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                ONLINE
              </span>
            ) : (
              <span className="font-medium text-rose-500">OFFLINE</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Wifi className={`w-4 h-4 ${espOnline ? "text-blue-500 animate-pulse" : "text-slate-400"}`} />
            <span>-58 dBm (Kuat)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Battery className="w-4 h-4 text-emerald-500" />
            <span>94% (Grid-Solar Power)</span>
          </div>
        </div>
      </div>

      {/* Main KPI Quickstats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4" id="kpi-cards">
        {/* Card 1: Water Quality Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Index Kualitas Air (WQI)
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{score}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Water Volume Produced */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Air Bersih Mandiri
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalWaterProduced.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-slate-400 text-sm">Liter</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 inline" />
            Suplai terus menerus ke RT 01-RT 05
          </p>
        </div>

        {/* Card 3: Rata-rata Kekeruhan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Rata-Rata Kekeruhan
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {averageTurbidity.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">NTU</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Standar Permenkes RI: <strong className="text-slate-700">&lt; 5.0 NTU</strong>
          </p>
        </div>

        {/* Card 4: Active Warnings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Peringatan Sistem
            </span>
            <ShieldAlert className={`w-4 h-4 ${activeAlertsCount > 0 ? "text-rose-500 animate-bounce" : "text-slate-400"}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {activeAlertsCount}
            </span>
            <span className="text-slate-400 text-sm">Aktif</span>
          </div>
          {activeAlertsCount > 0 ? (
            <p className="text-xs text-rose-500 font-semibold mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 inline animate-pulse" />
              Butuh perhatian teknisi air desa!
            </p>
          ) : (
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" />
              Sistem berjalan aman & stabil
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
