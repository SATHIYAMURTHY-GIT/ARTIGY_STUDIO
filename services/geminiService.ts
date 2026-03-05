import { GoogleGenAI } from "@google/genai";

const env = (import.meta as ImportMeta & {
  env: {
    VITE_GEMINI_API_KEY?: string;
  };
}).env;

export class GeminiArtService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.VITE_GEMINI_API_KEY || '' });
  }

  async transformToPencilSketch(base64Data: string, mimeType: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: 'Convert this image into a detailed, high-quality professional pencil sketch. Use fine graphite lines, soft shading, and white paper background. Ensure it looks like authentic hand-drawn art.',
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error('Failed to generate pencil sketch');
  }
}

export const geminiService = new GeminiArtService();
