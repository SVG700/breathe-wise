import React from 'react';
import SustainableAlternativesView from '@/components/sustainable/SustainableAlternativesView';

export const metadata = {
  title: 'Sustainable Alternatives — Breathe Wise',
  description: 'Lower-emission everyday commute and lifestyle alternatives with transparent carbon calculation models.',
};

export default function SustainablePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SustainableAlternativesView />
    </div>
  );
}
