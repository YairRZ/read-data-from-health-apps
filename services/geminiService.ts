
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ActivityType } from "../types";

export const analyzeFitnessScreenshot = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this fitness app screenshot and extract the activity data. 
            Rules:
            1. Identify the main activity type: Walking, Running, Swimming, Cycling, Strength, Yoga, or Steps.
            2. If 'Steps' or a step count (e.g., '5,432 steps') is visible, prioritize this as the main activity.
            3. If it's a workout session (Run, Cycle, etc.), capture the primary duration (e.g., 45:12) or distance (e.g., 5.2 km).
            4. If the value is a duration like '45:12', convert it to a numeric minutes value (e.g., 45.2) for the primaryValue field, but keep the original unit as 'minutes' or 'hh:mm:ss'.
            5. Extract any other secondary stats like calories, heart rate, or pace into additionalStats.
            6. Provide a short summary.`,
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          activityType: {
            type: Type.STRING,
            description: "One of: Walking, Running, Swimming, Cycling, Strength, Yoga, Steps, Other",
          },
          primaryValue: {
            type: Type.NUMBER,
            description: "The main numeric value (e.g., 5432 for steps, 5.2 for distance)",
          },
          unit: {
            type: Type.STRING,
            description: "The unit of the primary value (e.g., steps, km, miles, minutes)",
          },
          additionalStats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
              },
              required: ["label", "value"],
            },
          },
          summary: {
            type: Type.STRING,
            description: "A 1-sentence recap of the activity",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score from 0 to 1",
          },
        },
        required: ["activityType", "primaryValue", "unit", "summary"],
      },
    },
  });

  const result = JSON.parse(response.text);
  
  // Map string to ActivityType enum
  const activityTypeMap: Record<string, ActivityType> = {
    'Walking': ActivityType.WALKING,
    'Running': ActivityType.RUNNING,
    'Swimming': ActivityType.SWIMMING,
    'Cycling': ActivityType.CYCLING,
    'Strength': ActivityType.STRENGTH,
    'Yoga': ActivityType.YOGA,
    'Steps': ActivityType.STEPS,
  };

  return {
    ...result,
    activityType: activityTypeMap[result.activityType] || ActivityType.OTHER,
  };
};
