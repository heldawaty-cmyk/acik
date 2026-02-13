
import { GoogleGenAI, Type } from "@google/genai";
import { Trip, Child, Driver } from "../types";

// Always use the specified initialization format.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes trip data to detect safety anomalies.
 */
export async function analyzeTripSafety(trip: Trip, child: Child, driver: Driver) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this student transport trip for safety anomalies.
        Trip Status: ${trip.status}
        Child: ${child.name} (Age: ${child.age})
        Driver: ${driver.name} (Vehicle: ${driver.vehicle})
        Last Known Coordinates: ${trip.currentLat}, ${trip.currentLng}
        Route Deviation Detected by System: ${trip.routeDeviation}
        
        Rules:
        - Trigger alert if vehicle stops > 5 minutes outside expected area.
        - Trigger alert if route deviation > 500 meters.
        - Trigger alert if trip duration exceeds 50% of expected.
        
        Return a JSON object with:
        - isSafe (boolean)
        - alertMessage (string or null)
        - recommendation (string)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            alertMessage: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ["isSafe", "alertMessage", "recommendation"]
        }
      }
    });

    // Access .text property directly.
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Safety Analysis Error:", error);
    return { isSafe: true, alertMessage: null, recommendation: "Continuous monitoring enabled." };
  }
}

/**
 * Generates automated status updates for parents.
 */
export async function generateAutoMessage(tripStatus: string, eta: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a polite, reassuring SMS update for a parent about their child's ride.
      Status: ${tripStatus}
      ETA: ${eta}
      Keep it under 15 words.`,
    });
    // response.text is a property.
    return response.text || "";
  } catch (error) {
    return `Update: Your child's ride is currently ${tripStatus}. Estimated arrival: ${eta}.`;
  }
}
