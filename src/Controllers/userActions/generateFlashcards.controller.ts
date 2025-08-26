import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import { processFiles } from "../../utils/fileHandler.utils";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";
import FlashCard from "../../Models/flashCards";
import FlashcardQuestions from "../../Models/flashcardQuestions";
import Chats from "../../Models/Chat";
import Messages from "../../Models/Message";

export const generateFlashcards = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, size, mode, file_id, is_context, context, topic } =
      req.body;
    const user = req.user;
    let pdfFiles: PDFFiles[] | null = [];
    let imageFiles: ImageFiles[] | null = [];

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!size) {
      return res.status(400).json({ error: "Bad request." });
    }

    if (
      (mode == "workspace" && !workspace_id) ||
      (mode == "file" && !file_id)
    ) {
      return res.status(400).json({ error: "Bad request." });
    }

    if (mode !== "workspace" && mode !== "file" && mode !== "internet") {
      return res
        .status(400)
        .json({
          error: "Bad request.",
          message: "Invalid flashcard generation mode.",
        });
    }

    try {
      if (mode == "workspace" && workspace_id) {
        pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });

        imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });
      } else if (mode == "file" && file_id) {
        pdfFiles = await PDFFiles.findAll({
          where: { id: file_id },
          attributes: ["filePath"],
        });

        imageFiles = await ImageFiles.findAll({
          where: { id: file_id },
          attributes: ["filePath"],
        });
      }

      let prompt = "";
      if (is_context && context && context.trim().length > 0) {
        prompt = `You are an expert flashcard generator for students. The user has provided a specific instruction or topic: "${context}". 
          Carefully analyze the provided documents and images, and generate exactly 6 flashcards that directly address or are highly relevant to the user's request.
          For each flashcard, provide:
          - A clear, concise question (front)
          - A correct answer (back)
          Flashcard number must be exactly 6.
          `;
      } else {
        prompt = `Generate ${size} flashcards based on the provided documents and images. 
          Go through all materials extensively to ensure coverage of all key topics.
          For each flashcard, provide a question, answer, and a detailed explanation with references to the source(s) used.`;
      }

      if (mode == "internet") {
        prompt = `Generate ${size} flashcards based on the topic "${topic}".
          For each flashcard, provide a question, answer, and a detailed explanation with references to the source(s) used.`;
      }

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
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of flashcards with questions and answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description:
                    "The question or prompt on one side of the flashcard.",
                  nullable: false,
                },
                answer: {
                  type: Type.STRING,
                  description:
                    "The answer or explanation on the other side of the flashcard.",
                  nullable: false,
                },
              },
              required: ["question", "answer"],
              minItems: "6",
              minimum: 6,
            },
          },
        },
      });

      const json = JSON.parse(response.text as string);
      let flashcard_id = "";
      if (json.length > size) {
        json.length = size;
      }

      FlashCard.create({
        userId: user.id,
        workspaceId: workspace_id,
      })
        .then(async (flashcard) => {
          flashcard_id = flashcard.id as any;
          const questionPromises = json.map((item: any) => {
            return FlashcardQuestions.create({
              question: item.question,
              answer: item.answer,
              explanation: item.explanation,
              flashcardId: flashcard.id,
            });
          });

          try {
            await Promise.all(questionPromises);

            const chatId = await Chats.findOne({
              where: { workspaceId: workspace_id },
              attributes: ["id"],
            });

            if(is_context){
                await Messages.create({
                  text: context,
                  chatId: chatId?.id,
                  fromUser: true,
                  isFile: false,
                  isFlashcard: false,
                });
            }

            if(workspace_id){
              await Messages.create({
                text: `Flashcards generated successfully with ${size} questions.`,
                chatId: chatId?.id,
                fromUser: false,
                isFile: false,
                isFlashcard: true,
                flashcardId: flashcard_id,
              });
            }

            return res.status(200).json({
              success: true,
              flashcard_id: flashcard_id,
              message: "Flashcard created successfully.",
              questions: json,
            });
          } catch (error) {
            console.error("Error creating questions:", error);
            return res.status(500).json({
              error: "Server error.",
              message: "Error creating questions.",
            });
          }
        })
        .catch((error) => {
          console.error("Error creating quiz:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error creating quiz.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }