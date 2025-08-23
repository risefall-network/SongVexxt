import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GenreSuggestion {
  genre: string;
  confidence: number;
  reason: string;
}

export async function analyzeGenre(lyrics: string): Promise<{ suggestions: GenreSuggestion[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music expert specializing in genre classification. Analyze the lyrics and suggest 3 most likely music genres with confidence scores (0-1) and brief reasons. Respond with JSON in this format: { \"suggestions\": [{ \"genre\": \"Pop\", \"confidence\": 0.8, \"reason\": \"Contains accessible themes and simple language\" }] }"
        },
        {
          role: "user",
          content: `Analyze these lyrics and suggest the most likely music genres:\n\n${lyrics}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and sanitize the response
    if (result.suggestions && Array.isArray(result.suggestions)) {
      const validSuggestions = result.suggestions
        .filter((s: any) => s.genre && typeof s.confidence === "number" && s.reason)
        .slice(0, 3)
        .map((s: any) => ({
          genre: s.genre,
          confidence: Math.max(0, Math.min(1, s.confidence)), // Clamp between 0-1
          reason: s.reason
        }));
      
      return { suggestions: validSuggestions };
    }
    
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("AI genre analysis error:", error);
    
    // Return fallback suggestions based on simple analysis
    return {
      suggestions: [
        {
          genre: "Pop",
          confidence: 0.6,
          reason: "Unable to analyze with AI, defaulting to popular genre"
        }
      ]
    };
  }
}