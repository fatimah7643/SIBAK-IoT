import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely, handling missing keys gracefully
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not configured or using default placeholder. Falling back to expert simulated responses.");
}

// Simulated fallback advisor logic in case Gemini API key is missing
function getSimulatedAdvice(pH: number, turbidity: number, temp: number, flowRate: number, filterStatus: any, customQuestion?: string) {
  let diagnosis = "";
  let status = "LAYAK DIKONSUMSI";
  let recommendations: string[] = [];

  // Evaluate pH
  if (pH < 6.5) {
    diagnosis += `• **pH Air Rendah (${pH})**: Air bersifat asam. Hal ini dapat menimbulkan rasa asam, mengikis pipa logam, dan tidak ideal untuk konsumsi jangka panjang tanpa dinetralisir.\n`;
    status = "TIDAK LAYAK (Butuh Penyesuaian pH)";
    recommendations.push("Tambahkan media penetral asam (seperti limestone atau kalsit) pada tangki tambahan.");
  } else if (pH > 8.5) {
    diagnosis += `• **pH Air Tinggi (${pH})**: Air bersifat terlalu basa. Air terasa licin dan dapat menimbulkan endapan kerak kapur pada sistem pipa.\n`;
    status = "TIDAK LAYAK (Butuh Penyesuaian pH)";
    recommendations.push("Lakukan penurunan pH dengan aerasi intensif atau penambahan asam organik organik tingkat pangan (food-grade) jika diperlukan.");
  } else {
    diagnosis += `• **pH Air Normal (${pH})**: Tingkat keasaman air berada dalam batas aman standar Permenkes (6.5 - 8.5).\n`;
  }

  // Evaluate Turbidity
  if (turbidity > 5) {
    diagnosis += `• **Kekeruhan Tinggi (${turbidity} NTU)**: Air keruh terdeteksi melebihi batas aman 5 NTU. Ini menandakan adanya partikel suspensi seperti lumpur atau tanah yang lolos dari filtrasi.\n`;
    status = "TIDAK LAYAK (Keruh)";
    recommendations.push("Lakukan pencucian balik (Backwash) pada media **Pasir Silika** untuk membersihkan endapan lumpur yang menyumbat.");
    recommendations.push("Periksa apakah debit air baku masuk terlalu deras sehingga menembus media penyaring tanpa filtrasi optimal.");
  } else {
    diagnosis += `• **Kekeruhan Aman (${turbidity} NTU)**: Kekeruhan air di bawah 5 NTU, air tampak jernih dan aman secara visual.\n`;
  }

  // Evaluate Filter status
  if (filterStatus.silica < 40) {
    diagnosis += `• **Media Pasir Silika Jenuh (${filterStatus.silica}%)**: Efisiensi penyaringan partikel kasar menurun drastis.\n`;
    recommendations.push("Segera jadwalkan proses pencucian balik (backwashing) untuk Pasir Silika.");
  }
  if (filterStatus.carbon < 40) {
    diagnosis += `• **Media Arang Aktif Jenuh (${filterStatus.carbon}%)**: Daya serap terhadap bau, rasa, sisa klorin, dan senyawa kimia berkurang.\n`;
    recommendations.push("Pertimbangkan untuk meregenerasi atau mengganti media Arang Aktif jika bau/rasa mulai muncul.");
  }

  // Default recommendations if everything is perfect
  if (recommendations.length === 0) {
    diagnosis += `• **Sistem Berjalan Optimal**: Semua sensor parameter air dan kondisi filter berada dalam keadaan prima.\n`;
    recommendations.push("Pertahankan debit aliran air di kisaran 10-15 L/min untuk menjaga efisiensi filtrasi alami.");
    recommendations.push("Lakukan pemeriksaan fisik filter berkala setiap 2 minggu sekali.");
  }

  let text = `### 💧 Rekomendasi Sistem Air Bersih Desa Cerdas (Simulasi)

*Catatan: Gemini API Key belum terkonfigurasi di Secrets. Menampilkan analisis sistem berbasis aturan pakar.*

#### **1. Diagnosis Kualitas Air Baku & Filtrasi:**
${diagnosis}

#### **2. Status Kelayakan Air Saat Ini:**
👉 **STATUS: ${status}**
*Analisis didasarkan pada standar air bersih Kementerian Kesehatan RI.*

#### **3. Rekomendasi Tindakan Pengelola:**
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

---
**💡 Tips Perawatan Smart Water:**
Sistem filtrasi multi-layer bekerja secara berurutan. Pasir Silika menyaring lumpur kasar, Arang Aktif menyerap kontaminan terlarut & bau, sedangkan Kerikil Filter menyaring sisa partikel halus sekaligus menjaga kestabilan aliran di bagian bawah tangki.`;

  if (customQuestion) {
    text += `\n\n**Tanggapan terhadap pertanyaan Anda ("${customQuestion}"):**\nSebagai asisten pintar air bersih desa, saya merekomendasikan untuk memastikan sensor ESP32 terkalibrasi dengan baik sebelum melakukan tindakan pembersihan besar. Untuk pertanyaan spesifik Anda, silakan hubungi tim teknis desa atau konfigurasikan API key untuk mendapatkan jawaban AI yang mendalam!`;
  }

  return text;
}

// API: Water Analysis Endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { pH, turbidity, temperature, flowRate, filterStatus, customQuestion } = req.body;

  if (!pH || !turbidity) {
    return res.status(400).json({ error: "Parameters pH and turbidity are required." });
  }

  // If Gemini is not initialized, fallback to simulated analysis
  if (!ai) {
    const fallbackText = getSimulatedAdvice(pH, turbidity, temperature, flowRate, filterStatus, customQuestion);
    return res.json({ text: fallbackText, isSimulated: true });
  }

  try {
    const prompt = `Analisis kualitas air dengan parameter berikut:
- pH: ${pH} (batas aman Kemenkes: 6.5 - 8.5)
- Kekeruhan (Turbidity): ${turbidity} NTU (batas aman: < 5 NTU)
- Suhu: ${temperature} °C (batas normal: 20 - 30 °C)
- Debit Aliran Air: ${flowRate} L/min
- Kondisi filter saat ini:
  * Pasir Silika (Penyaring Sedimen Kasar): Efisiensi ${filterStatus.silica}%
  * Arang Aktif (Penyerap Klorin, Bau & Senyawa Organik): Efisiensi ${filterStatus.carbon}%
  * Kerikil Filter (Penyaring Akhir & Struktur): Efisiensi ${filterStatus.gravel}%

${customQuestion ? `Pertanyaan khusus dari pengguna: "${customQuestion}"` : "Berikan analisis umum, status kelayakan air saat ini, dan rekomendasi perawatan filter."}

Gunakan gaya bahasa Indonesia yang ramah, berwibawa, profesional untuk pengelola air desa cerdas. Format menggunakan Markdown terstruktur yang rapi.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah Asisten Pakar Air Bersih Desa Cerdas (Smart Village Water Advisor). Berikan analisis kualitas air IoT, tingkat kelayakan konsumsi berdasarkan Permenkes, diagnosis kerusakan/kejenuhan filter multi-layer (Pasir Silika, Arang Aktif, Kerikil Filter), dan rekomendasi pemeliharaan sistem filtrasi terperinci. Format tanggapan Anda dalam Markdown yang indah dengan emoji yang relevan.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text, isSimulated: false });
  } catch (error: any) {
    console.warn("Gemini API (demand/quota handled):", error.message || error);
    // On failure, fallback gracefully to our local expert rule engine
    const fallbackText = getSimulatedAdvice(pH, turbidity, temperature, flowRate, filterStatus, customQuestion);
    res.json({ 
      text: `### 📡 Mode Cadangan Sistem Mandiri Aktif
      
Layanan awan (cloud) sedang mengalami pembatasan kapasitas atau konektivitas tidak stabil. SIBAK otomatis mengaktifkan **Mesin Analisis Pakar Lokal** (Edge Rules) untuk memastikan kualitas air tetap terjaga:

${fallbackText}`, 
      isSimulated: true 
    });
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files serving enabled.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Water IoT server running on http://localhost:${PORT}`);
  });
}

startServer();
