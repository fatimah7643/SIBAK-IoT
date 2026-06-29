import React from "react";
import { Solenoids, WaterMetrics, FilterStatus } from "../types";
import { Sliders, ToggleLeft, ToggleRight, Sparkles, AlertTriangle, RefreshCw, Power } from "lucide-react";

interface SolenoidControlsProps {
  solenoids: Solenoids;
  isAutoMode: boolean;
  onToggleAutoMode: () => void;
  onToggleSolenoid: (valve: keyof Solenoids) => void;
  onTriggerContamination: () => void;
  onTriggerPerfectAir: () => void;
  onResetFilters: () => void;
  isBackwashing: boolean;
}

export default function SolenoidControls({
  solenoids,
  isAutoMode,
  onToggleAutoMode,
  onToggleSolenoid,
  onTriggerContamination,
  onTriggerPerfectAir,
  onResetFilters,
  isBackwashing,
}: SolenoidControlsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-auto" id="valve-controls">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Aktuator & Solenoid IoT</h2>
          </div>
          
          {/* Mode Switcher */}
          <button
            onClick={onToggleAutoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isAutoMode
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isAutoMode ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                <span>MODE: OTOMATIS</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-amber-500" />
                <span>MODE: MANUAL</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-5">
          Mikrokontroler ESP32 mengontrol saklar relay berdaya tinggi untuk membuka/menutup katup solenoida kuningan 12V DC secara elektronik.
        </p>

        {/* Valves Status Cards */}
        <div className="space-y-3.5 mb-6">
          
          {/* 1. Inlet Solenoid */}
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-lg ${solenoids.inlet ? "bg-emerald-100 text-emerald-600 animate-pulse" : "bg-slate-200 text-slate-400"}`}>
                <Power className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-800 text-xs block">Katup Solenoid 1 (Inlet Air Baku)</span>
                <span className="text-[10px] text-slate-400 font-medium">Mengalirkan air kolam penampung desa</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${solenoids.inlet ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"}`}>
                {solenoids.inlet ? "OPEN (MENGALIR)" : "CLOSED (TERTUTUP)"}
              </span>
              <button
                onClick={() => onToggleSolenoid("inlet")}
                disabled={isAutoMode}
                className={`w-10 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                  isAutoMode ? "bg-slate-100 opacity-50 cursor-not-allowed" : solenoids.inlet ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-all ${solenoids.inlet ? "translate-x-4" : ""}`}></div>
              </button>
            </div>
          </div>

          {/* 2. Outlet Solenoid */}
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-lg ${solenoids.outlet ? "bg-emerald-100 text-emerald-600 animate-pulse" : "bg-slate-200 text-slate-400"}`}>
                <Power className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-800 text-xs block">Katup Solenoid 2 (Outlet Air Bersih)</span>
                <span className="text-[10px] text-slate-400 font-medium">Distribusi pipa air bersih warga mandiri</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${solenoids.outlet ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"}`}>
                {solenoids.outlet ? "OPEN (DISTRUSI)" : "CLOSED (STOP)"}
              </span>
              <button
                onClick={() => onToggleSolenoid("outlet")}
                disabled={isAutoMode}
                className={`w-10 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                  isAutoMode ? "bg-slate-100 opacity-50 cursor-not-allowed" : solenoids.outlet ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-all ${solenoids.outlet ? "translate-x-4" : ""}`}></div>
              </button>
            </div>
          </div>

          {/* 3. Backwash Solenoid */}
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`p-2 rounded-lg ${solenoids.backwash ? "bg-amber-100 text-amber-600 animate-spin" : "bg-slate-200 text-slate-400"}`}>
                <RefreshCw className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-slate-800 text-xs block">Katup Solenoid 3 (Backwash Drain)</span>
                <span className="text-[10px] text-slate-400 font-medium">Pembuangan lumpur & air pembilasan</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${solenoids.backwash ? "bg-amber-50 text-amber-600 font-semibold" : "bg-slate-200 text-slate-600"}`}>
                {solenoids.backwash ? "ACTIVE (FLUSH)" : "CLOSED (STANDBY)"}
              </span>
              <button
                onClick={() => onToggleSolenoid("backwash")}
                disabled={isAutoMode || isBackwashing}
                className={`w-10 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                  isAutoMode || isBackwashing ? "bg-slate-100 opacity-50 cursor-not-allowed" : solenoids.backwash ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-all ${solenoids.backwash ? "translate-x-4" : ""}`}></div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* IoT Simulation Panel */}
      <div className="pt-4 border-t border-slate-200/80">
        <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider mb-2.5">
          Simulasi Kondisi Air Desa (Uji Coba Sistem)
        </span>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Scenario 1: Heavy Contamination */}
          <button
            onClick={onTriggerContamination}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-xl text-xs transition-all cursor-pointer hover:shadow-xs active:scale-95 text-center"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulasi Air Keruh</span>
          </button>

          {/* Scenario 2: Perfect Mountain Water */}
          <button
            onClick={onTriggerPerfectAir}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-xl text-xs transition-all cursor-pointer hover:shadow-xs active:scale-95 text-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi Air Bersih</span>
          </button>
        </div>

        {/* Scenario 3: Regenerate / Refill Filters */}
        <button
          onClick={onResetFilters}
          className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ganti / Regenerasi Semua Media Filter</span>
        </button>
      </div>
    </div>
  );
}
