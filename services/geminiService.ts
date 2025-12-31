
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getIQInsights(score: number, level: number, timeLeft: number) {
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
