'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { 
  Video, 
  Play, 
  Clock, 
  Folder, 
  Loader2,
  ShieldAlert
} from 'lucide-react';

export default function LocalDemoPage() {
  // Production security isolation: Never render in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to record automated product walkthrough.');
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRecording && recordingStartedAt) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAt) / 1000);
        setElapsedTime(elapsed);
        if (elapsed > 165) {
          setIsRecording(false);
          setRecordingCompleted(true);
          setStatusMessage('Recording completed! Saved to local-demo-output/breathe-wise-demo.webm');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingStartedAt]);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingCompleted(false);
      setRecordingStartedAt(Date.now());
      setElapsedTime(0);
      setStatusMessage('Launching local Playwright Chromium session (1920x1080)...');

      const res = await fetch('/api/local-demo/record', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatusMessage('Browser walkthrough in progress across all 8 scenes. Capturing Full HD viewport...');
      } else {
        setIsRecording(false);
        setStatusMessage(`Launch notice: ${data.message || 'Could not start'}`);
      }
    } catch (err: any) {
      console.error(err);
      setIsRecording(false);
      setStatusMessage(`Error triggering recording: ${err?.message || 'Server error'}`);
    }
  };

  const scenes = [
    { num: 'Scene 1', title: 'Introduction', time: '10–15s', desc: 'Breathe Wise branding, tagline, and Prana overview.' },
    { num: 'Scene 2', title: 'Air Quality Dashboard', time: '20–25s', desc: 'Live Open-Meteo AQI, 6 pollutants grid, 24h diurnal curve.' },
    { num: 'Scene 3', title: 'Prana (प्राण) AI Assistant', time: '30–35s', desc: 'Live question to Gemini with complete responsive answers.' },
    { num: 'Scene 4', title: 'Personalized Daily Planner', time: '20s', desc: 'Circadian schedule adapted for Family with Children persona.' },
    { num: 'Scene 5', title: 'Indoor Air Quality Advisor', time: '20s', desc: 'Dwelling diagnostic & honest science check on houseplants.' },
    { num: 'Scene 6', title: 'Sustainable Alternatives', time: '20s', desc: 'Interactive commute comparator slider & lower-emission swaps.' },
    { num: 'Scene 7', title: 'Impact Tracker', time: '20s', desc: 'Logged choices, avoided CO₂ & PM2.5, green streak, clean points.' },
    { num: 'Scene 8', title: 'Closing', time: '10s', desc: 'Community impact mission and final Breathe Wise tagline.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold border border-amber-300/50">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Development Mode Only • Isolated from Production</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Automated Demo & Video Recording Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Creates a professional, continuous 1920×1080 full-viewport recording of Breathe Wise using local Playwright browser automation for hackathon evaluation videos.
            </p>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all cursor-pointer whitespace-nowrap ${
              isRecording
                ? 'bg-amber-600 animate-pulse cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:scale-105 hover:shadow-emerald-950/40'
            }`}
          >
            {isRecording ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording Walkthrough ({elapsedTime}s)...</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5 text-emerald-300" />
                <span>Start Demo Recording</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-amber-500 animate-ping' : recordingCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {statusMessage}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Est. Duration: ~2.5 mins
            </span>
          </div>
        </div>
      </div>

      {/* Output Destination Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-900/10 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Folder className="w-4 h-4 text-emerald-600" />
          Local Output Destination
        </h3>
        <p className="text-xs text-slate-500">
          The automated session saves directly into your desktop project folder and is automatically excluded from Git:
        </p>

        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs text-emerald-900 dark:text-emerald-300 break-all select-all">
          C:\Users\Samhith V Gupta\Desktop\Breathe-Wise\local-demo-output\breathe-wise-demo.webm
        </div>
      </div>

      {/* 8-Scene Sequence Blueprint */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-600" />
          Automated Walkthrough Blueprint (8 Scenes)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {scenes.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-[11px]">
                  {s.num}: {s.title}
                </span>
                <span className="text-slate-400 font-semibold">{s.time}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
