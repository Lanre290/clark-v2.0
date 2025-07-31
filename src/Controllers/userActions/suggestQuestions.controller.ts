import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import { processFiles } from "../../utils/fileHandler.utils";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";

export const suggestQuestion = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, mode, file_url } = req.body;
    let pdfFiles: any = [];
    let imageFiles: any = [];
    let prompt = "";
    let summary = "";

    if (mode == "workspace") {
      if (!workspace_id) {
        return res.status(400).json({ error: "Bad request." });
      }
    }

    try {
      if (mode == "workspace") {
        pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });

        imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });
      } else if (mode == "file") {
        pdfFiles = await PDFFiles.findOne({
          where: { filePath: file_url },
          attributes: ["summary"],
        });

        if (pdfFiles) {
          summary = pdfFiles.sumarry;
        }

        imageFiles = await ImageFiles.findOne({
          where: { filePath: file_url },
          attributes: ["summary"],
        });

        if (imageFiles) {
          summary = imageFiles.dataValues.summary;
        }
      } else {
        return res.status(400).json({
          error: "Bad request.",
          message: "Invalid mode parameter passed.",
        });
      }

      mode == "workspace"
        ? (prompt = `Based on the provided documents and images, suggest 3 short unique, contextual questions for students to ask you that require students to explain or demonstrate and deepen their understanding of the material in the workspace. Avoid questions that reference specific slides, pages, or sections directly. Focus on questions that encourage comprehension, critical thinking, and application of the content in a meaningful way.`)
        : (prompt = `Based on the provided summary, suggest 3 short unique, contextual questions for students to ask you that require students to explain or demonstrate and deepen their understanding of the material from the sumarry provided. Avoid questions that reference specific slides, pages, or sections directly. Focus on questions that encourage comprehension, critical thinking, and application of the content in a meaningful way.`);

      let parts: any[] = [];
      parts.push({ text: prompt });

      mode == "workspace"
        ? (parts = await processFiles(parts, pdfFiles, imageFiles))
        : parts.push({ text: summary });

      const response = await ai.models.generateContent({
        model: process.env.REGULAR_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of suggested questions.",
            items: {
              type: Type.STRING,
              description: "questions.",
              nullable: false,
            },
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