import React from 'react';
import ImpactTrackerView from '@/components/impact/ImpactTrackerView';

export const metadata = {
  title: 'Environmental Impact Tracker — Breathe Wise',
  description: 'Track your personal contributions to urban clean air, avoided CO₂ emissions, and weekly stewardship streaks.',
};

export default function ImpactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ImpactTrackerView />
    </div>
  );
}
