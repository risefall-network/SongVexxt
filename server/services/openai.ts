import OpenAI from "openai";

// Using OpenRouter API which provides access to various models including GPT-4o
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
  }
  return new OpenAI({ 
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://songvexxt.replit.app", // Optional: for app identification
      "X-Title": "SongVexxt AI Songwriting Assistant", // Optional: for app identification
    }
  });
}

export async function generateAISuggestions(lyrics: string, context?: string): Promise<{
  nextLines: string[];
  alternativeWords: { word: string; alternatives: string[] }[];
  emotionalTone: string;
}> {
  try {
    const prompt = `
Analyze the following song lyrics and provide songwriting suggestions in JSON format:

Lyrics:
${lyrics}

Context: ${context || "General songwriting"}

Please provide:
1. 3 potential next lines that would fit the rhythm and rhyme scheme
2. Alternative words for the last 3 significant words in the lyrics
3. The emotional tone of the lyrics

Respond with JSON in this format:
{
  "nextLines": ["line1", "line2", "line3"],
  "alternativeWords": [
    {"word": "originalWord", "alternatives": ["alt1", "alt2", "alt3"]},
    {"word": "originalWord2", "alternatives": ["alt1", "alt2", "alt3"]}
  ],
  "emotionalTone": "description of emotional tone"
}
`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert songwriting assistant. Help write better lyrics with rhyme schemes, emotional depth, and creativity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      nextLines: result.nextLines || [],
      alternativeWords: result.alternativeWords || [],
      emotionalTone: result.emotionalTone || "neutral"
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      if (error.code === 'insufficient_quota') {
        throw new Error("OpenAI API quota exceeded. Please check your billing and plan details.");
      } else {
        throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.");
      }
    } else if (error.status === 401) {
      throw new Error("OpenAI API authentication failed. Please check your API key.");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API. Please check your input.");
    }
    
    throw new Error("Failed to generate AI suggestions");
  }
}

export async function generateNextLine(lyrics: string, section: string): Promise<string> {
  try {
    const prompt = `
Given the following lyrics from a ${section} section, generate one line that would naturally follow:

Current lyrics:
${lyrics}

Please provide a single line that:
- Maintains the rhyme scheme if one exists
- Fits the emotional tone and theme
- Has similar rhythm and meter
- Continues the narrative or emotional flow

Respond with only the suggested line, no additional text.
`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional songwriter. Generate lyrics that flow naturally and maintain artistic quality."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      if (error.code === 'insufficient_quota') {
        throw new Error("OpenAI API quota exceeded. Please check your billing and plan details.");
      } else {
        throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.");
      }
    } else if (error.status === 401) {
      throw new Error("OpenAI API authentication failed. Please check your API key.");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API. Please check your input.");
    }
    
    throw new Error("Failed to generate next line");
  }
}

export async function analyzeLyrics(lyrics: string): Promise<{
  rhymeScheme: string;
  lineCount: number;
  wordCount: number;
  emotionalTone: string;
  suggestions: string[];
}> {
  try {
    const prompt = `
Analyze these song lyrics and provide detailed metrics in JSON format:

Lyrics:
${lyrics}

Please provide:
1. The rhyme scheme (e.g., ABAB, AABA, etc.)
2. Line count
3. Word count  
4. Emotional tone
5. 3 specific improvement suggestions

Respond with JSON in this format:
{
  "rhymeScheme": "ABAB",
  "lineCount": 4,
  "wordCount": 16,
  "emotionalTone": "romantic",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
`;

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a lyrics analysis expert. Provide detailed, constructive feedback on songwriting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      rhymeScheme: result.rhymeScheme || "Free verse",
      lineCount: result.lineCount || 0,
      wordCount: result.wordCount || 0,
      emotionalTone: result.emotionalTone || "neutral",
      suggestions: result.suggestions || []
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      if (error.code === 'insufficient_quota') {
        throw new Error("OpenAI API quota exceeded. Please check your billing and plan details.");
      } else {
        throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.");
      }
    } else if (error.status === 401) {
      throw new Error("OpenAI API authentication failed. Please check your API key.");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API. Please check your input.");
    }
    
    throw new Error("Failed to analyze lyrics");
  }
}
