import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MetricsDashboard from "./components/MetricsDashboard";
import FilterVisualizer from "./components/FilterVisualizer";
import SolenoidControls from "./components/SolenoidControls";
import AiAdvisor from "./components/AiAdvisor";
import HistoricalCharts from "./components/HistoricalCharts";
import { FilterStatus, WaterMetrics, Solenoids, SystemLog, AlertNotification } from "./types";
import { 
  Bell, 
  Trash2, 
  FileText, 
  Play, 
  Pause, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  Settings,
  HelpCircle
} from "lucide-react";

export default function App() {
  // 1. Core IoT and Filter States
  const [metrics, setMetrics] = useState<WaterMetrics>({
    pH: 7.2,
    turbidity: 1.2,
    temperature: 25.4,
    flowRate: 12.5,
    totalProduced: 3280.4,
  });

  const [filterStatus, setFilterStatus] = useState<FilterStatus>({
    silica: 85,
    carbon: 70,
    gravel: 95,
  });

  const [solenoids, setSolenoids] = useState<Solenoids>({
    inlet: true,
    outlet: true,
    backwash: false,
  });

  // 2. Control System States
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const [espOnline, setEspOnline] = useState<boolean>(true);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);

  // 3. Backwashing Animation States
  const [isBackwashing, setIsBackwashing] = useState<boolean>(false);
  const [activeBackwashLayer, setActiveBackwashLayer] = useState<string | null>(null);

  // 4. Alert & Logs Databases
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: "alert-1",
      timestamp: "08:15",
      parameter: "Filter",
      severity: "warning",
      message: "Efisiensi media Arang Aktif di bawah 75%. Pertimbangkan backwash.",
      resolved: false,
    }
  ]);

  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: "log-1",
      timestamp: "09:00:00",
      type: "success",
      category: "SYSTEM",
      message: "Sistem SIBAK - Sistem Iot Bersih Air Bakung berhasil diinisialisasi.",
    },
    {
      id: "log-2",
      timestamp: "09:00:05",
      type: "info",
      category: "SENSOR",
      message: "ESP32 terhubung ke WiFi: Desa-Cerdas-Net (-58 dBm).",
    },
    {
      id: "log-3",
      timestamp: "09:00:10",
      type: "info",
      category: "FILTER",
      message: "Kalibrasi sensor aliran selesai. Debit optimal 10-15 L/min.",
    }
  ]);

  // Helper to add a system log
  const addLog = (message: string, type: "info" | "warning" | "success" | "danger" = "info", category: "SENSOR" | "VALVE" | "SYSTEM" | "FILTER" = "SYSTEM") => {
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      type,
      category,
      message,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep last 50 logs
  };

  // Helper to add/remove an alert
  const triggerAlert = (parameter: "pH" | "Turbidity" | "Temperature" | "Filter" | "System", severity: "warning" | "danger", message: string) => {
    // Avoid duplicates
    if (alerts.some(a => a.message === message && !a.resolved)) return;

    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0].substring(0, 5);
    const newAlert: AlertNotification = {
      id: `alert-${Date.now()}`,
      timestamp,
      parameter,
      severity,
      message,
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    addLog(`[ALARM] ${message}`, severity === "danger" ? "danger" : "warning", parameter === "Filter" ? "FILTER" : "SENSOR");
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      addLog(`Alarm diselesaikan: ${alert.message}`, "success", "SYSTEM");
    }
  };

  const clearResolvedAlerts = () => {
    setAlerts((prev) => prev.filter(a => !a.resolved));
  };

  // 5. Interactive Simulation Ticker loop (runs every 3 seconds to simulate continuous stream flow)
  useEffect(() => {
    if (!isSimulationRunning || isBackwashing || !espOnline) return;

    const interval = setInterval(() => {
      // Slow deterioration of filter media based on stream flowing
      if (solenoids.inlet && solenoids.outlet) {
        setFilterStatus((prev) => {
          const nextSilica = Math.max(15, parseFloat((prev.silica - 0.15).toFixed(2)));
          const nextCarbon = Math.max(10, parseFloat((prev.carbon - 0.12).toFixed(2)));
          const nextGravel = Math.max(20, parseFloat((prev.gravel - 0.08).toFixed(2)));

          // Check for wear warning
          if (nextSilica < 40) triggerAlert("Filter", "danger", "Pasir Silika sangat jenuh! Air berisiko keruh.");
          if (nextCarbon < 40) triggerAlert("Filter", "danger", "Arang Aktif sangat jenuh! Risiko bau/warna terdeteksi.");

          return {
            silica: nextSilica,
            carbon: nextCarbon,
            gravel: nextGravel
          };
        });

        // Add to production total volume
        setMetrics((prev) => {
          const producedThisTick = parseFloat(((prev.flowRate * 3) / 60).toFixed(2)); // flowRate is L/min, tick is 3 seconds
          return {
            ...prev,
            totalProduced: parseFloat((prev.totalProduced + producedThisTick).toFixed(2))
          };
        });
      }

      // Small natural sensor reading fluctuations
      setMetrics((prev) => {
        // Add random slight walk to readings
        const phDelta = (Math.random() - 0.5) * 0.04;
        const turbDelta = (Math.random() - 0.5) * 0.1;
        const tempDelta = (Math.random() - 0.5) * 0.15;

        // Keep values in realistic bounds unless manually override
        const nextPh = Math.max(4, Math.min(10, prev.pH + phDelta));
        const nextTurb = Math.max(0.1, Math.min(15, prev.turbidity + turbDelta));
        const nextTemp = Math.max(15, Math.min(38, prev.temperature + tempDelta));

        return {
          ...prev,
          pH: parseFloat(nextPh.toFixed(2)),
          turbidity: parseFloat(nextTurb.toFixed(2)),
          temperature: parseFloat(nextTemp.toFixed(2))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulationRunning, isBackwashing, solenoids, espOnline]);

  // 6. Automatic Control Automation Logic (Runs whenever parameters adjust)
  useEffect(() => {
    if (!isAutoMode || isBackwashing) return;

    // Safety automation rules for Kemenkes Standard
    const isPhUnsafe = metrics.pH < 6.5 || metrics.pH > 8.5;
    const isTurbidityUnsafe = metrics.turbidity > 5.0;

    if (isPhUnsafe || isTurbidityUnsafe) {
      // Trigger auto stop
      if (solenoids.outlet) {
        setSolenoids((prev) => ({ ...prev, outlet: false }));
        addLog("OTOMATISASI: Katup Outlet ditutup karena parameter air tidak aman!", "danger", "VALVE");
      }

      if (isPhUnsafe) {
        triggerAlert("pH", "danger", `pH air abnormal (${metrics.pH.toFixed(1)}). Di luar batas Permenkes 6.5-8.5.`);
      }
      if (isTurbidityUnsafe) {
        triggerAlert("Turbidity", "danger", `Kekeruhan tinggi (${metrics.turbidity.toFixed(1)} NTU). Melebihi ambang batas 5.0 NTU.`);
      }
    } else {
      // Safe, auto open outlet if inlet is also open
      if (!solenoids.outlet && solenoids.inlet) {
        setSolenoids((prev) => ({ ...prev, outlet: true }));
        addLog("OTOMATISASI: Kualitas air kembali normal. Katup Outlet dibuka kembali.", "success", "VALVE");
      }
    }
  }, [metrics.pH, metrics.turbidity, isAutoMode, isBackwashing]);

  // 7. Core Interactive Action Handlers
  const handleToggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    addLog(`Mode sistem diubah ke: ${!isAutoMode ? "OTOMATIS" : "MANUAL"}.`, "info", "SYSTEM");
  };

  const handleToggleSolenoid = (valve: keyof Solenoids) => {
    if (isAutoMode) return; // Blocked in auto mode
    setSolenoids((prev) => {
      const nextState = !prev[valve];
      addLog(`MANUAL: Katup ${valve.toUpperCase()} diubah ke ${nextState ? "OPEN" : "CLOSED"}.`, "warning", "VALVE");
      return { ...prev, [valve]: nextState };
    });
  };

  const handleAdjustMetric = (key: keyof WaterMetrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
    addLog(`Parameter ${key.toUpperCase()} diubah secara manual ke ${value.toFixed(1)}.`, "info", "SENSOR");
  };

  // Backwash Cycle Trigger
  const handleBackwash = (layer: keyof FilterStatus) => {
    if (isBackwashing) return;

    setIsBackwashing(true);
    setActiveBackwashLayer(layer);
    addLog(`Pencucian balik (Backwash) pada media ${layer.toUpperCase()} dimulai.`, "warning", "FILTER");

    // Save previous state to restore
    const prevInlet = solenoids.inlet;
    const prevOutlet = solenoids.outlet;

    // During backwash: inlet & outlet valves closed, backwash valve open
    setSolenoids({
      inlet: false,
      outlet: false,
      backwash: true,
    });

    // Simulate 4-second washing process
    setTimeout(() => {
      setFilterStatus((prev) => ({
        ...prev,
        [layer]: 100, // fully restored
      }));

      // Restore valves
      setSolenoids({
        inlet: prevInlet,
        outlet: prevOutlet,
        backwash: false,
      });

      setIsBackwashing(false);
      setActiveBackwashLayer(null);
      addLog(`Pencucian balik media ${layer.toUpperCase()} selesai! Efisiensi media kembali ke 100%.`, "success", "FILTER");

      // Auto resolve relevant filter alert
      setAlerts((prev) =>
        prev.map((a) =>
          a.parameter === "Filter" && a.message.toLowerCase().includes(layer)
            ? { ...a, resolved: true }
            : a
        )
      );
    }, 4000);
  };

  // Quick Scenarios
  const handleTriggerContamination = () => {
    addLog("SIMULASI: Terjadi aliran banjir lumpur di hulu air baku desa!", "danger", "SENSOR");
    setMetrics((prev) => ({
      ...prev,
      turbidity: 11.8,
      pH: 6.2,
    }));
  };

  const handleTriggerPerfectAir = () => {
    addLog("SIMULASI: Air baku pegunungan bersih dialirkan kembali.", "success", "SENSOR");
    setMetrics((prev) => ({
      ...prev,
      turbidity: 0.8,
      pH: 7.2,
    }));
    // Resolve turbidity and pH alerts
    setAlerts((prev) =>
      prev.map((a) =>
        a.parameter === "pH" || a.parameter === "Turbidity"
          ? { ...a, resolved: true }
          : a
      )
    );
  };

  const handleResetFilters = () => {
    setFilterStatus({
      silica: 100,
      carbon: 100,
      gravel: 100,
    });
    addLog("SISTEM: Penggantian media pasir silika, arang aktif, dan kerikil kuarsa selesai.", "success", "FILTER");
    // Resolve all filter alerts
    setAlerts((prev) =>
      prev.map((a) => (a.parameter === "Filter" ? { ...a, resolved: true } : a))
    );
  };

  // KPI Computations for Header
  const activeAlerts = alerts.filter(a => !a.resolved);
  const averagepH = metrics.pH;
  const averageTurbidity = metrics.turbidity;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12" id="app-root">
      
      {/* Top Floating Alert Banner if safety is compromised */}
      {metrics.turbidity > 5.0 && (
        <div className="bg-rose-600 text-white text-center py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>PERINGATAN: Kekeruhan Air {metrics.turbidity.toFixed(1)} NTU Melebihi Batas Kemenkes. Solenoid Outlet Otomatis Tertutup!</span>
        </div>
      )}

      {/* Nav bar */}
      <nav className="bg-white border-b border-slate-200 py-3.5 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 rounded-xl text-white">
              <Droplet className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block leading-none">
                Pemerintah Desa Mandiri Air Bersih
              </span>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">
                SIBAK - Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Senin, 29 Jun 2026</span>
            </div>

            {/* Simulation Status Toggle */}
            <button
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isSimulationRunning
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-blue-700" />
                  <span>SIMULASI JALAN</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-500" />
                  <span>SIMULASI BERHENTI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Main Brand & KPI Widget */}
        <Header
          espOnline={espOnline}
          activeAlertsCount={activeAlerts.length}
          totalWaterProduced={metrics.totalProduced}
          averagepH={averagepH}
          averageTurbidity={averageTurbidity}
        />

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* LEFT PANELS: Filters & Valves (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section A: Multi-layer Filtration Schematic */}
            <FilterVisualizer
              filterStatus={filterStatus}
              onBackwash={handleBackwash}
              isBackwashing={isBackwashing}
              activeBackwashLayer={activeBackwashLayer}
            />

            {/* Section B: Solenoid Controllers & Scenario Simulation */}
            <SolenoidControls
              solenoids={solenoids}
              isAutoMode={isAutoMode}
              onToggleAutoMode={handleToggleAutoMode}
              onToggleSolenoid={handleToggleSolenoid}
              onTriggerContamination={handleTriggerContamination}
              onTriggerPerfectAir={handleTriggerPerfectAir}
              onResetFilters={handleResetFilters}
              isBackwashing={isBackwashing}
            />

          </div>

          {/* RIGHT PANELS: Live Telemetry & AI Advisor (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-time telemetry sliders & gauges */}
            <MetricsDashboard
              metrics={metrics}
              onAdjustMetric={handleAdjustMetric}
            />

            {/* Gemini AI Smart Water Quality Analysis */}
            <AiAdvisor
              metrics={metrics}
              filterStatus={filterStatus}
            />

          </div>

        </div>

        {/* MIDDLE SECTION: Historical Analytics Area (Recharts) */}
        <div className="mt-6">
          <HistoricalCharts />
        </div>

        {/* BOTTOM SECTION: Alarm Center & System Logs Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Notification / Alarm List (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-[320px]" id="alarm-center">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500 animate-swing" />
                <h3 className="font-bold text-slate-900 text-sm">Pusat Peringatan & Notifikasi</h3>
              </div>
              
              {alerts.some(a => a.resolved) && (
                <button
                  onClick={clearResolvedAlerts}
                  className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Bersihkan Riwayat
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Notifikasi otomatis dibangkitkan oleh sistem kecerdasan tersemat jika parameter air baku keluar dari ambang aman.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Semua Parameter Aman</p>
                  <p className="text-[10px] text-slate-400">Belum ada peringatan kritis hari ini.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-xl p-3 text-xs transition-all flex justify-between items-start ${
                      alert.resolved
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : alert.severity === "danger"
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.resolved ? "text-slate-400" : alert.severity === "danger" ? "text-rose-500" : "text-amber-500"}`} />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold font-mono text-[9px] uppercase tracking-wider bg-slate-200/50 px-1 rounded-sm text-slate-700">
                            {alert.parameter}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{alert.timestamp}</span>
                        </div>
                        <p className="mt-1 leading-relaxed font-medium">{alert.message}</p>
                      </div>
                    </div>

                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 transition-all cursor-pointer ${
                          alert.severity === "danger"
                            ? "bg-white border-rose-200 hover:bg-rose-100 text-rose-700"
                            : "bg-white border-amber-200 hover:bg-amber-100 text-amber-700"
                        }`}
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Console / Event Logs (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-[320px]" id="system-logs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Log Event & Telemetry ESP32</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border">
                Live Console
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Daftar instruksi eksekusi, serial debug mikrokontroler, serta perubahan sensor analog dari reaktor filtrasi air.
            </p>

            <div className="flex-1 bg-slate-900 border border-slate-950 rounded-xl p-3 font-mono text-[11px] overflow-y-auto space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-1.5 leading-relaxed text-slate-300">
                  <span className="text-slate-500 shrink-0 font-medium">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 text-[10px] px-1 rounded-sm ${
                    log.type === "success" ? "text-emerald-400 bg-emerald-950/40" :
                    log.type === "danger" ? "text-rose-400 bg-rose-950/40 animate-pulse" :
                    log.type === "warning" ? "text-amber-400 bg-amber-950/40" : "text-blue-400 bg-blue-950/40"
                  }`}>
                    {log.category}
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer credits and system metadata */}
      <footer className="mt-12 text-center text-slate-400 text-xs border-t border-slate-200 pt-6 px-6">
        <p className="font-semibold text-slate-500">SIBAK - (Sistem Iot Bersih Air Bakung)</p>
        <p className="mt-1 text-[11px] text-slate-400">Pemerintah Desa Cerdas Mandiri Air Bersih • Didukung Modul IoT ESP32 & Tim Tirta Bakung HMJ-TI Jaya</p>
      </footer>
    </div>
  );
}
