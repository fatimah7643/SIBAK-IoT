import React, { useState } from "react";
import { Layers, Droplet, ArrowDown, HelpCircle, RefreshCw, Check, Info } from "lucide-react";
import { FilterStatus } from "../types";

interface FilterVisualizerProps {
  filterStatus: FilterStatus;
  onBackwash: (layer: keyof FilterStatus) => void;
  isBackwashing: boolean;
  activeBackwashLayer: string | null;
}

interface LayerDetail {
  title: string;
  material: string;
  functionDesc: string;
  maintenanceInterval: string;
  thickness: string;
}

export default function FilterVisualizer({
  filterStatus,
  onBackwash,
  isBackwashing,
  activeBackwashLayer,
}: FilterVisualizerProps) {
  const [selectedLayer, setSelectedLayer] = useState<"silica" | "carbon" | "gravel" | null>("silica");

  const details: Record<"silica" | "carbon" | "gravel", LayerDetail> = {
    silica: {
      title: "Lapisan 1: Pasir Silika (Silica Sand)",
      material: "Pasir Silika Alami (Mesh 14-20 & 20-30)",
      functionDesc: "Menyaring kotoran kasar, padatan tersuspensi (TSS), lumpur, tanah, pasir, dan koloid besar yang terbawa dari sumber air baku (sungai/sumur).",
      maintenanceInterval: "Setiap 3-4 minggu (atau saat efisiensi < 50%)",
      thickness: "30 cm",
    },
    carbon: {
      title: "Lapisan 2: Arang Aktif (Activated Carbon)",
      material: "Arang Aktif Tempurung Kelapa premium",
      functionDesc: "Menyerap sisa klorin bebas, zat organik terlarut, bau tak sedap, rasa asing, warna keruh, herbisida, logam berat mikro, serta memperbaiki rasa air.",
      maintenanceInterval: "Regenerasi 6 bulan sekali (atau saat efisiensi < 40%)",
      thickness: "40 cm",
    },
    gravel: {
      title: "Lapisan 3: Kerikil Filter (Gravel Bed)",
      material: "Kerikil Kuarsa Bergradasi (3-5mm & 5-10mm)",
      functionDesc: "Berfungsi sebagai filter akhir penahan partikel halus agar tidak lolos ke saluran air bersih, sekaligus sebagai penyangga struktur media filtrasi agar aliran merata.",
      maintenanceInterval: "Pembersihan berkala 2-3 bulan sekali",
      thickness: "15 cm",
    },
  };

  const getStatusColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-rose-500 animate-pulse";
  };

  const getStatusText = (val: number) => {
    if (val >= 80) return "Sangat Baik (Bersih)";
    if (val >= 50) return "Normal (Sedang)";
    return "Jenuh (Butuh Backwash!)";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-auto" id="filter-schematic">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Skema Filtrasi Multi-Layer</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded-md border">
          Metode Gravitasi Menurun
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Klik pada lapisan filter di dalam tangki untuk melihat detail fungsi, tingkat kejenuhan media, dan melakukan perintah manual pencucian balik (*backwash*).
      </p>

      {/* Tank Schematic & Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1">
        
        {/* Physical Tank Representation (Col: 5) */}
        <div className="md:col-span-5 flex flex-col items-center">
          
          {/* Toren Top Cap (Tutup Toren) */}
          <div className="relative w-[140px] h-6 bg-orange-500 rounded-t-full border-t-2 border-x-2 border-orange-600 shadow-md flex items-center justify-center z-20">
            {/* Small handle/knob on top */}
            <div className="absolute -top-1.5 w-6 h-1.5 bg-orange-600 rounded-t-sm"></div>
            <span className="text-[8px] font-extrabold text-white tracking-wider">SIBAK</span>
          </div>

          {/* Main Cylindrical Tank Body with Ribs */}
          <div className="relative w-full max-w-[200px] border-x-4 border-slate-700 bg-slate-50/90 shadow-2xl p-1 flex flex-col items-stretch min-h-[420px] z-10">
            
            {/* Cylindrical 3D Shade Overlay */}
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20"></div>
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20"></div>

            {/* Horizontal Strength Ribs/Grooves of the Toren */}
            <div className="absolute top-[80px] inset-x-0 h-[3px] bg-slate-700/25 border-y border-slate-800/10 pointer-events-none z-20"></div>
            <div className="absolute top-[180px] inset-x-0 h-[3px] bg-slate-700/25 border-y border-slate-800/10 pointer-events-none z-20"></div>
            <div className="absolute top-[280px] inset-x-0 h-[3px] bg-slate-700/25 border-y border-slate-800/10 pointer-events-none z-20"></div>
            <div className="absolute top-[370px] inset-x-0 h-[3px] bg-slate-700/25 border-y border-slate-800/10 pointer-events-none z-20"></div>

            {/* Water Inlet Stream Animation */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-8 bg-blue-400/50 rounded-b-md flex justify-center overflow-hidden z-10">
              <div className="w-1 h-full bg-blue-500 animate-[bounce_1.5s_infinite]"></div>
            </div>

            {/* 1. Raw Water Pool (Top) */}
            <div className="relative h-[70px] bg-sky-200/60 border-b border-sky-300 flex flex-col items-center justify-center text-center p-2 z-0">
              <div className="text-[10px] font-bold text-sky-800 tracking-wider">AIR BAKU MASUK</div>
              <div className="text-[9px] text-sky-600 font-medium">Lumpur & Sedimen</div>
              {/* Floating water drops animation */}
              <div className="absolute bottom-1 w-full flex justify-around opacity-70">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>

            {/* Arrow down separator */}
            <div className="flex justify-center my-0.5 pointer-events-none">
              <ArrowDown className="w-3.5 h-3.5 text-slate-400 animate-bounce" />
            </div>

            {/* 2. Silica Sand Layer */}
            <button
              onClick={() => setSelectedLayer("silica")}
              className={`relative h-[95px] flex flex-col items-center justify-center transition-all cursor-pointer p-2 ${
                selectedLayer === "silica"
                  ? "ring-2 ring-blue-500 bg-amber-50"
                  : "bg-amber-100/70 hover:bg-amber-50"
              } border-b border-dashed border-slate-300 rounded-md m-0.5 overflow-hidden`}
            >
              {/* Sandy texture effect */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]"></div>
              
              {activeBackwashLayer === "silica" && (
                <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center animate-pulse z-20">
                  <RefreshCw className="w-5 h-5 text-blue-700 animate-spin" />
                </div>
              )}
              
              <span className="text-[11px] font-extrabold text-amber-900 tracking-tight z-10">PASIR SILIKA</span>
              <span className="text-[9px] font-medium text-amber-700 z-10">Penyaring Makro</span>
              
              <div className="mt-1.5 w-4/5 bg-slate-200 rounded-full h-1.5 z-10 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getStatusColor(filterStatus.silica)}`}
                  style={{ width: `${filterStatus.silica}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-950 mt-1 z-10">
                Bersih: {filterStatus.silica}%
              </span>
            </button>

            {/* 3. Activated Carbon Layer */}
            <button
              onClick={() => setSelectedLayer("carbon")}
              className={`relative h-[115px] flex flex-col items-center justify-center transition-all cursor-pointer p-2 ${
                selectedLayer === "carbon"
                  ? "ring-2 ring-blue-500 bg-slate-700"
                  : "bg-slate-800 hover:bg-slate-700"
              } border-b border-dashed border-slate-300 rounded-md m-0.5 overflow-hidden text-white`}
            >
              {/* Charcoal gritty texture */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]"></div>
              
              {activeBackwashLayer === "carbon" && (
                <div className="absolute inset-0 bg-sky-500/40 flex items-center justify-center animate-pulse z-20">
                  <RefreshCw className="w-5 h-5 text-sky-100 animate-spin" />
                </div>
              )}

              <span className="text-[11px] font-extrabold text-slate-100 tracking-tight z-10">ARANG AKTIF</span>
              <span className="text-[9px] font-medium text-slate-300 z-10">Absorpsi Bau/Kimia</span>
              
              <div className="mt-1.5 w-4/5 bg-slate-600 rounded-full h-1.5 z-10 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getStatusColor(filterStatus.carbon)}`}
                  style={{ width: `${filterStatus.carbon}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-200 mt-1 z-10">
                Bersih: {filterStatus.carbon}%
              </span>
            </button>

            {/* 4. Gravel Filter Layer */}
            <button
              onClick={() => setSelectedLayer("gravel")}
              className={`relative h-[80px] flex flex-col items-center justify-center transition-all cursor-pointer p-2 ${
                selectedLayer === "gravel"
                  ? "ring-2 ring-blue-500 bg-stone-300"
                  : "bg-stone-400/80 hover:bg-stone-300"
              } rounded-md m-0.5 overflow-hidden`}
            >
              {/* Gravel rocky circle effects */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_5px_at_50%_50%,#555_100%,transparent_0)] [background-size:12px_12px]"></div>
              
              {activeBackwashLayer === "gravel" && (
                <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center animate-pulse z-20">
                  <RefreshCw className="w-5 h-5 text-blue-700 animate-spin" />
                </div>
              )}

              <span className="text-[11px] font-extrabold text-stone-950 tracking-tight z-10">KERIKIL FILTER</span>
              <span className="text-[9px] font-medium text-stone-700 z-10">Penyaring Mikro & Buffer</span>
              
              <div className="mt-1.5 w-4/5 bg-slate-200 rounded-full h-1.5 z-10 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${getStatusColor(filterStatus.gravel)}`}
                  style={{ width: `${filterStatus.gravel}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-mono font-bold text-stone-900 mt-1 z-10">
                Bersih: {filterStatus.gravel}%
              </span>
            </button>

            {/* Outflow Water Drops Tube */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-blue-500/30 rounded-t-sm flex items-center justify-center overflow-hidden">
              <div className="w-1.5 h-full bg-blue-600/70 animate-[slideDown_1s_infinite]"></div>
            </div>
          </div>

          {/* Toren Bottom Cone Connector */}
          <div className="w-[200px] h-5 bg-slate-700 rounded-b-xl border-x border-slate-800 shadow-inner flex flex-col items-center justify-start z-10">
            {/* Center nozzle drain */}
            <div className="w-6 h-3 bg-blue-500/80 rounded-b-sm border-x border-blue-600"></div>
          </div>

          {/* Steel Truss Stand (Kaki Penopang Besi / Tower Toren) */}
          <div className="relative w-[180px] h-20 -mt-0.5 flex justify-between px-2">
            {/* Left Pillar */}
            <div className="w-3 h-full bg-gradient-to-r from-slate-500 to-slate-600 transform -skew-x-6 border-r border-slate-700 shadow-sm"></div>
            
            {/* Crossing Steel Braces (X-Shape) */}
            <svg className="absolute inset-0 w-full h-full text-slate-400 stroke-current opacity-60" viewBox="0 0 180 80">
              <line x1="20" y1="0" x2="160" y2="80" strokeWidth="2.5" />
              <line x1="160" y1="0" x2="20" y2="80" strokeWidth="2.5" />
              <line x1="10" y1="40" x2="170" y2="40" strokeWidth="1.5" />
            </svg>

            {/* Right Pillar */}
            <div className="w-3 h-full bg-gradient-to-l from-slate-500 to-slate-600 transform skew-x-6 border-l border-slate-700 shadow-sm"></div>

            {/* Concrete Pad Foundation */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-stone-300 border border-stone-400 rounded-sm shadow-inner flex justify-between px-1">
              <div className="w-5 h-full bg-stone-400 rounded-sm"></div>
              <div className="w-5 h-full bg-stone-400 rounded-sm"></div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">TIPIKAL DESAIN REAKTOR</span>
            <span className="text-[9px] text-slate-400 font-medium">Tandon Filtrasi Desa Cerdas Mandiri</span>
          </div>
        </div>

        {/* Detailed Explanation and Action (Col: 7) */}
        <div className="md:col-span-7 flex flex-col justify-between h-full min-h-[380px]">
          {selectedLayer ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1 bg-blue-100 text-blue-700 rounded-lg">
                    <Info className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {details[selectedLayer].title}
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Bahan Media Filter:
                    </span>
                    <p className="font-semibold text-slate-800">{details[selectedLayer].material}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Ketebalan / Kedalaman Media:
                    </span>
                    <p className="font-medium text-slate-800">{details[selectedLayer].thickness}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Fungsi Utama Lapisan:
                    </span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{details[selectedLayer].functionDesc}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Siklus Pemeliharaan Standar:
                    </span>
                    <p className="text-slate-700">{details[selectedLayer].maintenanceInterval}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                      Status Kebersihan Saat Ini:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(filterStatus[selectedLayer])}`}></span>
                      <span className="font-bold text-slate-800">
                        {filterStatus[selectedLayer]}%
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 font-medium">
                        {getStatusText(filterStatus[selectedLayer])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 italic">
                  *Perlu Backwash jika bersih &lt; 50%
                </span>
                
                <button
                  onClick={() => onBackwash(selectedLayer)}
                  disabled={isBackwashing}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
                    filterStatus[selectedLayer] >= 95
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : isBackwashing
                      ? "bg-blue-50 text-blue-500 cursor-wait border border-blue-100"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md cursor-pointer transform active:scale-95"
                  }`}
                >
                  {filterStatus[selectedLayer] >= 95 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Lapisan Sudah Bersih
                    </>
                  ) : isBackwashing && activeBackwashLayer === selectedLayer ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Mencuci Media...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Lakukan Backwash Manual
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center flex-1">
              <HelpCircle className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Pilih Lapisan Filter</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Pilih salah satu komponen filter di sebelah kiri untuk mempelajari spesifikasi dan melakukan perawatan teknis.
              </p>
            </div>
          )}

          {/* Flow Mechanism Card */}
          <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
            <strong>ℹ️ Mekanisme Aliran Gravitasi Mandiri:</strong> Air baku dipompa ke puncak tangki, mengalir secara alami ditarik gaya gravitasi menembus media filter. Pencucian balik (*Backwash*) mengalirkan air bertekanan tinggi dari bawah ke atas untuk membuang partikel lumpur yang terperangkap keluar dari tangki.
          </div>

        </div>
      </div>
    </div>
  );
}
