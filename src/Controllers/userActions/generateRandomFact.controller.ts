import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";

export const generateRandomFact = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      const prompt = `Generate 8 unique, non-repeating educational fact from a random subject like space, biology, physics, chemistry, math, art, philosophy, literature, history, general studies, or others. Each fact should introduce fresh knowledge or context, be accurate, and not exceed 50 words. Rotate subjects frequently to ensure diversity.enerate a random educational fact ranging from philosophy to physics, math, english, general studies, history and many more for a student, providing new knowledge or context. It must be accurate and must be a different one everytime. not more than only 50 words.`;

      const response = await ai.models.generateContent({
        model: process.env.REGULAR_MODEL as string,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of random educational facts.",
            items: {
              type: Type.STRING,
              description: "A random educational fact.",
              nullable: false,
            },
            minimum: 8,
            maximum: 8,
          },
        },
      });

      const text = response.text;
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }