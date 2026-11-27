import React from 'react';
import LocationSearch from '@/components/dashboard/LocationSearch';
import AQIOverviewCard from '@/components/dashboard/AQIOverviewCard';
import HourlyForecastChart from '@/components/dashboard/HourlyForecastChart';
import PollutantGrid from '@/components/dashboard/PollutantGrid';
import HealthAdvisories from '@/components/dashboard/HealthAdvisories';

export const metadata = {
  title: 'Air Quality Dashboard — Breathe Wise',
  description: 'Real-time urban air quality readings, PM2.5 concentrations, and health precautions.',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* City Search Bar & Geolocation */}
      <LocationSearch />

      {/* Main AQI Gauge & Summary Card */}
      <AQIOverviewCard />

      {/* 24-Hour Diurnal Projection Curve */}
      <HourlyForecastChart />

      {/* 6 Key Atmospheric Pollutants Grid */}
      <PollutantGrid />

      {/* Tailored Demographic Health Advisories */}
      <HealthAdvisories />
    </div>
  );
}
