
import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI inside the function to ensure the most up-to-date API key is used from the environment.
export async function getIQInsights(score: number, level: number, timeLeft: number) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).process?.env?.API_KEY || '';
  if (!apiKey) return "Ottima sfida! Supera i tuoi limiti.";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizza questa performance di un giocatore in un gioco aritmetico basato su esagoni: 
      Punteggio: ${score}, Livello: ${level}, Tempo rimanente: ${timeLeft} secondi. 
      Fornisci un breve commento motivazionale in italiano (massimo 20 parole) che rifletta la loro capacità logico-matematica.`,
    });
    return response.text || "Continua così, la tua mente è agile!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ottima sfida! Supera i tuoi limiti.";
  }
}
