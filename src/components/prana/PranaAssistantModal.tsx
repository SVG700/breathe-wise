'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import PranaChatView from './PranaChatView';
import { X, Sparkles } from 'lucide-react';

export default function PranaAssistantModal() {
  const { isPranaModalOpen, setIsPranaModalOpen } = useApp();

  return (
    <>
      {/* Floating Action Button (bottom right on all pages) */}
      <button
        onClick={() => setIsPranaModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white rounded-full shadow-2xl shadow-emerald-950/40 hover:scale-105 hover:shadow-emerald-950/60 transition-all border border-emerald-400/30 group"
        aria-label="Open Prana Assistant"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            Ask Prana <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded font-normal text-emerald-200">प्राण</span>
          </span>
          <span className="text-[10px] text-emerald-200 leading-none">Air Intelligence</span>
        </div>
      </button>

      {/* Modal Backdrop and Container */}
      {isPranaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[85vh] max-h-[750px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-900/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-900 to-teal-950 text-white border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-sm text-emerald-200">
                  प्राण
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    Breathe Wise — Prana Assistant
                  </h3>
                  <p className="text-[11px] text-emerald-300">Breathe Better. Live Better.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPranaModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-2 sm:p-4 overflow-hidden">
              <PranaChatView />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
