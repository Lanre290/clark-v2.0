import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import FlashCard from "../../Models/flashCards";

export const deleteFlashCard = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { flashcard_id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!flashcard_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const flashcard = await FlashCard.findOne({
        where: { id: flashcard_id, userId: user.id },
      });

      if (!flashcard) {
        return res.status(404).json({ error: "Flashcard not found." });
      }

      await FlashCard.destroy({ where: { id: flashcard_id, userId: user.id } });

      return res.status(200).json({
        success: true,
        message: "Flashcard deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }