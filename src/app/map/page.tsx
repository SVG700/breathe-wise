import React from 'react';
import PollutionMapView from '@/components/map/PollutionMapView';

export const metadata = {
  title: 'Cartographic Pollution Map — Breathe Wise',
  description: 'Interactive OpenStreetMap exploration of regional air quality monitoring stations and low-exposure paths.',
};

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PollutionMapView />
    </div>
  );
}
