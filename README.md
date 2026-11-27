# Breathe Wise — Powered by Prana (प्राण)

> **"Breathe Better. Live Better."**
> 
> *Know Your Air. Trust Prana. Breathe Wise.*

---

## 🌿 Project Overview

**Breathe Wise** is an intelligent urban air-quality and environmental health companion designed to help individuals, families, and communities make healthier, proactive daily decisions in polluted environments.

Powered by **Prana (प्राण)**—an intelligent environmental AI assistant—Breathe Wise bridges the gap between complex atmospheric science and practical daily living. It translates real-time sensor metrics into tailored routines, demystifies indoor air quality, calculates personal carbon and PM reductions, and assists users in navigating cleaner urban paths.

---

## ✨ Primary Features

### 1. 📊 Real-Time Air Quality Dashboard
- **Live atmospheric monitoring:** US AQI, European AQI, PM2.5, PM10, Ground-Level Ozone ($O_3$), Nitrogen Dioxide ($NO_2$), Carbon Monoxide ($CO$), and Sulphur Dioxide ($SO_2$).
- **No fabricated metrics:** Directly integrated with the open-access Open-Meteo Air Quality API and Copernicus Atmosphere Monitoring Service (CAMS). Clear timestamps and attribution.
- **Location flexibility:** Instant multi-city search (Open-Meteo Geocoding), 1-click popular global hubs, and optional browser geolocation.
- **24-Hour Diurnal Forecast:** Interactive area chart showing projected hourly AQI and PM2.5 trajectories.
- **4 Immediate Safety Indicators:** Outdoor jogging safety, N95 respirator advisory, window ventilation safety, and HEPA air purifier guidance.

### 2. 🧠 Prana (प्राण) — AI Air Quality Assistant
- **Context-aware intelligence:** Ingests live location, current AQI, pollutant ratios, time of day, and demographic profile.
- **Scientific rigor:** Explains *why* recommendations matter (alveolar particulate penetration, morning temperature inversions, ozone photochemical peaks).
- **Evidence-based myth-busting:** Honest science on houseplants vs mechanical filtration.
- **Dual-mode architecture:**
  - **Live Google Gemini 1.5 Flash:** Secure server-side execution via `/api/prana/chat`.
  - **Prana Autonomous Heuristic Engine:** Instant, zero-latency fallback when an external API key is unconfigured or offline.
- Accessible both as a dedicated full-page experience (`/assistant`) and as a floating quick-access modal from any screen.

### 3. 📅 Personalized Chrono-Planner
- Tailored schedules for 6 demographic personas:
  - 💼 **Working Professional**
  - 🎓 **College Student**
  - 🎒 **School Student**
  - 🧓 **Senior Citizen**
  - 👨‍👩‍👧 **Family with Children**
  - 👷 **Outdoor Worker**
- Chronological timeline (Morning, Mid-Day, Afternoon, Evening, Night) with low-risk windows and actionable health tips.

### 4. 🏡 Indoor Air Quality (IAQ) Advisor
- Interactive micro-environment diagnostic: room layout, street exposure, cooking ventilation, HEPA purifiers, and incense use.
- Real-time indoor risk index calculation.
- Evidence-based analysis comparing active mechanical HEPA filtration against houseplants.

### 5. 🚲 Sustainable Alternatives & Commute Comparator
- Interactive Commute Comparator: slide distance (2–50 km) to compare CO₂ and PM emissions across Petrol Cars, Metro Rail, Electric Vehicles, and Active Cycling/Walking.
- Transparent calculation models based on EPA and ARAI vehicle averages.
- Structured catalog of actionable lifestyle swaps.

### 6. 📈 Environmental Impact Tracker
- Log everyday clean choices: Metro commutes, cycling/walking, carpooling, power conservation, and anti-idling.
- Cumulative metrics: avoided CO₂ (kg), particulate matter prevented (g), active green streak, and clean air points.
- 7-day progress bar chart and persistent browser storage (`localStorage`).

### 7. 🗺️ Cartographic Pollution Map
- Interactive Leaflet + OpenStreetMap engine.
- Visualizes regional monitoring nodes and atmospheric dispersion radiuses.
- **Cleaner Route Simulator:** Compare high-exposure highway corridors with tree-canopied low-exposure alternatives.
- Transparent data fidelity disclosure.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript (Strict Typing) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Animations** | Framer Motion & CSS Micro-Interactions |
| **Charts** | Recharts (AreaChart, BarChart) |
| **Maps** | Leaflet & OpenStreetMap |
| **AI Intelligence** | Google Gemini API (`@google/generative-ai`) + Prana Autonomous Engine |
| **Air Quality API** | Open-Meteo Air Quality & Geocoding API (Free, zero-key required) |
| **State & Persistence** | React Context API + LocalStorage |

---

## 📁 Project Directory Structure

```text
C:\Users\<USER>\Desktop\Breathe-Wise/
├── .env.example              # Template for environment configuration
├── .env.local                # Local environment variables (git-ignored)
├── .gitignore                # Git exclusions (node_modules, .env*, .next)
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript compiler settings
├── next.config.ts            # Next.js App Router configuration
├── public/                   # Static assets and icons
└── src/
    ├── app/                  # Next.js App Router pages & API routes
    │   ├── api/prana/chat/   # Secure server-side route for Prana & Gemini
    │   ├── assistant/        # Dedicated Prana AI assistant page
    │   ├── dashboard/        # Real-time air quality monitoring page
    │   ├── impact/           # Environmental Impact Tracker page
    │   ├── indoor/           # Indoor Air Quality Advisor page
    │   ├── map/              # Leaflet Pollution & Station Map page
    │   ├── planner/          # Personalized Daily Chrono-Planner page
    │   ├── sustainable/      # Sustainable Alternatives page
    │   ├── globals.css       # Tailwind 4 design system & theme tokens
    │   ├── layout.tsx        # Global AppProvider, Navbar, Footer, Modal
    │   └── page.tsx          # Landing page (Hero, Features, How It Works)
    ├── components/
    │   ├── dashboard/        # AQIOverviewCard, LocationSearch, PollutantGrid, etc.
    │   ├── impact/           # ImpactTrackerView, Recharts bar chart, modal
    │   ├── indoor/           # IndoorAdvisorView, IAQ risk diagnostic
    │   ├── landing/          # HeroSection, FeaturesSection, HowItWorks, Visualizer
    │   ├── layout/           # Navbar, Footer
    │   ├── map/              # PollutionMapView (dynamic Leaflet renderer)
    │   ├── planner/          # DailyPlannerView, Persona selector
    │   └── prana/            # PranaChatView, PranaAssistantModal
    ├── context/
    │   └── AppContext.tsx    # Central state provider (location, AQI, impact, persona)
    ├── services/
    │   └── airQualityApi.ts  # Open-Meteo Air Quality & Geocoding API client
    └── types/
        ├── airQuality.ts     # Pollutant details, AQI summary interfaces
        ├── impact.ts         # Log entries, actions, metrics interfaces
        └── prana.ts          # Chat messages, personas, context payload types
```

---

## 🚀 Setup & Local Development

### Prerequisites
- **Node.js**: v18.18+ or v20+ (Node v24.22+ recommended)
- **npm**: v9+ (npm 11+ recommended)

### 1. Installation
Navigate into the desktop project directory:
```bash
cd "C:\Users\<CURRENT_USER>\Desktop\Breathe-Wise"
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Google Gemini API Key for Prana AI Assistant
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Default Location Coordinates (Bengaluru, India)
NEXT_PUBLIC_DEFAULT_LAT=12.9716
NEXT_PUBLIC_DEFAULT_LON=77.5946
NEXT_PUBLIC_DEFAULT_CITY=Bengaluru
```

> **Note:** If `GEMINI_API_KEY` is not provided, Breathe Wise will seamlessly operate via **Prana's Autonomous Heuristic Engine**, answering questions with verified atmospheric logic without errors.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
To test the production build:
```bash
npm run build
npm start
```

---

## 🌐 External APIs & Data Sources

1. **Open-Meteo Air Quality API**
   - **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`
   - **Metrics:** US AQI, European AQI, PM2.5, PM10, $O_3$, $NO_2$, $CO$, $SO_2$.
   - **Authentication:** Public, no API key required.

2. **Open-Meteo Geocoding API**
   - **Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`
   - **Authentication:** Public, no API key required.

3. **Google Gemini API**
   - **Model:** `gemini-1.5-flash`
   - **Provider:** Google AI Studio (`@google/generative-ai`)
   - **Obtain Key:** [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Cartography & Tiles**
   - **Engine:** Leaflet.js
   - **Tiles:** OpenStreetMap contributors (`https://tile.openstreetmap.org`)

---

## ☁️ Deployment Instructions (Vercel)

1. Push the project repository to GitHub or GitLab (ensure `.env.local` remains ignored).
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API Key)*
   - `NEXT_PUBLIC_DEFAULT_LAT`: `12.9716`
   - `NEXT_PUBLIC_DEFAULT_LON`: `77.5946`
   - `NEXT_PUBLIC_DEFAULT_CITY`: `Bengaluru`
6. Click **Deploy**. Vercel will build and launch Breathe Wise globally.

---

## 🔒 Scientific Disclaimer & Ethics

- **Zero Fabricated Live Data:** Breathe Wise never fabricates sensor measurements or presents mock live feeds. If a sensor node is unreachable, the system displays an explicit unavailable or calibration notice.
- **Preventative Health Only:** Prana (प्राण) provides preventative environmental advisories based on atmospheric models and exposure sciences. Prana is an AI environmental companion, not a certified medical diagnostician. For persistent respiratory distress, chest tightness, or clinical symptoms, always consult a qualified physician.

---

*Breathe Wise — Powered by Prana (प्राण).*  
*Breathe Better. Live Better.*
