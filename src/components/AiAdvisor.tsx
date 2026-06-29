import React, { useState } from "react";
import { Sparkles, Send, RefreshCw, MessageSquare, AlertCircle, HelpCircle, BookOpen } from "lucide-react";
import { WaterMetrics, FilterStatus } from "../types";

interface AiAdvisorProps {
  metrics: WaterMetrics;
  filterStatus: FilterStatus;
}

export default function AiAdvisor({ metrics, filterStatus }: AiAdvisorProps) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const predefinedQuestions = [
    "Bagaimana cara mencuci Pasir Silika dengan metode Backwash?",
    "Mengapa tingkat pH air sumur desa bisa mendadak sangat asam?",
    "Kapan waktu terbaik melakukan penggantian media Arang Aktif?",
    "Apakah aman mengonsumsi air dengan kekeruhan 4 NTU secara langsung?"
  ];

  const handleAnalyze = async (questionText?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pH: metrics.pH,
          turbidity: metrics.turbidity,
          temperature: metrics.temperature,
          flowRate: metrics.flowRate,
          filterStatus: filterStatus,
          customQuestion: questionText || customQuestion || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.text);
      setIsSimulated(data.isSimulated || false);
      if (questionText) {
        setCustomQuestion("");
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal menghubungi Asisten AI. Pastikan server berjalan dan periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  // Basic markdown-like parsing for bold text and bullet points
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    return text.split("\n").map((line, index) => {
      let content: React.ReactNode = line;
      
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={index} className="text-base font-bold text-blue-900 mt-4 mb-2 first:mt-0">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("#### ")) {
        return <h5 key={index} className="text-sm font-bold text-slate-800 mt-3 mb-1">{line.replace("#### ", "")}</h5>;
      }
      
      // Bold syntax (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        content = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part);
      }

      // Bullet points
      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
        const rawLine = line.replace(/^\s*[\*\-]\s*/, "");
        return (
          <li key={index} className="ml-4 list-disc text-xs text-slate-600 my-1 leading-relaxed">
            {boldRegex.test(rawLine) ? (
              rawLine.split(boldRegex).map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part)
            ) : rawLine}
          </li>
        );
      }

      // Numbered lists
      if (/^\s*\d+\.\s*/.test(line)) {
        const rawLine = line.replace(/^\s*\d+\.\s*/, "");
        return (
          <li key={index} className="ml-4 list-decimal text-xs text-slate-600 my-1 leading-relaxed">
            {boldRegex.test(rawLine) ? (
              rawLine.split(boldRegex).map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part)
            ) : rawLine}
          </li>
        );
      }

      return <p key={index} className="text-xs text-slate-600 my-1 leading-relaxed min-h-[4px]">{content}</p>;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-auto" id="gemini-advisor">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded-lg text-blue-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gemini AI Smart Water Advisor</h2>
            <p className="text-[10px] text-slate-400 font-medium">Asisten Rekomendasi Filtrasi & Kemenkes RI</p>
          </div>
        </div>
        
        {isSimulated && (
          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
            Local Rules Mode
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Hubungkan parameter sensor IoT dengan Gemini AI untuk mendiagnosis kualitas air, mendeteksi penyumbatan filter, dan merekomendasikan langkah pembersihan secara akurat.
      </p>

      {/* Main Analysis trigger / response area */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* Output Area */}
        <div className="border border-slate-150 rounded-xl bg-slate-50 p-4 min-h-[220px] max-h-[380px] overflow-y-auto mb-4 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-700">Menghubungi AI Advisor...</p>
              <p className="text-[10px] text-slate-400 mt-1">Menganalisis data sensor & standar kebersihan...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-rose-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-xs font-semibold">{error}</p>
              <button
                onClick={() => handleAnalyze()}
                className="mt-3 text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : response ? (
            <div className="space-y-1 text-slate-700">
              {renderFormattedText(response)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <BookOpen className="w-10 h-10 text-blue-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Belum Ada Analisis AI</p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                Tekan tombol dibawah ini untuk memulai analisis komparatif parameter sensor real-time dengan standar air bersih nasional.
              </p>
              
              <button
                onClick={() => handleAnalyze()}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mulai Analisis Kualitas Air
              </button>
            </div>
          )}
        </div>

        {/* Custom Question Form */}
        <div>
          {/* Quick Predefined Questions */}
          <div className="mb-3.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              Tanya Cepat Advisor:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {predefinedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomQuestion(q);
                    handleAnalyze(q);
                  }}
                  disabled={loading}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer text-left truncate max-w-full"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuestion.trim()) handleAnalyze();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Tanyakan masalah filter atau kualitas air di desa..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={loading || !customQuestion.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
