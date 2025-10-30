"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mic, Music2, Play, Pause } from "lucide-react";

// ---------- Types that handle bilingual JSON ----------
type BiText = string | { hi?: string; en?: string };
type Raga = {
  name: BiText;
  thaat: BiText;
  aroh: BiText;
  avroh: BiText;
  pakad: BiText;
  vadi: BiText;
  samvadi: BiText;
  jati: BiText;
  time_of_day: BiText;
  mood: BiText;
  difficulty_level: BiText;
};

// ---------- Helper to read either string or {hi,en} ----------
const pick = (v: BiText, lang: "hi" | "en") =>
  typeof v === "string" ? v : (v?.[lang] ?? v?.en ?? v?.hi ?? "");

export default function App() {
  const [activeTab, setActiveTab] = useState("ragas");
  const [ragas, setRagas] = useState<Raga[]>([]);
  const [selectedRaga, setSelectedRaga] = useState<Raga | null>(null);
  const [tempo, setTempo] = useState(90);
  const [taal] = useState<"Teentaal" | "Dadra" | "Keharwa">("Teentaal");
  const [isClickOn, setIsClickOn] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [lang, setLang] = useState<"hi" | "en">("hi"); // language toggle

  // Load ragas.json
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/ragas.json", { cache: "no-store" });
        if (!res.ok) throw new Error("ragas.json not found");
        const data = (await res.json()) as Raga[];
        setRagas(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load ragas.json", e);
        setRagas([]);
      }
    })();
  }, []);

  // Simple metronome tick highlight (no audio here)
  useEffect(() => {
    if (!isClickOn) return;
    const matras = 16; // Teentaal default visual
    const id = setInterval(() => setCurrentBeat((b) => (b + 1) % matras), 60_000 / tempo);
    return () => clearInterval(id);
  }, [isClickOn, tempo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-pink-600" />
          <h1 className="text-3xl font-bold text-pink-700">Lotus Records Learning</h1>
          <span className="text-xs text-slate-500">Rāga Library • Riyaaz • Badges</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Language</span>
          <div className="flex gap-1">
            <Button variant={lang === "hi" ? "default" : "secondary"} size="sm" onClick={() => setLang("hi")}>
              हिन्दी
            </Button>
            <Button variant={lang === "en" ? "default" : "secondary"} size="sm" onClick={() => setLang("en")}>
              English
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="ragas">Ragas</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* RAGAS */}
        <TabsContent value="ragas" className="mt-6">
          {ragas.length === 0 ? (
            <div className="text-sm text-slate-600">No ragas found. Ensure <code>public/ragas.json</code> exists.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {ragas.map((r, i) => (
                <Card
                  key={i}
                  onClick={() => setSelectedRaga(r)}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{pick(r.name, lang)}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-medium">{lang === "hi" ? "थाट" : "Thaat"}:</span>{" "}
                      {pick(r.thaat, lang)}
                    </div>
                    <div>
                      <span className="font-medium">{lang === "hi" ? "समय" : "Time"}:</span>{" "}
                      {pick(r.time_of_day, lang)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedRaga && (
            <div
              className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50"
              onClick={() => setSelectedRaga(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full md:w-[820px] p-5 m-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-semibold">{pick(selectedRaga.name, lang)}</div>
                    <div className="text-xs text-slate-500">
                      {pick(selectedRaga.thaat, lang)} • {pick(selectedRaga.time_of_day, lang)}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedRaga(null)}>
                    Close
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-pink-50 p-3">
                    <div className="text-xs font-semibold text-pink-700">{lang === "hi" ? "आरोह" : "Aroh"}</div>
                    <div>{pick(selectedRaga.aroh, lang)}</div>
                  </div>
                  <div className="rounded-xl bg-pink-50 p-3">
                    <div className="text-xs font-semibold text-pink-700">{lang === "hi" ? "अवरोह" : "Avroh"}</div>
                    <div>{pick(selectedRaga.avroh, lang)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 md:col-span-2">
                    <div className="text-xs font-semibold text-slate-700">{lang === "hi" ? "पकड़" : "Pakad"}</div>
                    <div>{pick(selectedRaga.pakad, lang)}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => setActiveTab("practice")}>{lang === "hi" ? "अलाप प्रारम्भ" : "Start Alap"}</Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* PRACTICE (simple placeholder so page mounts safely) */}
        <TabsContent value="practice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" /> {lang === "hi" ? "रियाज़ सत्र" : "Riyaaz Session"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700">
                {lang === "hi" ? "तबले की गणना (दृश्य):" : "Tabla count (visual):"} {taal} • {tempo} BPM
              </div>
              <div className="rounded-xl bg-slate-50 p-3 flex flex-wrap gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded ${i === currentBeat ? "bg-pink-600 text-white" : "bg-white border"}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <Button onClick={() => setIsClickOn((p) => !p)} className="gap-2">
                {isClickOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isClickOn ? (lang === "hi" ? "रोकें" : "Pause") : (lang === "hi" ? "चलाएँ" : "Play")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about" className="mt-6 text-sm text-slate-600">
          <p>
            {lang === "hi"
              ? "यह ऐप हिंदुस्तानी संगीत के रागों का अभ्यास सरल और आधुनिक तरीके से करवाने के लिए बनाया गया है।"
              : "This app helps you practise Hindustani rāgas in a simple, modern way."}
          </p>
          <p className="mt-2">
            {lang === "hi"
              ? "राग डेटा: सार्वजनिक डोमेन स्रोतों से संकलित।"
              : "Raga data compiled from public-domain sources."}
          </p>
        </TabsContent>
      </Tabs>

      <footer className="mt-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Lotus Records Learning
      </footer>
    </div>
  );
}
