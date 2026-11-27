'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { PranaMessage, UserPersona } from '@/types/prana';
import { 
  Send, 
  Sparkles, 
  RefreshCcw, 
  User, 
  Bot, 
  MapPin, 
  Activity, 
  ShieldAlert, 
  Info,
  Copy,
  Check
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Is it safe to go jogging today?',
  'How can I protect my family from today\'s pollution?',
  'What should I do if my room feels polluted?',
  'Should I open my windows today?',
  'What is the safest time to go outside?',
  'Give me a low-pollution daily routine.',
  'How can I reduce my contribution to air pollution?'
];

const PERSONA_LABELS: Record<UserPersona, { title: string; icon: string }> = {
  'working-professional': { title: 'Working Professional', icon: '💼' },
  'college-student': { title: 'College Student', icon: '🎓' },
  'school-student': { title: 'School Student', icon: '🎒' },
  'senior-citizen': { title: 'Senior Citizen', icon: '🧓' },
  'family': { title: 'Family with Children', icon: '👨‍👩‍👧' },
  'outdoor-worker': { title: 'Outdoor Worker', icon: '👷' }
};

export default function PranaChatView() {
  const { location, airQuality, persona, setPersona } = useApp();
  const [messages, setMessages] = useState<PranaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with personalized welcome message from Prana
  useEffect(() => {
    if (messages.length === 0) {
      const aqi = airQuality?.summary.usAqi ?? 65;
      const severity = airQuality?.summary.severityLevel ?? 'Moderate';
      const cityName = location.name;

      const welcomeMsg: PranaMessage = {
        id: 'welcome',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Namaste! I am **Prana (प्राण)**, your intelligent air-quality and environmental companion for **${cityName}**.\n\n` +
          `Right now, the air quality index in ${cityName} is **${aqi} (${severity})** with PM2.5 at **${airQuality?.pollutants.pm25.value ?? '--'} µg/m³**.\n\n` +
          `I am calibrated for your persona as a **${PERSONA_LABELS[persona].icon} ${PERSONA_LABELS[persona].title}**. How can I help you breathe easier and make smarter decisions today?`,
        metadata: {
          modelUsed: 'Prana Intelligence System',
          isFallback: false
        }
      };
      setMessages([welcomeMsg]);
    }
  }, [airQuality, location.name, persona, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: PranaMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const contextPayload = {
        location: `${location.name}, ${location.admin1 || ''} ${location.country || ''}`.trim(),
        coordinates: { lat: location.latitude, lon: location.longitude },
        aqi: airQuality?.summary.usAqi ?? 70,
        severity: airQuality?.summary.severityLevel ?? 'Moderate',
        pollutants: {
          pm25: airQuality?.pollutants.pm25.value ?? 25,
          pm10: airQuality?.pollutants.pm10.value ?? 45,
          o3: airQuality?.pollutants.ozone.value ?? 40,
          no2: airQuality?.pollutants.nitrogenDioxide.value ?? 20,
          co: airQuality?.pollutants.carbonMonoxide.value ?? 300,
        },
        timeOfDay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona
      };

      const res = await fetch('/api/prana/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: contextPayload,
          history: messages.slice(-4)
        })
      });

      if (!res.ok) {
        throw new Error(`Prana response error: ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: PranaMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: data.metadata
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Prana chat failure:', err);
      const errorMsg: PranaMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered a momentary communication glitch while processing that request: ${err?.message || 'Server error'}. Please try again or ask another question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: { isFallback: true }
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-emerald-900/10 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Top Context & Persona Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-emerald-900/10 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            प्राण
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Prana (प्राण)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/50">
                Environmental Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> {location.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-600" /> AQI {airQuality?.summary.usAqi ?? '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Persona Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Persona:</label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as UserPersona)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            {Object.entries(PERSONA_LABELS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.icon} {item.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm mt-0.5">
                  प्राण
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                  isAssistant
                    ? 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'bg-emerald-800 text-white rounded-br-none shadow-md'
                }`}
              >
                {/* Content formatting with paragraph & bullet rendering */}
                <div className="space-y-2 whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Metadata & Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] opacity-70">
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.metadata?.modelUsed && (
                      <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {msg.metadata.modelUsed}
                      </span>
                    )}
                  </div>
                  {isAssistant && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="hover:opacity-100 flex items-center gap-1 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex-shrink-0 flex items-center justify-center text-xs shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm animate-pulse">
              प्राण
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 font-medium ml-1">
                Prana is analyzing live atmospheric parameters...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="bg-white/80 dark:bg-slate-900/80 px-4 py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Quick Ask:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs whitespace-nowrap bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-emerald-900/10 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Prana about ${location.name}'s air, precautions, or daily choices...`}
          disabled={isLoading}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-semibold text-sm shadow-md shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
