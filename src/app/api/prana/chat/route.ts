import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt setting Prana's personality, scientific rigor and safety boundaries
const PRANA_SYSTEM_INSTRUCTION = `
You are Prana (प्राण), the intelligent urban air-quality and environmental health companion powering the application "Breathe Wise".
Tagline: "Breathe Better. Live Better."

CORE DIRECTIVES:
1. Identity: You are knowledgeable, empathetic, calm, scientifically accurate, and actionable. You help individuals, families, and communities make healthier daily decisions in polluted urban environments.
2. Scientific Rigor:
   - Distinguish verified sensor measurements from estimates or forecasts.
   - Never fabricate real-time AQI numbers or measurements. Always reference the live environmental context passed to you.
   - Clearly explain *why* each recommendation is made (e.g., explaining alveolar penetration of PM2.5, airway irritation from NO2, or photochemical formation of ground-level Ozone).
   - Clarify common myths: ordinary houseplants do NOT substitute for HEPA air filtration for PM2.5/PM10 particulate removal, though they offer aesthetic and trace VOC benefits.
3. Health & Safety:
   - Do NOT provide medical diagnoses or prescribe medications.
   - For severe respiratory, cardiovascular, or persistent asthma symptoms, always advise consulting a qualified healthcare professional.
   - Provide practical preventative advice (e.g., N95/FFP2 respirator fit, sealing doors/windows during pollution spikes, cooking ventilation, avoiding outdoor exertion during peak traffic/inversion hours).
4. Tone & Formatting:
   - Concise, clear, beautifully formatted with clean bullet points or short paragraphs.
   - Always relate your answer directly to the user's persona (e.g. parent caring for children, senior citizen, athlete/jogger, commuter) and the current location's live AQI and pollutant concentrations.
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
  const pm25 = context?.pollutants?.pm25 || 25;
  const persona = context?.persona || 'working-professional';
  const station = context?.station;
  const qLower = question.toLowerCase();

  let responseText = '';

  // Station-specific inquiry handling
  if (station) {
    const stationAqi = station.cpcbAqi ?? aqi;
    const stationCategory = station.cpcbCategory ?? severity;
    const isModel = station.source?.includes('Model');

    responseText = `**Prana (प्राण) Station Assessment for ${station.name}:**\n\n` +
      `📍 **Location & Source:** ${station.locality || location} (${station.distanceKm ? `${station.distanceKm} km away` : 'Selected Coordinates'}). ` +
      `Data provided by **${station.source}** (${station.provider || 'CPCB/OpenAQ'}).\n` +
      `📊 **Air Quality Index:** **${stationAqi} (${stationCategory})**${station.isOfficial ? ' — Official CPCB NAQI (3+ monitored parameters)' : ' — Indicative Parameter Sub-Index'}.\n` +
      `⏱️ **Freshness:** ${station.freshness || 'Latest available measurement'} (${station.lastUpdated ? new Date(station.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}).\n\n`;

    if (qLower.includes('run') || qLower.includes('jog') || qLower.includes('exercise')) {
      if (stationAqi <= 50) {
        responseText += `🏃 **Running Suitability:** **Optimal.** The air around this station is clean with minimal particulate load. Early mornings or late afternoons are great for outdoor cardio.\n\n`;
      } else if (stationAqi <= 100) {
        responseText += `🏃 **Running Suitability:** **Acceptable with Moderation.** Safe for healthy adults, but sensitive runners or those with mild asthma should limit intense interval training to under 45 minutes.\n\n`;
      } else {
        responseText += `🛑 **Running Suitability:** **Not Recommended Outdoors.** At AQI ${stationAqi}, deep aerobic breathing pulls significant fine particles (PM2.5) deep into pulmonary alveoli. Shift your workout indoors today.\n\n`;
      }
    } else {
      responseText += `🔬 **Atmospheric Breakdown:**\n` +
        `• Primary particulate level: ${station.measurements?.pm25?.value ? `${station.measurements.pm25.value} µg/m³ PM2.5` : `${pm25} µg/m³ estimated`}.\n` +
        `• ${isModel ? 'Atmospheric reanalysis estimates show ambient urban particulate concentration.' : 'Direct ground sensor observations reflect localized tailpipe and street-level exposure.'}\n` +
        `• **Precautionary Guide:** ${stationAqi > 100 ? 'Wear an N95 respirator if walking along busy corridors nearby, and keep windows closed during peak commute hours.' : 'Normal outdoor activities are safe; stay hydrated.'}\n\n`;
    }

    responseText += `*Note: Prana provides preventative environmental guidance based on validated atmospheric standards, not medical diagnosis.*`;
    return responseText;
  }

  if (qLower.includes('jog') || qLower.includes('run') || qLower.includes('exercise') || qLower.includes('outdoor')) {
    if (aqi <= 50) {
      responseText = `**Prana (प्राण) Outdoor Exercise Assessment for ${location}:**\n\n` +
        `✅ **Safe for Outdoor Activities.** Current AQI is **${aqi} (${severity})** with PM2.5 at **${pm25} µg/m³**.\n\n` +
        `• **Recommended Window:** Mornings and late afternoons are optimal right now.\n` +
        `• **Why it matters:** Particulate levels are within WHO target limits, minimizing alveolar inflammation.\n` +
        `• **Sustainable tip:** Consider running or cycling along tree-canopied residential roads away from heavy arterial traffic.`;
    } else if (aqi <= 100) {
      responseText = `**Prana (प्राण) Outdoor Exercise Assessment for ${location}:**\n\n` +
        `⚠️ **Acceptable with Precautions.** Current AQI is **${aqi} (${severity})** with PM2.5 at **${pm25} µg/m³**.\n\n` +
        `• **Advisory:** Healthy adults can exercise outdoors, but if you have mild asthma, allergies, or are a senior citizen, keep sessions under 45 minutes.\n` +
        `• **Safest Time:** Shift intense cardio workouts to midday when atmospheric dispersion is higher, rather than early morning temperature inversions.\n` +
        `• **Why it matters:** Moderate PM2.5 can still trigger airway tightness during deep aerobic breathing.`;
    } else {
      responseText = `**Prana (प्राण) Outdoor Exercise Assessment for ${location}:**\n\n` +
        `🛑 **Outdoor Cardio Not Recommended.** Current AQI is **${aqi} (${severity})** with PM2.5 at **${pm25} µg/m³**.\n\n` +
        `• **Actionable Advice:** Move workouts indoors today. Try indoor strength training, yoga, or treadmill workouts in a filtered room.\n` +
        `• **Why it matters:** During aerobic exercise, your minute ventilation rate increases up to 10-fold, pulling unfiltered particulate matter deep into your lung alveoli and bloodstream.\n` +
        `• **Alternative:** If commuting outside is unavoidable, wear a properly sealed N95/FFP2 respirator.`;
    }
  } else if (qLower.includes('window') || qLower.includes('ventilat') || qLower.includes('fresh air')) {
    if (aqi <= 70) {
      responseText = `**Prana (प्राण) Ventilation Recommendation for ${location}:**\n\n` +
        `🪟 **Safe to Open Windows.** Current AQI is **${aqi}**.\n\n` +
        `• **Best Strategy:** Cross-ventilate your rooms for 20–30 minutes, ideally between 11:00 AM and 3:00 PM when solar heating disperses ground-level exhaust.\n` +
        `• **Why it matters:** Purges indoor CO2, moisture, and VOCs that accumulate while keeping the space closed.`;
    } else {
      responseText = `**Prana (प्राण) Ventilation Recommendation for ${location}:**\n\n` +
        `🚫 **Keep Windows Closed.** Current AQI is **${aqi} (${severity})**.\n\n` +
        `• **Action:** Seal windows and exterior doors. Use an active HEPA air purifier inside.\n` +
        `• **Kitchen Caution:** When cooking, use an exhaust chimney or range hood that vents directly outdoors, rather than opening street-facing windows.\n` +
        `• **Why it matters:** Outdoor PM2.5 readily penetrates micro-crevices. Opening windows at ${aqi} AQI will degrade indoor air quality within 15 minutes.`;
    }
  } else if (qLower.includes('protect') || qLower.includes('family') || qLower.includes('children') || qLower.includes('kids')) {
    responseText = `**Prana (प्राण) Family Health Protection Guide for ${location}:**\n\n` +
      `Current conditions: AQI **${aqi} (${severity})**, PM2.5 **${pm25} µg/m³**.\n\n` +
      `1. **Children & School Travel:** Children breathe 50% more air per pound of body weight than adults. Ensure school commutes avoid open three-wheelers or open-window buses along congested corridors; provide comfortable child-sized N95 masks if AQI exceeds 120.\n` +
      `2. **Indoor Air Management:** Place a true-HEPA purifier in the children's or family living room. Clean pre-filters bi-weekly.\n` +
      `3. **Hydration & Nutrition:** Ensure regular hydration; antioxidant-rich foods (vitamin C, E, omega-3) help cellular resilience against oxidative stress caused by urban smog.\n` +
      `4. **Why it matters:** Developing lungs are vulnerable to long-term inflammation from fine particles.`;
  } else if (qLower.includes('plant') || qLower.includes('houseplant')) {
    responseText = `**Prana (प्राण) Science Check on Indoor Plants:**\n\n` +
      `🌿 **The Scientific Reality:**\n` +
      `• **What Plants Do:** Plants like Snake Plants, Areca Palms, and Peace Lilies contribute to humidity control, psychological calmness, and absorb trace amounts of benzene or formaldehyde in sealed laboratory tests.\n` +
      `• **What Plants CANNOT Do:** Houseplants **do not remove PM2.5, PM10, or vehicular combustion particles**. You would need hundreds of plants per square meter to match the filtration speed of a modest HEPA air purifier.\n` +
      `• **Actionable Advice:** Keep houseplants for wellness, but always rely on mechanical HEPA filters for true particle filtration.`;
  } else {
    responseText = `**Prana (प्राण) Environmental Guidance for ${location}:**\n\n` +
      `Current atmospheric state: **AQI ${aqi} (${severity})**, with PM2.5 at **${pm25} µg/m³**.\n\n` +
      `• **Persona Focus (${persona.replace('-', ' ')}):** Maintain situational awareness. At ${aqi} AQI, prioritize indoor clean zones for focused work or study.\n` +
      `• **Commute Recommendation:** If traveling, opt for electric public transport or metro. Avoid walking alongside congested choke points during rush hour.\n` +
      `• **Indoor Action:** Ensure cross-ventilation only when ambient PM2.5 dips, and utilize mechanical filtration during evening stagnation hours.\n\n` +
      `*Prana is continuously monitoring atmospheric parameters across ${location} to help you breathe wise.*`;
  }

  return responseText;
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

      const contextualPrompt = `
CURRENT USER & ENVIRONMENTAL CONTEXT:
- City / Location: ${context?.location || 'Unknown'} (${context?.coordinates?.lat || 0}, ${context?.coordinates?.lon || 0})
- Current US AQI: ${context?.aqi || 'N/A'} (Severity: ${context?.severity || 'N/A'})
- Pollutants:
  * PM2.5: ${context?.pollutants?.pm25 || 'N/A'} µg/m³
  * PM10: ${context?.pollutants?.pm10 || 'N/A'} µg/m³
  * Ozone (O3): ${context?.pollutants?.o3 || 'N/A'} µg/m³
  * Nitrogen Dioxide (NO2): ${context?.pollutants?.no2 || 'N/A'} µg/m³
  * Carbon Monoxide (CO): ${context?.pollutants?.co || 'N/A'} µg/m³
- Time of Day: ${context?.timeOfDay || new Date().toLocaleTimeString()}
- User Persona: ${context?.persona || 'General Citizen'}
${context?.station ? `
- SPECIFIC MONITORING STATION IN FOCUS:
  * Station Name: ${context.station.name} (${context.station.provider || 'Ground Sensor'})
  * Data Source: ${context.station.source}
  * Distance: ${context.station.distanceKm ?? 0} km from target coordinates
  * CPCB Calculated AQI / Sub-Index: ${context.station.cpcbAqi || 'N/A'} (${context.station.cpcbCategory || 'N/A'}) - ${context.station.isOfficial ? 'Official 3+ Pollutant NAQI' : 'Indicative Parameter Sub-Index'}
  * Station Reported Pollutants: ${JSON.stringify(context.station.measurements || {})}
  * Freshness Status: ${context.station.freshness || 'N/A'} (Last Recorded: ${context.station.lastUpdated || 'N/A'})
  * Instructions: Explain this station's actual readings, address the user query regarding running/precautions, note whether measurements are recent or historical, and clearly distinguish ground observations from atmospheric models.
` : ''}

CONVERSATION HISTORY (Previous interactions):
${Array.isArray(history) && history.length > 0 
  ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Prana'}: ${h.content}`).join('\n')
  : 'None'
}

USER QUESTION:
"${message}"

Provide a structured, helpful, friendly and scientifically grounded response as Prana (प्राण).
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
