import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Quiz from "../../Models/quiz";
import Question from "../../Models/question";

export const deleteQuiz = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { quiz_id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!quiz_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const quiz = await Quiz.findOne({
        where: { id: quiz_id, userId: user.id },
      });

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      await Question.destroy({ where: { quizId: quiz.id } });
      await Quiz.destroy({ where: { id: quiz_id, userId: user.id } });

      return res.status(200).json({
        success: true,
        message: "Quiz deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }