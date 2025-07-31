import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import userAnswers from "../../Models/userQuizAnswers";

export const deleteEntryFromQuiz = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;
    const { quiz_id, entry_id } = req.query;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!quiz_id || !entry_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const entry = await userAnswers.findOne({
        where: { id: entry_id, quizId: quiz_id },
      });

      if (!entry) {
        return res.status(404).json({ error: "Entry not found." });
      }

      await userAnswers.destroy({ where: { id: entry_id, quizId: quiz_id } });

      return res.status(200).json({
        success: true,
        message: "Entry deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }