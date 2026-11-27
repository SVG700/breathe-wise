import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt setting Prana's personality, scientific rigor and safety boundaries
const PRANA_SYSTEM_INSTRUCTION = `
You are Prana (प्राण), the intelligent urban air-quality and environmental health companion powering the application "Breathe Wise".
Tagline: "Breathe Better. Live Better."

CORE SCIENTIFIC & ACCURACY DIRECTIVES:
1. Identity:
   - You are scientifically rigorous, empathetic, calm, and actionable. You help individuals, families, and communities make healthier daily decisions in polluted urban environments.
   - Do NOT provide medical diagnoses or prescribe medications. For severe respiratory, cardiovascular, or persistent symptoms, always advise consulting a qualified healthcare professional.
   - Clarify common wellness myths: ordinary houseplants do NOT substitute for mechanical HEPA air filtration for PM2.5/PM10 particulate removal, though they offer aesthetic and minor VOC benefits.

2. Safest Outdoor Time Recommendations:
   - NEVER declare a specific time of day (e.g. "11 AM–3 PM" or "late evening") to be the safest window without verified hourly air-quality forecast data.
   - When hourly forecast data is provided in the context, compare projected concentrations across PM2.5, PM10, NO2, and Ozone (O3) relative to the user's requested activity and its duration. Only recommend a window when supported by actual lower projected concentrations in the data.
   - If hourly forecast data is unavailable, clearly state that verified hourly forecast data is unavailable for this location and that any advice is general guidance rather than a verified forecast.

3. Health Guidance & Activity Suitability:
   - Do NOT declare outdoor exercise, running, or jogging safe based solely on PM2.5. Synthesize the overall AQI and all available pollutant readings (PM2.5, PM10, NO2, O3, CO).
   - Distinguish verified ground-monitoring sensor observations (e.g. OpenAQ / CPCB stations) from model-based simulations/forecasts (e.g. Open-Meteo / Copernicus CAMS).
   - NEVER label model-based data as a ground-station measurement.
   - Do not invent or assume pollution peaks, photochemical reactions, or traffic patterns without supporting data in the context.
   - Explain uncertainty when measurements are missing, estimated, or stale (>24 hours old).

4. Indoor Ventilation Guidance:
   - Do NOT automatically recommend opening windows based on assumed traffic slowdowns or generic times of day.
   - Base ventilation advice strictly on: current outdoor AQI, indoor IAQ context, nearby outdoor pollution sources, and data freshness.
   - If outdoor AQI is moderate or elevated (>50–70), advise checking outdoor air conditions first, avoiding street-facing windows during heavy traffic, and prioritizing mechanical HEPA air filtration.

5. Data Transparency & Attribution:
   - Always reference measurement timestamps, data source, and pollutant units (e.g., µg/m³) when available.
   - Clearly state whether data is fresh, stale, or estimated.

6. Persona Adaptation:
   - Working Professional: Provide concise, pragmatic recommendations tailored to daily office transit, indoor workday air, and lunch/evening outdoor routines.
   - School Student / Family: Highlight developing lung vulnerability, school commute protection, and bedroom filtration.
   - Senior Citizen: Emphasize respiratory/cardiovascular strain avoidance and safe indoor recovery.
   - Outdoor Worker: Focus on prolonged exposure reduction, proper N95 respirator fit, and hydration.
`;

const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash'
];

function generateHeuristicResponse(
  question: string,
  context: any
): string {
  const aqi = context?.aqi || 75;
  const severity = context?.severity || 'Moderate';
  const location = context?.location || 'Bengaluru';
  const pm25 = context?.pollutants?.pm25 ?? 25;
  const pm10 = context?.pollutants?.pm10;
  const o3 = context?.pollutants?.o3;
  const no2 = context?.pollutants?.no2;
  const persona = context?.persona || 'working-professional';
  const station = context?.station;
  const hourlyForecast: any[] = Array.isArray(context?.hourlyForecast) ? context.hourlyForecast : [];
  const sourceAttribution = station?.source || context?.sourceAttribution || 'Open-Meteo Copernicus Atmospheric Model';
  const isModelData = station ? station.source?.toLowerCase().includes('model') : !(context?.isRealTime);
  const lastUpdated = station?.lastUpdated || context?.lastUpdated || 'Recent';
  const isStale = station?.freshnessStatus?.toLowerCase().includes('outdated') || 
    (station?.lastUpdated && (Date.now() - new Date(station.lastUpdated).getTime() > 86400000));

  const qLower = question.toLowerCase();

  // Helper for persona-specific closing advice
  const getPersonaTip = () => {
    switch (persona) {
      case 'working-professional':
        return `💼 **Working Professional Note:** Keep office commutes low-exposure by using electrified transit (Metro) or vehicle AC recirculation. Schedule outdoor lunch walks only when outdoor air quality is visibly clear.`;
      case 'school-student':
      case 'family':
        return `👨‍👩‍👧 **Family & Child Health Note:** Developing lungs inhale 50% more air per kg of body weight. Ensure children avoid strenuous exertion along heavy traffic routes.`;
      case 'senior-citizen':
        return `🧓 **Senior Citizen Note:** Cardiovascular pathways are especially vulnerable to fine particle irritation. When AQI is moderate or above, favor indoor stretching or walks in green buffered parks.`;
      case 'outdoor-worker':
        return `👷 **Outdoor Worker Note:** Long-duration roadside exposure accumulates significantly. Wear a fitted N95 respirator during shifts and maintain frequent hydration.`;
      default:
        return `🌱 **Personalized Note:** Stay situationally aware of localized dust and vehicle emissions as you go about your day.`;
    }
  };

  // 1. Station-specific inquiry
  if (station) {
    const stationAqi = station.cpcbAqi?.aqi ?? station.cpcbAqi ?? aqi;
    const stationCategory = station.cpcbAqi?.category ?? station.cpcbCategory ?? severity;
    const dataSourceType = isModelData ? 'Atmospheric Model Simulation (Copernicus CAMS)' : 'Physical Ground Monitoring Sensor (CPCB / OpenAQ)';

    let responseText = `**Prana (प्राण) Station Assessment for ${station.name}:**\n\n` +
      `📍 **Location & Network:** ${station.locality || location} (${station.distanceKm != null ? `${station.distanceKm} km away` : 'Selected Coordinates'}).\n` +
      `📡 **Data Source & Type:** **${station.source}** — *${dataSourceType}* (Provider: ${station.provider || 'CPCB/OpenAQ'}).\n` +
      `📊 **Air Quality Index:** **AQI ${stationAqi} (${stationCategory})**${station.cpcbAqi?.isOfficial ? ' — Official CPCB NAQI (multiple monitored parameters)' : ' — Indicative Sub-Index'}.\n` +
      `⏱️ **Timestamp:** Recorded at ${lastUpdated}.\n\n`;

    if (isStale) {
      responseText += `⚠️ **Data Staleness Advisory:** Measurements from this station are older than 24 hours (recorded ${lastUpdated}). Atmospheric conditions may have changed significantly due to localized weather and traffic. Treat these values as historical baseline context rather than real-time conditions.\n\n`;
    }

    if (qLower.includes('run') || qLower.includes('jog') || qLower.includes('exercise')) {
      if (stationAqi <= 50) {
        responseText += `🏃 **Running Suitability:** **Optimal.** Overall air quality index is ${stationAqi} (Good) with PM2.5 at ${station.measurements?.pm25?.value ?? pm25} µg/m³. Safe for outdoor cardio across all groups.\n\n`;
      } else if (stationAqi <= 100) {
        responseText += `🏃 **Running Suitability:** **Acceptable with Moderation.** Overall AQI is ${stationAqi} (${stationCategory}). While healthy adults can engage in outdoor cardio, sensitive individuals should monitor for throat or airway irritation.\n\n`;
      } else {
        responseText += `🛑 **Running Suitability:** **Not Recommended Outdoors.** At AQI ${stationAqi} (${stationCategory}), deep aerobic breathing pulls fine particulates and gaseous irritants into pulmonary alveoli. Move workout indoors.\n\n`;
      }
    } else {
      responseText += `🔬 **Pollutant Observations:**\n` +
        `• PM2.5: ${station.measurements?.pm25?.value != null ? `${station.measurements.pm25.value} µg/m³ (measured)` : `${pm25} µg/m³ (estimated)`}\n` +
        `• PM10: ${station.measurements?.pm10?.value != null ? `${station.measurements.pm10.value} µg/m³` : (pm10 != null ? `${pm10} µg/m³` : 'Not recorded')}\n` +
        `• NO₂: ${station.measurements?.no2?.value != null ? `${station.measurements.no2.value} µg/m³` : (no2 != null ? `${no2} µg/m³` : 'Not recorded')}\n\n`;
    }

    responseText += `${getPersonaTip()}\n\n*Note: Prana provides preventative environmental guidance based on validated atmospheric standards, not medical diagnosis.*`;
    return responseText;
  }

  // 2. Query about safest outdoor time / when to jog / best time to go outside
  if (qLower.includes('safest time') || qLower.includes('best time') || qLower.includes('when should i') || qLower.includes('when is it safe') || (qLower.includes('time') && (qLower.includes('outdoor') || qLower.includes('jog') || qLower.includes('run') || qLower.includes('walk')))) {
    let responseText = `**Prana (प्राण) Outdoor Time Assessment for ${location}:**\n\n`;

    if (hourlyForecast.length >= 3) {
      // Find the forecast slot with the lowest AQI
      const sortedHours = [...hourlyForecast].sort((a, b) => (a.usAqi || 999) - (b.usAqi || 999));
      const bestSlot = sortedHours[0];

      responseText += `📊 **Verified Hourly Forecast Analysis (Open-Meteo Model):**\n` +
        `Based on predictive atmospheric modeling, the lowest projected pollution window over the next 12 hours is around **${bestSlot.time}** with projected **AQI ${bestSlot.usAqi}** (PM2.5: **${bestSlot.pm25} µg/m³**, O₃: **${bestSlot.ozone} µg/m³**).\n\n` +
        `• **Recommended Window:** If scheduling outdoor activity, **${bestSlot.time}** exhibits the lowest projected particulate burden in the forecast.\n` +
        `• **Pollutant Synthesis:** In addition to PM2.5 (${bestSlot.pm25} µg/m³), ground-level Ozone is projected at ${bestSlot.ozone} µg/m³. When planning a 30–60 minute session, verify live conditions right before starting.\n\n`;
    } else {
      responseText += `⚠️ **Hourly Forecast Data Unavailable:**\n` +
        `Verified hourly air-quality forecast data is currently unavailable for ${location}. Prana will not declare a specific time of day to be the 'safest' window without verified hourly forecast data.\n\n` +
        `• **Current Baseline:** Present atmospheric reading is **AQI ${aqi} (${severity})** with PM2.5 at **${pm25} µg/m³** (${isModelData ? 'Atmospheric Model' : 'Ground Sensor'}, updated: ${lastUpdated}).\n` +
        `• **Scientific Guidance:** Rather than assuming a generic daily window, check live sensor readings immediately prior to outdoor activities, and avoid arterial roads during peak vehicular stagnation.\n\n`;
    }

    responseText += `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
    return responseText;
  }

  // 3. Query about jogging / running / outdoor exercise suitability
  if (qLower.includes('jog') || qLower.includes('run') || qLower.includes('exercise') || qLower.includes('workout') || qLower.includes('outdoor')) {
    const isMultiPollutantElevated = (pm25 > 35) || (pm10 && pm10 > 100) || (o3 && o3 > 100) || (no2 && no2 > 80);
    let responseText = `**Prana (प्राण) Outdoor Exercise Assessment for ${location}:**\n\n` +
      `📊 **Current Atmospheric Status:** **AQI ${aqi} (${severity})** | PM2.5: **${pm25} µg/m³**${pm10 ? ` | PM10: ${pm10} µg/m³` : ''}${o3 ? ` | O₃: ${o3} µg/m³` : ''}\n` +
      `📡 **Source & Type:** ${sourceAttribution} (${isModelData ? 'Atmospheric Model Simulation' : 'Ground-Station Measurement'})\n` +
      `⏱️ **Recorded:** ${lastUpdated}\n\n`;

    if (aqi <= 50 && !isMultiPollutantElevated) {
      responseText += `✅ **Safe for Outdoor Activities.** Overall AQI is Good (${aqi}). Both fine particulate matter (PM2.5: ${pm25} µg/m³) and available secondary pollutants are within safe guidelines.\n\n` +
        `• **Advisory:** Suitable for outdoor cardio, running, and cycling.\n` +
        `• **Precaution:** Note that this assessment reflects current point-in-time conditions. If running near heavy traffic corridors, stay on residential or park paths to minimize direct tailpipe plume inhalation.\n\n`;
    } else if (aqi <= 100 && !isMultiPollutantElevated) {
      responseText += `⚠️ **Acceptable with Precautions.** Overall AQI is Moderate (${aqi}), with PM2.5 at ${pm25} µg/m³.\n\n` +
        `• **Comprehensive Pollutant Check:** Exercise safety cannot be judged solely by PM2.5. Moderate overall AQI indicates secondary pollutant presence (such as coarse dust or traffic gases).\n` +
        `• **Advisory:** Healthy individuals can exercise outdoors, but sensitive groups or individuals with asthma should moderate intensity and keep sessions under 45 minutes.\n` +
        `• **Why it matters:** Aerobic exertion multiplies inhalation volume up to tenfold, increasing pulmonary particulate deposition.\n\n`;
    } else {
      responseText += `🛑 **Outdoor Cardio Not Recommended.** Current AQI is **${aqi} (${severity})**.\n\n` +
        `• **Health Rationale:** Deep aerobic respiration bypasses nasal cilia, depositing fine particulates (PM2.5: ${pm25} µg/m³) deep into pulmonary alveoli and the bloodstream.\n` +
        `• **Actionable Advice:** Move workouts indoors today into a HEPA-filtered space. Try indoor strength training, yoga, or indoor cycling.\n` +
        `• **Alternative:** If outdoor travel is necessary, use a well-fitted N95/FFP2 respirator.\n\n`;
    }

    responseText += `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
    return responseText;
  }

  // 4. Query about windows / ventilation / fresh air
  if (qLower.includes('window') || qLower.includes('ventilat') || qLower.includes('fresh air')) {
    let responseText = `**Prana (प्राण) Indoor Ventilation Guidance for ${location}:**\n\n` +
      `📊 **Outdoor Baseline:** Current AQI is **${aqi} (${severity})**, PM2.5 **${pm25} µg/m³** (${isModelData ? 'Model Simulation' : 'Ground Observation'}, updated: ${lastUpdated}).\n\n`;

    if (aqi <= 50) {
      responseText += `🪟 **Ventilation Favorable with Source Check:**\n` +
        `Outdoor air quality is currently Good (${aqi}). Brief cross-ventilation (15–20 minutes) helps purge indoor carbon dioxide, humidity, and volatile organic compounds (VOCs).\n\n` +
        `• **Contextual Check:** Do not open windows if they directly overlook heavy traffic idling, construction dust, or localized biomass smoke.\n` +
        `• **Best Practice:** Open windows on the sheltered, courtyard, or garden-facing side of the building rather than street-facing windows.\n\n`;
    } else if (aqi <= 100) {
      responseText += `⚠️ **Ventilation with Precaution:**\n` +
        `Ambient outdoor AQI is Moderate (${aqi}). Opening windows should NOT be done automatically based on the time of day or assumed traffic slowdowns.\n\n` +
        `• **Selective Ventilation:** If indoor air feels stuffy, open sheltered windows for only 10–15 minutes, provided outdoor air visually and olfactory appears clean.\n` +
        `• **Primary Recommendation:** For continuous clean air, maintain closed windows and run an active mechanical HEPA air purifier to clean recirculated indoor air without introducing outdoor particulates.\n\n`;
    } else {
      responseText += `🚫 **Keep Windows Closed:**\n` +
        `Outdoor AQI is elevated at **${aqi} (${severity})**. Infiltrating outdoor air will rapidly degrade indoor air quality and elevate particulate levels within 15 minutes.\n\n` +
        `• **Action:** Keep exterior doors and windows sealed. Operate a HEPA air purifier in living and sleeping zones.\n` +
        `• **Kitchen Strategy:** When cooking, use an exhaust fan or chimney that vents directly outside rather than opening windows into living quarters.\n\n`;
    }

    responseText += `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
    return responseText;
  }

  // 5. Family & Child Health Protection
  if (qLower.includes('protect') || qLower.includes('family') || qLower.includes('children') || qLower.includes('kids')) {
    return `**Prana (प्राण) Family Health Protection Guide for ${location}:**\n\n` +
      `📊 Current ambient parameters: AQI **${aqi} (${severity})**, PM2.5 **${pm25} µg/m³** (${sourceAttribution}, recorded ${lastUpdated}).\n\n` +
      `1. **Developing Respiratory Systems:** Children inhale significantly more air per pound of body weight than adults, making them especially vulnerable to particulate inflammation. On days with elevated AQI, avoid open-window vehicles during peak traffic.\n` +
      `2. **Indoor Clean Air Zones:** Focus HEPA air purifiers in bedrooms and study spaces where family members spend the longest uninterrupted hours.\n` +
      `3. **Nutritional & Hydration Support:** Ensure adequate hydration and antioxidant-rich diets (Vitamin C, E, omega-3 fatty acids) to support cellular resilience against urban oxidative stress.\n` +
      `4. **Outdoor Play:** Before scheduling outdoor games or park visits, check current hourly readings rather than assuming the air is clear.\n\n` +
      `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
  }

  // 6. Houseplants myth check
  if (qLower.includes('plant') || qLower.includes('houseplant')) {
    return `**Prana (प्राण) Science Check on Indoor Plants:**\n\n` +
      `🌿 **The Scientific Evidence:**\n` +
      `• **What Houseplants Do:** Indoor plants (such as Snake Plants, Peace Lilies, and Spider Plants) offer mental wellness benefits, help regulate indoor humidity, and can absorb trace chemical vapors (VOCs like benzene) in small, sealed lab chambers.\n` +
      `• **What Houseplants CANNOT Do:** Scientific testing confirms that houseplants **do not remove PM2.5, PM10, or combustion soot from indoor air**. You would require an impossible forest of hundreds of plants per room to equal the filtration rate of a modest mechanical HEPA filter.\n` +
      `• **Recommendation:** Enjoy houseplants for biophilic beauty and calmness, but always use a mechanical HEPA air purifier for true particulate removal.\n\n` +
      `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
  }

  // 7. General baseline response
  return `**Prana (प्राण) Environmental Guidance for ${location}:**\n\n` +
    `📊 **Current Atmospheric State:** **AQI ${aqi} (${severity})**, PM2.5: **${pm25} µg/m³**${pm10 ? `, PM10: ${pm10} µg/m³` : ''}.\n` +
    `📡 **Data Source:** ${sourceAttribution} (*${isModelData ? 'Atmospheric Model Simulation' : 'Ground-Station Measurement'}*), recorded at ${lastUpdated}.\n\n` +
    `• **Actionable Advice:** At AQI ${aqi}, maintain situational awareness. Exercise caution during prolonged outdoor activities, and ensure indoor spaces are protected from infiltration.\n` +
    `• **Hourly Forecast Notice:** ${hourlyForecast.length > 0 ? `Hourly forecast data is active. Ask Prana 'What is the safest time to go outside?' for a forecast-backed window breakdown.` : `Hourly predictive forecast data is currently unavailable for this coordinate; guidance is based on current point-in-time observations.`}\n\n` +
    `${getPersonaTip()}\n\n*Note: Environmental guidance based on atmospheric data; not a medical diagnosis.*`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If API key is missing or placeholder, serve through Prana's autonomous heuristic engine
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const fallbackContent = generateHeuristicResponse(message, context);
      return NextResponse.json({
        content: fallbackContent,
        metadata: {
          modelUsed: 'Prana Autonomous Environmental Engine',
          isFallback: true,
          statusLabel: 'Offline / Autonomous Mode (No GEMINI_API_KEY configured)',
          timestamp: new Date().toISOString(),
        }
      });
    }

    // Try Google Generative AI with resilient model cascade
    let lastError: any = null;
    let successfulReply: string | null = null;
    let successfulModelName: string | null = null;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const hourlyForecastText = Array.isArray(context?.hourlyForecast) && context.hourlyForecast.length > 0
        ? context.hourlyForecast.slice(0, 12).map((h: any) => 
            `  * ${h.time}: US AQI ${h.usAqi}, PM2.5: ${h.pm25} µg/m³, PM10: ${h.pm10 ?? 'N/A'} µg/m³, O₃: ${h.ozone ?? 'N/A'} µg/m³`
          ).join('\n')
        : '  * No verified hourly forecast data available for this query.';

      const contextualPrompt = `
CURRENT USER & ENVIRONMENTAL CONTEXT:
- City / Location: ${context?.location || 'Unknown'} (${context?.coordinates?.lat || 0}, ${context?.coordinates?.lon || 0})
- Current US AQI: ${context?.aqi || 'N/A'} (Severity: ${context?.severity || 'N/A'})
- Pollutants (Units: µg/m³):
  * PM2.5: ${context?.pollutants?.pm25 ?? 'N/A'} µg/m³
  * PM10: ${context?.pollutants?.pm10 ?? 'N/A'} µg/m³
  * Ozone (O3): ${context?.pollutants?.o3 ?? 'N/A'} µg/m³
  * Nitrogen Dioxide (NO2): ${context?.pollutants?.no2 ?? 'N/A'} µg/m³
  * Carbon Monoxide (CO): ${context?.pollutants?.co ?? 'N/A'} µg/m³
- Data Type: ${context?.isRealTime ? 'Real-time Ground Measurement' : 'Atmospheric Model Simulation (Open-Meteo / Copernicus)'}
- Data Source: ${context?.sourceAttribution || 'Open-Meteo Atmospheric Model'}
- Last Recorded / Updated: ${context?.lastUpdated || 'Recent'}
- Current Time of Day: ${context?.timeOfDay || new Date().toLocaleTimeString()}
- User Persona: ${context?.persona || 'General Citizen'}

AVAILABLE HOURLY AIR-QUALITY FORECAST (Next 12 Hours):
${hourlyForecastText}

${context?.station ? `
SPECIFIC MONITORING STATION IN FOCUS:
- Station Name: ${context.station.name} (${context.station.provider || 'Ground Sensor'})
- Data Source: ${context.station.source} (${context.station.source?.toLowerCase().includes('model') ? 'Atmospheric Model Simulation' : 'Physical Ground Monitor'})
- Distance: ${context.station.distanceKm ?? 0} km from target coordinates
- CPCB Calculated AQI / Sub-Index: ${context.station.cpcbAqi || 'N/A'} (${context.station.cpcbCategory || 'N/A'}) - ${context.station.isOfficial ? 'Official 3+ Pollutant NAQI' : 'Indicative Parameter Sub-Index'}
- Station Reported Pollutants: ${JSON.stringify(context.station.measurements || {})}
- Freshness Status: ${context.station.freshnessStatus || context.station.freshness || 'N/A'} (Last Recorded: ${context.station.lastUpdated || 'N/A'})
- Is Stale: ${context.station.freshnessStatus?.toLowerCase().includes('outdated') ? 'YES (>24h old, conditions may have changed)' : 'NO (Current)'}
` : ''}

CONVERSATION HISTORY (Previous interactions):
${Array.isArray(history) && history.length > 0 
  ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Prana'}: ${h.content}`).join('\n')
  : 'None'
}

USER QUESTION:
"${message}"

INSTRUCTIONS FOR PRANA (प्राण):
1. Safest outdoor time: Only recommend a specific time if supported by the hourly forecast above. If hourly forecast is marked 'No verified hourly forecast data available', explicitly state that verified hourly forecast data is unavailable and provide general precautions without declaring any specific hour as safest.
2. Health & Exercise: Do not declare exercise safe based solely on PM2.5. Evaluate overall AQI and all available pollutants.
3. Ventilation: Do not automatically recommend opening windows based on assumed traffic slowdown or time of day; base strictly on outdoor AQI, proximity to roads, and data freshness.
4. Attribution: Clearly distinguish ground sensor measurements from atmospheric model simulations. Note any data staleness.
5. Persona: Provide concise, relevant advice for a ${context?.persona || 'working-professional'}.
`;

      // Cascade across candidate models
      for (const modelName of CANDIDATE_GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: PRANA_SYSTEM_INSTRUCTION
          });

          const result = await model.generateContent(contextualPrompt);
          successfulReply = result.response.text();
          successfulModelName = modelName;
          break; // Succeeded!
        } catch (modelErr: any) {
          lastError = modelErr;
          console.warn(`Gemini model ${modelName} call failed, trying next candidate...`, modelErr?.message || modelErr);
        }
      }

      if (successfulReply && successfulModelName) {
        return NextResponse.json({
          content: successfulReply,
          metadata: {
            modelUsed: `Google Gemini (${successfulModelName})`,
            isFallback: false,
            statusLabel: 'Gemini Neural AI Connected',
            timestamp: new Date().toISOString(),
          }
        });
      }
    } catch (clientErr: any) {
      lastError = clientErr;
      console.warn('Gemini client initialization failed:', clientErr?.message || clientErr);
    }

    // If all candidate models in the cascade failed, gracefully serve the autonomous heuristic response
    const fallbackContent = generateHeuristicResponse(message, context);
    return NextResponse.json({
      content: fallbackContent,
      metadata: {
        modelUsed: 'Prana Autonomous Environmental Engine',
        isFallback: true,
        statusLabel: 'Autonomous Fallback Mode (Gemini API Temporary Unavailable)',
        errorNotice: lastError?.message || 'Temporary Gemini API unavailability; autonomous environmental reasoning applied.',
        timestamp: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    console.error('Prana chat route critical error:', err);
    return NextResponse.json({ error: 'Internal server error processing Prana request' }, { status: 500 });
  }
}
