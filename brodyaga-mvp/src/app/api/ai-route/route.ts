import { NextResponse } from "next/server";

import { fallbackAiRoute } from "@/lib/aiRoute";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt?: string };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Нужен запрос для маршрута" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackAiRoute(prompt));
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "Преобразуй запрос о городском исследовании в JSON. Верни только валидный JSON с ключами preferences, summary, challenge. summary и challenge пиши строго на русском, кратко и атмосферно в сталкерском/урбан-вайбе. Явно распознавай режим ходьбы/велосипеда из запроса. Велосипед: приоритет cycleways, asphalt, gravel, quiet streets, riverside, low traffic; избегать stairs, highways, dangerous crossings, mud, excessive elevation. Пешком: разрешать trails, park shortcuts, pedestrian zones, forest paths, narrow passages, stairways; допускается более исследовательский и атмосферный темп. preferences: mood string, transport walking|cycling, avoidHighways boolean, maximizeParks boolean, preferWaterfront boolean, industrialBias number 0-1, stalkerVibe number 0-1, radiusKm number, timeOfDay day|night|any."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "brodyaga_route",
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["preferences", "summary", "challenge"],
              properties: {
                preferences: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "mood",
                    "transport",
                    "avoidHighways",
                    "maximizeParks",
                    "preferWaterfront",
                    "industrialBias",
                    "stalkerVibe",
                    "radiusKm",
                    "timeOfDay"
                  ],
                  properties: {
                    mood: { type: "string" },
                    transport: { type: "string", enum: ["walking", "cycling"] },
                    avoidHighways: { type: "boolean" },
                    maximizeParks: { type: "boolean" },
                    preferWaterfront: { type: "boolean" },
                    industrialBias: { type: "number", minimum: 0, maximum: 1 },
                    stalkerVibe: { type: "number", minimum: 0, maximum: 1 },
                    radiusKm: { type: "number", minimum: 1, maximum: 40 },
                    timeOfDay: { type: "string", enum: ["day", "night", "any"] }
                  }
                },
                summary: { type: "string" },
                challenge: { type: "string" }
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      return NextResponse.json(fallbackAiRoute(prompt));
    }

    const data = (await response.json()) as { output_text?: string };
    const parsed = data.output_text ? JSON.parse(data.output_text) : fallbackAiRoute(prompt);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackAiRoute(prompt));
  }
}
