export interface FilterStatus {
  silica: number;  // 0 - 100% cleanliness/efficiency
  carbon: number;  // 0 - 100% cleanliness/efficiency
  gravel: number;  // 0 - 100% cleanliness/efficiency
}

export interface WaterMetrics {
  pH: number;
  turbidity: number; // in NTU
  temperature: number; // in °C
  flowRate: number; // in L/min
  totalProduced: number; // in Liters
}

export interface Solenoids {
  inlet: boolean;  // Solenoid Valve 1 (Water Baku)
  outlet: boolean; // Solenoid Valve 2 (Clean Water)
  backwash: boolean; // Backwash Valve
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "success" | "danger";
  message: string;
  category: "SENSOR" | "VALVE" | "SYSTEM" | "FILTER";
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  parameter: "pH" | "Turbidity" | "Temperature" | "Filter" | "System";
  severity: "warning" | "danger";
  message: string;
  resolved: boolean;
}
