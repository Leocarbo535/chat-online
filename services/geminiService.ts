import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

// Helper to initialize the client
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a response from a specific "friend" persona based on chat history.
 */
export const generateFriendResponse = async (
  history: Message[],
  systemInstruction: string,
  userMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Transform our internal message format to Gemini chat history format
    // We only take the last 10 messages to keep context relevant and save tokens
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.senderId === 'me' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9, // Higher temperature for more creative/human-like responses
      },
      history: recentHistory
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
    return response.text || "Hmm, I'm not sure what to say.";
  } catch (error) {
    console.error("Error generating friend response:", error);
    return "Sorry, I can't connect right now (Network Error).";
  }
};