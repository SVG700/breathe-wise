import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

let isRecordingInProgress = false;
let lastRecordingResult: any = null;

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json({
    isRecording: isRecordingInProgress,
    lastResult: lastRecordingResult
  });
}

export async function POST(req?: NextRequest) {
  void req;
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  if (isRecordingInProgress) {
    return NextResponse.json({ 
      status: 'already_running', 
      message: 'A demo recording session is already running in the background.' 
    });
  }

  const projectDir = 'C:\\Users\\Samhith V Gupta\\Desktop\\Breathe-Wise';
  const scriptPath = path.join(projectDir, 'scripts', 'record-demo.js');

  isRecordingInProgress = true;
  lastRecordingResult = { status: 'running', startedAt: new Date().toISOString() };

  const child = spawn('node', [scriptPath], {
    cwd: projectDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, DEMO_URL: process.env.DEMO_URL || 'http://localhost:3005' }
  });

  child.unref();

  // Watch for completion in background
  setTimeout(() => {
    isRecordingInProgress = false;
    lastRecordingResult = { status: 'completed', finishedAt: new Date().toISOString() };
  }, 160000); // 2.5 minutes timeout guard

  return NextResponse.json({
    status: 'started',
    message: 'Automated demo recording launched successfully on local Chromium.',
    outputPath: 'C:\\Users\\Samhith V Gupta\\Desktop\\Breathe-Wise\\local-demo-output\\breathe-wise-demo.webm'
  });
}
