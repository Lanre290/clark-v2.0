import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import ImageFiles from "../../Models/ImageFile";
import PDFFiles from "../../Models/PDFFile";
import Workspace from "../../Models/Workspace";
import { processFiles } from "../../utils/fileHandler.utils";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";
import Quiz from "../../Models/quiz";
import Question from "../../Models/question";

export const generateQuiz = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const {
      workspace_id,
      name,
      size,
      duration,
      mode,
      file_id,
      difficulty,
      topic,
    } = req.body;
    const user = req.user;
    let imageFiles: ImageFiles[] | null = [];
    let pdfFiles: PDFFiles[] | null = [];
    let quizSourceType = "workspace";
    let quizSource = "";
    let quizfileId = "";
    let prompt = "";

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!size || !name || !duration) {
      return res.status(400).json({ error: "Bad request." });
    }

    if (
      (mode == "workspace" && !workspace_id) ||
      (mode == "file" && !file_id)
    ) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      if (mode == "workspace" && workspace_id) {
        const workspaceExists = await Workspace.findOne({
          where: { enc_id: workspace_id, userId: user.id },
          attributes: ["id"],
        });

        if (!workspaceExists) {
          return res.status(404).json({ error: "Workspace not found." });
        }

        quizSource = workspaceExists.name || "Workspace";

        pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });

        imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });
      } else {
        pdfFiles = await PDFFiles.findAll({
          where: { id: file_id },
          attributes: ["filePath", "fileName", "id"],
        });

        if (pdfFiles && pdfFiles.length != 0) {
          quizSource = pdfFiles[0].fileName || "File";
          quizfileId = pdfFiles[0].id;
        }

        imageFiles = await ImageFiles.findAll({
          where: { id: file_id },
          attributes: ["filePath", "fileName", "id"],
        });

        if (imageFiles && imageFiles.length != 0) {
          quizSource = imageFiles[0].fileName || "File";
          quizfileId = imageFiles[0].id;
        }

        quizSourceType = "file";
      }

      if (mode == "workspace" || mode == "file") {
        prompt = `Generate a quiz of ${difficulty} level difficulty with ${size} questions and answers on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
      } else if (mode == "internet") {
        prompt = `Generate a quiz of ${difficulty} level difficulty with ${size} questions and answers on the topic "${topic}". The questions should be relevant, diverse, and cover different aspects of the topic. For each question, provide multiple choice options and indicate the correct answer. Include a detailed explanation for each answer, referencing reliable sources or general knowledge where appropriate.`;
      } else {
        return res
          .status(400)
          .json({
            error: "Bad request.",
            message: "Invalid quiz generation mode.",
          });
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
            description:
              "List of quiz questions with options and correct answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The quiz question.",
                  nullable: false,
                },
                options: {
                  type: Type.ARRAY,
                  description:
                    "Multiple choice answer options. GIVE THE OPTIONS WITHOUT THE LETTER AS IN: ❌A.) OPTION ✅OPTION",
                  items: {
                    type: Type.STRING,
                  },
                  nullable: false,
                },
                correct_answer: {
                  type: Type.STRING,
                  description: "The correct answer from the options.",
                  nullable: false,
                },
                explanation: {
                  type: Type.STRING,
                  description:
                    "explanation why the correct answer is the correct answer based on what is in the documents and additional images provided. Make sure to describe the document reference and the image reference too.",
                  nullable: false,
                },
              },
              required: [
                "question",
                "options",
                "correct_answer",
                "explanation",
              ],
            },
          },
        },
      });

      const json = JSON.parse(response.text as string);
      let quiz_id = "";
      if (json.length > size) {
        json.length = size;
      }
      Quiz.create({
        name: name,
        creator: user.name,
        userId: user.id,
        workspaceId: workspace_id,
        fileId: quizfileId,
        quizSource: quizSource,
        quizSourceType: quizSourceType,
        duration: duration,
      })
        .then(async (quiz) => {
          quiz_id = quiz.id as any;

          // Map the questions creation into an array of promises
          const questionPromises = json.map((item: any) => {
            return Question.create({
              quizId: quiz.id,
              question: item.question,
              options: item.options,
              correctAnswer: item.correct_answer,
              explanation: item.explanation,
            });
          });

          // Wait for all question creations to complete
          try {
            await Promise.all(questionPromises);

            // Send response after all questions created
            return res.status(200).json({
              success: true,
              quiz_id: quiz_id,
              message: "Quiz created successfully.",
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