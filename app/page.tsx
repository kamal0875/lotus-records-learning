"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Music2, Mic, BarChart2, Star, TrendingUp, Play, Pause } from "lucide-react";

// --- Types ---
type Raga = {
  name: string;
  thaat: string;
  aroh: string;
  avroh: string;
  pakad: string;
  vadi: string;
  samvadi: string;
  jati: string;
  time_of_day: string;
  mood: string;
  difficulty_level: string;
};

type Session = {
  mode: "alap" | "composition";
  raga: Raga | null;
  scaleHz: number;
  tempo: number;
  instruments: { tanpura: boolean; harmonium: boolean; tabla: boolean; dholak: boolean };
  taal: "Teentaal" | "Dadra" | "Keharwa";
};

// --- Taal definitions ---
const TAALS: Record<string, { matras: number; bols: string[] }> = {
  Teentaal: { matras: 16, bols: ["Dha", "Dhin", "Dhin", "Dha", "|", "Dha", "Dhin", "Dhin", "Dha", "||", "Na", "Tin", "Tin", "Ta", "|", "Ta", "Dhin", "Dhin", "Dha"] },
  Dadra: { matras: 6, bols: ["Dha", "Dhi", "Na", "|", "Ti", "Na"] },
  Keharwa: { matras: 8, bols: ["Dha", "Ge", "Na", "Ti", "|", "Na", "Ka", "Dhi", "Na"] },
};

// --- Fallback dataset (if /ragas.json missing) ---
const FALLBACK_RAGAS: Raga[] = [
  { name: "Yaman", thaat: "Kalyan", aroh: "N R G M^ D N S'", avroh: "S' N D P M^ G R S", pakad: "N R G M^ G R S", vadi: "G", samvadi: "N", jati: "Sampurna–Sampurna", time_of_day: "Evening (6–9 PM)", mood: "Shanta, Romantic", difficulty_level: "Intermediate" },
  { name: "Bhoopali", thaat: "Kalyan", aroh: "S R G P D S'", avroh: "S' D P G R S", pakad: "G R S, D S', D P G R S", vadi: "G", samvadi: "D", jati: "Audav–Audav", time_of_day: "Evening", mood: "Peaceful, Devotional", difficulty_level: "Easy" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("ragas");
  const [ragas, setRagas] = useState<Raga[]>([]);
  const [selectedRaga, setSelectedRaga] = useState<Raga | null>(null);
  const [scaleHz, setScaleHz] = useState(440);
  const [tempo, setTempo] = useState(90);
  const [taal, setTaal] = useState<"Teentaal" | "Dadra" | "Keharwa">("Teentaal");
  const [instruments, setInstruments] = useState({ tanpura: true, harmonium: false, tabla: true, dholak: false });
  const [isClickOn, setIsClickOn] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  // Load ragas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/ragas.json", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.name) { setRagas(data as Raga[]); return; }
        }
        setRagas(FALLBACK_RAGAS);
      } catch {
        setRagas(FALLBACK_RAGAS);
      }
    })();
  }, []);

  // Metronome
  useEffect(() => {
    if (!isClickOn) return;
    const matras = TAALS[taal].matras;
    const id = setInterval(() => setCurrentBeat(b => (b + 1) % matras), (60_000 / tempo));
    return () => clearInterval(id);
  }, [isClickOn, tempo, taal]);

  const toggleInstrument = (key: keyof Session["instruments"]) => setInstruments(prev => ({ ...prev, [key]: !prev[key] }));
  const startSession = (mode: Session["mode"]) => { setSession({ mode, raga: selectedRaga, scaleHz, tempo, instruments, taal }); setActiveTab("practice"); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music2 className="h-7 w-7 text-pink-600" />
          <h1 className="text-3xl font-bold text-pink-700">Lotus Records Learning</h1>
          <span className="text-xs text-slate-500">Rāga Library • Riyaaz • Badges</span>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="ragas">Ragas</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* RAGAS */}
        <TabsContent value="ragas" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {ragas.map((r, i) => (
              <Card key={i} onClick={() => { setSelectedRaga(r); setScaleHz(440); setTempo(90); }} className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle className="text-lg">{r.name}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-600 mb-1">Thaat: {r.thaat}</div>
                  <div className="text-xs text-slate-600">Time: {r.time_of_day}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedRaga && (
            <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50" onClick={() => setSelectedRaga(null)}>
              <div className="bg-white rounded-2xl shadow-xl w-full md:w-[820px] p-5 m-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-semibold">{selectedRaga.name}</div>
                    <div className="text-xs text-slate-500">{selectedRaga.thaat} • {selectedRaga.time_of_day}</div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedRaga(null)}>Close</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-pink-50 p-3"><div className="text-xs font-semibold text-pink-700">Aroh</div><div>{selectedRaga.aroh}</div></div>
                  <div className="rounded-xl bg-pink-50 p-3"><div className="text-xs font-semibold text-pink-700">Avroh</div><div>{selectedRaga.avroh}</div></div>
                  <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs font-semibold text-slate-700">Pakad</div><div>{selectedRaga.pakad}</div></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => startSession("alap")}>Start Alap</Button>
                  <Button variant="secondary" onClick={() => startSession("composition")}>Start Composition</Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* PRACTICE */}
        <TabsContent value="practice" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Live Riyaaz Session</CardTitle></CardHeader>
            <CardContent>
              {!session ? <div className="text-sm text-slate-600">Open <b>Ragas</b>, pick one and tap <b>Start</b>.</div> : (
                <div className="space-y-4">
                  <div className="text-sm text-slate-700">Mode: <b>{session.mode}</b> • Rāga: <b>{session.raga?.name}</b> • Tempo: <b>{session.tempo}</b></div>
                  <div className="rounded-xl bg-slate-50 p-3 flex flex-wrap gap-2">
                    {TAALS[session.taal].bols.map((b, i) => (
                      <span key={i} className={`px-2 py-1 rounded ${i % TAALS[session.taal].matras === currentBeat ? "bg-pink-600 text-white" : "bg-white border"}`}>{b}</span>
                    ))}
                  </div>
                  <Button onClick={() => setIsClickOn(p => !p)} className="gap-2">{isClickOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{isClickOn ? "Pause" : "Play"}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="mt-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Lotus Records Learning • Rāga practice prototype
      </footer>
    </div>
  );
}
