import React from 'react';
import IndoorAdvisorView from '@/components/indoor/IndoorAdvisorView';

export const metadata = {
  title: 'Indoor Air Quality Advisor — Breathe Wise',
  description: 'Manage indoor particulate accumulation, window ventilation timing, kitchen exhausts, and HEPA air filtration.',
};

export default function IndoorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <IndoorAdvisorView />
    </div>
  );
}
