'use client';

import React from 'react';
import Link from 'next/link';
import { Video } from 'lucide-react';

export default function LocalDemoLauncher() {
  // Never render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Link
      href="/local-demo"
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-950 text-white text-xs font-bold rounded-full shadow-xl border border-emerald-500/40 backdrop-blur-md transition-all hover:scale-105 group"
      title="Open Local Demo & Recording Controller (Dev Only)"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <Video className="w-4 h-4 text-emerald-400" />
      <span>Start Demo Recording</span>
    </Link>
  );
}
