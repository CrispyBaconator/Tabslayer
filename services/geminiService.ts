
import { GoogleGenAI, Type } from "@google/genai";
import { LinkItem } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateLinkMetadata = async (url: string): Promise<{ title: string; description: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze this URL and provide a concise title, a 1-sentence description, and 3-5 relevant tags. URL: ${url}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "tags"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      title: url,
      description: "No description available.",
      tags: ["untagged"]
    };
  }
};

export const queryLinks = async (query: string, links: LinkItem[]): Promise<{ answer: string; relatedLinkIds: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const context = links.map(l => `ID: ${l.id}, Title: ${l.title}, Desc: ${l.description}, URL: ${l.url}, Tags: ${l.tags.join(', ')}`).join('\n');

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are an intelligent link assistant. Based on the user's query and the list of links below, answer their question and identify which links (by ID) are most relevant.
    
    Query: "${query}"
    
    Links Context:
    ${context}
    
    Format your response as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING, description: "Your conversational answer to the user's question." },
          relatedLinkIds: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of link IDs that directly relate to the query." 
          }
        },
        required: ["answer", "relatedLinkIds"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      answer: "I couldn't process that request properly.",
      relatedLinkIds: []
    };
  }
};
