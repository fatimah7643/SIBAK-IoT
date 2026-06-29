import React from "react";
import { WaterMetrics } from "../types";
import { Activity, AlertOctagon } from "lucide-react";

interface MetricsDashboardProps {
  metrics: WaterMetrics;
  onAdjustMetric: (key: keyof WaterMetrics, value: number) => void;
}

interface SensorWaveProps {
  status: "safe" | "warning" | "danger" | "flat";
  sensorId: string;
}

function SensorWave({ status, sensorId }: SensorWaveProps) {
  // Define colors based on status
  let colorHex = "#0284c7"; // Sky 600 (Water Blue)
  let duration = "4s";
  let amplitude = 5; // height variance
  let frequency = 25; // half wavelength
  
  if (status === "warning") {
    colorHex = "#d97706"; // Amber 600
    duration = "2s";
    amplitude = 9;
  } else if (status === "danger") {
    colorHex = "#e11d48"; // Rose 600
    duration = "1.2s";
    amplitude = 13;
  } else if (status === "flat") {
    colorHex = "#64748b"; // Slate 500
    duration = "10s"; // nearly stationary
    amplitude = 0; // flat line
  }

  const f = frequency;
  const a = amplitude;
  
  let path = "";
  if (status === "flat") {
    path = "M 0,20 L 600,20 L 600,40 L 0,40 Z";
  } else {
    // Generate wave path dynamically
    path = `M 0,20 Q ${f/2},${20 - a} ${f},20`;
    for (let x = f; x < 600; x += f) {
      path += ` T ${x + f},20`;
    }
    // Close the path for gradient fill
    path += ` L 600,40 L 0,40 Z`;
  }

  // Calculate translation distance for seamless animation
  const translateDistance = status === "flat" ? 0 : 2 * f;

  return (
    <div className="relative w-full h-11 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mt-2" id={`wave-${sensorId}`}>
      <style>{`
        @keyframes waveFlow-${sensorId} {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-${translateDistance}px, 0, 0);
          }
        }
        .animate-wave-${sensorId} {
          animation: waveFlow-${sensorId} ${duration} linear infinite;
        }
      `}</style>
      
      <svg className="absolute inset-y-0 left-0 h-full w-[150%]" viewBox="0 0 600 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${sensorId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorHex} stopOpacity="0.12" />
            <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        <g className={status !== "flat" ? `animate-wave-${sensorId}` : ""}>
          <path
            d={path}
            fill={`url(#grad-${sensorId})`}
            stroke={colorHex}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      
      {/* Decorative indicator dots */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200/60 shadow-xs backdrop-blur-xs">
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "flat" ? "bg-slate-400" :
          status === "danger" ? "bg-rose-500 animate-pulse" :
          status === "warning" ? "bg-amber-500 animate-pulse" : "bg-sky-500"
        }`} />
        <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider uppercase leading-none">
          {status === "flat" ? "Mati" : status === "danger" ? "Kritis" : status === "warning" ? "Peringatan" : "Normal"}
        </span>
      </div>
    </div>
  );
}

export default function MetricsDashboard({ metrics, onAdjustMetric }: MetricsDashboardProps) {
  
  // Helper to determine status and colors for pH
  const getPHStatus = (val: number) => {
    if (val < 6.5) return { text: "Asam (Abnormal)", color: "text-rose-500", border: "border-rose-200", bg: "bg-rose-50" };
    if (val > 8.5) return { text: "Basa (Abnormal)", color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" };
    return { text: "Netral (Normal / Aman)", color: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
  };

  // Helper to determine status and colors for Turbidity
  const getTurbidityStatus = (val: number) => {
    if (val > 5.0) return { text: "Keruh (Batas Terlampaui)", color: "text-rose-500", border: "border-rose-200", bg: "bg-rose-50" };
    if (val > 2.5) return { text: "Sedikit Keruh", color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" };
    return { text: "Jernih (Aman)", color: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
  };

  // Helper to determine status and colors for Temperature
  const getTempStatus = (val: number) => {
    if (val > 30.0) return { text: "Hangat", color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" };
    if (val < 15.0) return { text: "Dingin", color: "text-blue-500", border: "border-blue-200", bg: "bg-blue-50" };
    return { text: "Suhu Normal", color: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
  };

  // Helper to determine status and colors for Flow Rate
  const getFlowStatus = (val: number) => {
    if (val === 0) return { text: "Aliran Berhenti", color: "text-slate-500", border: "border-slate-200", bg: "bg-slate-50" };
    if (val > 18.0) return { text: "Aliran Terlalu Cepat", color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" };
    return { text: "Aliran Stabil", color: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
  };

  const phStyle = getPHStatus(metrics.pH);
  const turbStyle = getTurbidityStatus(metrics.turbidity);
  const tempStyle = getTempStatus(metrics.temperature);
  const flowStyle = getFlowStatus(metrics.flowRate);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs" id="sensor-telemetry">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Pembacaan Sensor IoT Terintegrasi</h2>
        </div>
        <span className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100 uppercase tracking-wide">
          Real-Time ESP32
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        Berikut adalah telemetry langsung dari modul sensor analog yang dihubungkan ke mikrokontroler ESP32 di lokasi reaktor filtrasi air desa. Gelombang bergerak di bawah mendemonstrasikan kestabilan sinyal real-time.
      </p>

      {/* Grid of Gauges/Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Sensor 1: pH */}
        <div className="border border-slate-100 rounded-md p-4 bg-slate-50/50 flex flex-col justify-between" id="sensor-ph-card">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sensor pH Air</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${phStyle.color} ${phStyle.bg} ${phStyle.border}`}>
                {phStyle.text}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.pH.toFixed(1)}</span>
              <span className="text-xs text-slate-400">pH</span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <SensorWave status={metrics.pH < 6.5 || metrics.pH > 8.5 ? "danger" : "safe"} sensorId="ph" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Batas Kemenkes: 6.5 - 8.5</span>
              <span>Ideal: 7.2 pH</span>
            </div>
          </div>
        </div>

        {/* Sensor 2: Turbidity */}
        <div className="border border-slate-100 rounded-md p-4 bg-slate-50/50 flex flex-col justify-between" id="sensor-turb-card">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sensor Kekeruhan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${turbStyle.color} ${turbStyle.bg} ${turbStyle.border}`}>
                {turbStyle.text}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.turbidity.toFixed(2)}</span>
              <span className="text-xs text-slate-400">NTU</span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <SensorWave status={metrics.turbidity > 5.0 ? "danger" : metrics.turbidity > 2.5 ? "warning" : "safe"} sensorId="turbidity" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Maksimum: 5.0 NTU</span>
              <span>Jernih: &lt; 1.0 NTU</span>
            </div>
          </div>
        </div>

        {/* Sensor 3: Suhu */}
        <div className="border border-slate-100 rounded-md p-4 bg-slate-50/50 flex flex-col justify-between" id="sensor-temp-card">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sensor Suhu Air</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${tempStyle.color} ${tempStyle.bg} ${tempStyle.border}`}>
                {tempStyle.text}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.temperature.toFixed(1)}</span>
              <span className="text-xs text-slate-400">°C</span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <SensorWave status={metrics.temperature < 15.0 || metrics.temperature > 30.0 ? "warning" : "safe"} sensorId="temperature" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Batas Aman: 15°C - 30°C</span>
              <span>Ideal: Suhu Ruang</span>
            </div>
          </div>
        </div>

        {/* Sensor 4: Flow Rate */}
        <div className="border border-slate-100 rounded-md p-4 bg-slate-50/50 flex flex-col justify-between" id="sensor-flow-card">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sensor Debit Aliran</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${flowStyle.color} ${flowStyle.bg} ${flowStyle.border}`}>
                {flowStyle.text}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.flowRate.toFixed(1)}</span>
              <span className="text-xs text-slate-400">L/min</span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <SensorWave status={metrics.flowRate === 0 ? "flat" : metrics.flowRate > 18.0 ? "warning" : "safe"} sensorId="flowrate" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Optimal: 10 - 15 L/min</span>
              <span>Maksimal: 25.0 L/min</span>
            </div>
          </div>
        </div>

      </div>

      {/* Safety Notice standard Kemenkes RI */}
      <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-900 leading-relaxed">
          <strong>Standar Air Bersih (Permenkes RI No 2 Tahun 2023):</strong> pH yang aman berkisar antara 6.5 hingga 8.5 dengan nilai Kekeruhan maksimum yang diizinkan sebesar 5.0 NTU. Jika pembacaan sensor melampaui rentang ini, solenoid outlet otomatis menutup guna menghentikan distribusi air tercemar ke masyarakat.
        </div>
      </div>
    </div>
  );
}
