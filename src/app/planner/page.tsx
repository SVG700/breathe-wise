import React from 'react';
import DailyPlannerView from '@/components/planner/DailyPlannerView';

export const metadata = {
  title: 'Personalized Daily Planner — Breathe Wise',
  description: 'AI-powered daily routine schedules calibrated to urban pollution levels and user demographic profile.',
};

export default function PlannerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DailyPlannerView />
    </div>
  );
}
