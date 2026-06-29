import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { BarChart3, TrendingUp, Info } from "lucide-react";

interface ChartDataPoint {
  time: string;
  pH: number;
  turbidity: number;
  temperature: number;
  producedVolume: number;
}

// Custom Tooltip for Water Quality parameters
const CustomQualityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
        <p className="font-bold border-b border-slate-800 pb-1 mb-1.5 text-slate-300">Waktu: {label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-mono font-bold text-slate-100">{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Water Production volume
const CustomVolumeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
        <p className="font-bold border-b border-slate-800 pb-1 mb-1.5 text-slate-300">Waktu: {label}</p>
        <p className="text-emerald-400 font-medium flex justify-between gap-4">
          <span>{payload[0].name}:</span>
          <span className="font-mono font-bold text-slate-100">
            {payload[0].value.toLocaleString("id-ID")} L
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HistoricalCharts() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");

  // Sample historical data representing realistic water parameters in a village water reactor
  const data24h: ChartDataPoint[] = [
    { time: "06:00", pH: 6.8, turbidity: 2.1, temperature: 24.5, producedVolume: 120 },
    { time: "08:00", pH: 7.0, turbidity: 1.8, temperature: 25.1, producedVolume: 240 },
    { time: "10:00", pH: 7.2, turbidity: 3.4, temperature: 26.2, producedVolume: 390 },
    { time: "12:00", pH: 7.1, turbidity: 4.8, temperature: 27.0, producedVolume: 560 },
    { time: "14:00", pH: 6.9, turbidity: 2.3, temperature: 27.5, producedVolume: 710 },
    { time: "16:00", pH: 7.0, turbidity: 1.5, temperature: 26.8, producedVolume: 880 },
    { time: "18:00", pH: 7.2, turbidity: 1.1, temperature: 25.4, producedVolume: 1040 },
    { time: "20:00", pH: 7.3, turbidity: 0.9, temperature: 24.9, producedVolume: 1190 },
    { time: "22:00", pH: 7.1, turbidity: 0.8, temperature: 24.2, producedVolume: 1310 },
    { time: "00:00", pH: 7.0, turbidity: 0.8, temperature: 23.8, producedVolume: 1420 },
    { time: "02:00", pH: 6.9, turbidity: 0.7, temperature: 23.5, producedVolume: 1510 },
    { time: "04:00", pH: 6.8, turbidity: 0.9, temperature: 23.9, producedVolume: 1610 },
  ];

  const data7d: ChartDataPoint[] = [
    { time: "Senin", pH: 7.1, turbidity: 1.2, temperature: 25.2, producedVolume: 1450 },
    { time: "Selasa", pH: 7.2, turbidity: 1.4, temperature: 24.8, producedVolume: 2900 },
    { time: "Rabu", pH: 6.8, turbidity: 4.1, temperature: 25.5, producedVolume: 4250 },
    { time: "Kamis", pH: 7.0, turbidity: 2.8, temperature: 26.1, producedVolume: 5800 },
    { time: "Jumat", pH: 7.4, turbidity: 1.1, temperature: 24.9, producedVolume: 7400 },
    { time: "Sabtu", pH: 7.1, turbidity: 0.9, temperature: 25.0, producedVolume: 8950 },
    { time: "Minggu", pH: 7.2, turbidity: 0.8, temperature: 25.3, producedVolume: 10500 },
  ];

  const data30d: ChartDataPoint[] = [
    { time: "Mgu 1", pH: 7.1, turbidity: 1.5, temperature: 25.1, producedVolume: 10200 },
    { time: "Mgu 2", pH: 6.9, turbidity: 2.4, temperature: 25.4, producedVolume: 21100 },
    { time: "Mgu 3", pH: 7.2, turbidity: 1.1, temperature: 25.0, producedVolume: 32500 },
    { time: "Mgu 4", pH: 7.0, turbidity: 0.9, temperature: 25.2, producedVolume: 44000 },
  ];

  const getActiveData = () => {
    switch (timeframe) {
      case "7d": return data7d;
      case "30d": return data30d;
      default: return data24h;
    }
  };

  const activeData = getActiveData();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="historical-analytics">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Rekam Jejak Kualitas Air Historis</h2>
            <p className="text-xs text-slate-500">Penyimpanan riwayat parameter sensor otomatis</p>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex gap-1.5 self-start sm:self-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTimeframe("24h")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeframe === "24h" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            24 Jam Terakhir
          </button>
          <button
            onClick={() => setTimeframe("7d")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeframe === "7d" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeframe("30d")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeframe === "30d" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Grid of Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: pH and Turbidity */}
        <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/40">
          <span className="text-xs font-bold text-slate-700 block mb-3">Tren pH & Kekeruhan (Turbidity)</span>
          <div className="h-[260px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTurbidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#2563eb' }} stroke="#3b82f6" domain={[5.5, 9.5]} width={30} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#d97706' }} stroke="#f59e0b" domain={[0, 6]} width={30} />
                <Tooltip content={<CustomQualityTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                {/* Reference Lines for safety */}
                <ReferenceLine yAxisId="left" y={6.5} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'pH Min (6.5)', fill: '#ef4444', fontSize: 9, position: 'insideBottomLeft', offset: 10 }} />
                <ReferenceLine yAxisId="left" y={8.5} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'pH Maks (8.5)', fill: '#ef4444', fontSize: 9, position: 'insideTopLeft', offset: 10 }} />
                <ReferenceLine yAxisId="right" y={5} stroke="#b45309" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Maks Keruh (5 NTU)', fill: '#b45309', fontSize: 9, position: 'insideTopRight', offset: 10 }} />

                <Area yAxisId="left" type="monotone" dataKey="pH" stroke="#2563eb" fillOpacity={1} fill="url(#colorPh)" name="Keasaman (pH)" strokeWidth={2.5} />
                <Area yAxisId="right" type="monotone" dataKey="turbidity" stroke="#d97706" fillOpacity={1} fill="url(#colorTurbidity)" name="Kekeruhan (NTU)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Clean Water Production Volume */}
        <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 block">Akumulasi Produksi Air Bersih (Purified)</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-sm px-1.5 py-0.5 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Naik Stabil
            </span>
          </div>
          <div className="h-[260px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10, fill: '#059669' }} stroke="#10b981" width={45} />
                <Tooltip content={<CustomVolumeTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="producedVolume" stroke="#10b981" fillOpacity={1} fill="url(#colorVolume)" name="Volume Air Bersih (Liter)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Info panel */}
      <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <p>
          Grafik di atas merekam fluktuasi parameter kualitas air dari modul sensor analog ESP32. Kenaikan drastis kekeruhan pada hari Rabu disebabkan oleh intensitas hujan tinggi di hulu sungai air baku desa.
        </p>
      </div>
    </div>
  );
}
