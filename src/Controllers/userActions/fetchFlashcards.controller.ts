import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import FlashCard from "../../Models/flashCards";
import FlashcardQuestions from "../../Models/flashcardQuestions";

export const getFlashCard = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { flashcard_id } = req.params;
    const user = req.user;

    if (!flashcard_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      if (!flashcard_id && user) {
        const flashcards = await FlashCard.findAll({
          where: { userId: user.id },
          attributes: { exclude: ["userId"] },
        });

        if (!flashcards || flashcards.length === 0) {
          return res.status(404).json({ error: "No flashcards found." });
        }

        return res.status(200).json({
          success: true,
          message: "flashcards retrieved successfully.",
          flashcards,
        });
      } else {
        const flashcard = await FlashCard.findOne({
          where: { id: flashcard_id },
        });

        if (!flashcard) {
          return res.status(404).json({ error: "Flashcard not found." });
        }

        const questions = await FlashcardQuestions.findAll({
          where: { flashcardId: flashcard.id },
          attributes: {
            exclude: ["createdAt", "updatedAt", "id", "flashcardId"],
          },
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