import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { processFiles } from "../../utils/fileHandler.utils";
import { ai } from "../../Services/gemini.services";

export const generateSummary =  async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { mode, imageFiles, pdfFiles } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if(!mode){
      return res.status(400).json({ error: "Bad request." });
    }
    
    if(!imageFiles && !pdfFiles) {
      return res.status(400).json({ error: "Bad request.", message: "No files provided." });
    }

    if (mode !== "summary" && mode !== "new_material") {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const prompt =
        mode == "summary"
          ? `Generate a comprehensive, extended summary of the uploaded document(s), with the summary length and depth proportional to the size and richness of the original content. Break down the material by major sections, topics, or chapters. For each, summarize key ideas, concepts, methods, examples, and definitions.
            Ensure the output is well-structured and visually clear when rendered. Use proper formatting to enhance readability:
            Bold headings and subheadings
            Numbered or bulleted lists for steps, principles, or examples
            Tables for comparisons, algorithms, time/space complexities, etc.
            Use indentation or spacing where helpful
            The final result should look like a well-organized study digest or annotated course summary — not too brief, not a full rewrite, but rich enough to serve as a solid standalone reference for students.`
          : `Generate a detailed, student-friendly, and standalone learning resource using the uploaded document(s) as source material.
              Rewrite the content from scratch using clear, simple language—not as a summary or copy.
              ✅ Structure it like a full lesson, handout, or textbook chapter with:
              Clear headings and subtopics
              Step-by-step breakdowns of complex ideas
              Definitions, explanations, and real-world examples
              Boxed callouts, tips, or side notes for key concepts
              Bullet points, numbered lists, and tables (where useful)
              A logical flow that builds from basic concepts to deeper understanding
              The result should look clean, professional, and easy to follow—perfect for self-study, revision, or use in an educational app.
              Think of it as a mini textbook chapter rewritten in plain, student-friendly English.`;
      let parts: any[] = [];

      parts.push({ text: prompt });

      parts = await processFiles(parts, pdfFiles, imageFiles);

      const response = await ai.models.generateContent({
        model: process.env.REGULAR_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
      });

      const summary = response.text;
      return res.status(200).json({
        success: true,
        message: "Summary generated successfully.",
        summary,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }