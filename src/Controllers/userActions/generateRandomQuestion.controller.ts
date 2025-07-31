import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";

export const generateRandomQuestion =  async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      const prompt = `You're a helpful AI student assistant. Generate 3 different random educational questions that a student might encounter while studying. The questions should be diverse, self-contained, and not require any external document or context. Focus on common student subjects like math, science, history, or language arts. Keep the tone natural and student-friendly. Return the result as an array of 3 strings.`;

      const response = await ai.models.generateContent({
        model: process.env.REGULAR_MODEL as string,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3 random educational questions.",
            nullable: false,
            minItems: "3",
            maxItems: "3",
          },
        },
      });

      res.setHeader("Content-Type", "application/json");
      return res.send(response.text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }