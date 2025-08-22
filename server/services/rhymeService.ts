// Rhyming service using RhymeZone API or similar
export async function getRhymes(word: string): Promise<string[]> {
  try {
    // Using a free rhyming API (you can replace with any rhyming service)
    const response = await fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=20`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => item.word).filter((w: string) => w !== word);
  } catch (error) {
    console.error("Error fetching rhymes:", error);
    // Fallback rhymes for common words
    return getBasicRhymes(word);
  }
}

export async function getSynonyms(word: string): Promise<string[]> {
  try {
    // Using DataMuse API for synonyms
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=15`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => item.word);
  } catch (error) {
    console.error("Error fetching synonyms:", error);
    return [];
  }
}

export async function getNearRhymes(word: string): Promise<string[]> {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_nry=${encodeURIComponent(word)}&max=15`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => item.word);
  } catch (error) {
    console.error("Error fetching near rhymes:", error);
    return [];
  }
}

// Basic fallback rhymes for when API is unavailable
function getBasicRhymes(word: string): string[] {
  const basicRhymes: { [key: string]: string[] } = {
    heart: ["start", "part", "art", "smart", "chart", "dart", "cart", "apart"],
    love: ["above", "dove", "shove", "glove", "of"],
    night: ["light", "bright", "sight", "fight", "might", "right", "flight"],
    day: ["way", "say", "play", "stay", "ray", "may", "pay"],
    time: ["rhyme", "climb", "prime", "lime", "chime", "mine"],
    life: ["knife", "wife", "strife", "rife"],
    soul: ["goal", "whole", "roll", "control", "bowl", "pole"],
    mind: ["find", "kind", "behind", "blind", "wind", "bind"],
    fire: ["desire", "inspire", "tire", "wire", "higher"],
    dream: ["seem", "beam", "team", "cream", "stream"]
  };

  return basicRhymes[word.toLowerCase()] || [];
}

export function extractLastWord(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return "";
  
  // Remove punctuation from the last word
  const lastWord = words[words.length - 1].replace(/[.,!?;:'"()]/g, "");
  return lastWord.toLowerCase();
}

export function analyzeRhymeScheme(lyrics: string): string {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return "Free verse";
  
  const lastWords = lines.map(line => extractLastWord(line));
  const rhymeMap: { [key: string]: string } = {};
  let currentLetter = 'A';
  let scheme = '';
  
  for (const word of lastWords) {
    if (!rhymeMap[word]) {
      rhymeMap[word] = currentLetter;
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
    scheme += rhymeMap[word];
  }
  
  return scheme;
}
