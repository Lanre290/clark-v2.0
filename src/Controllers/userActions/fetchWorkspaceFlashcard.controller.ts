import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import FlashCard from "../../Models/flashCards";
import FlashcardQuestions from "../../Models/flashcardQuestions";

export const fetchWorkspaceFlashCard =  async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, flashcard_id } = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!workspace_id && !flashcard_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      if (workspace_id) {
        const workspace = await Workspace.findOne({
          where: { enc_id: workspace_id, userId: user.id },
        });

        if (!workspace) {
          return res.status(404).json({ error: "Workspace not found." });
        }
      }

      if (!flashcard_id) {
        const flashcards = await FlashCard.findAll({
          where: { workspaceId: workspace_id },
          attributes: { exclude: ["userId"] },
        });

        if (!flashcards || flashcards.length === 0) {
          return res.status(404).json({ error: "No flashcards found." });
        }

        return res.status(200).json({
          success: true,
          message: "Flashcards retrieved successfully.",
          flashcards,
        });
      } else {
        const flashcard = await FlashCard.findOne({
          where: { id: flashcard_id, workspaceId: workspace_id },
          attributes: { exclude: ["userId"] },
        });

        if (!flashcard) {
          return res.status(404).json({ error: "Flashcard not found." });
        }

        const questions = await FlashcardQuestions.findAll({
          where: { flashcardId: flashcard.id },
          attributes: { exclude: ["createdAt", "updatedAt", "flashcardId"] },
        });

        return res.status(200).json({
          success: true,
          message: "Flashcard retrieved successfully.",
          flashcard,
          questions,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }
