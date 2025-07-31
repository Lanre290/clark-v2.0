import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Quiz from "../../Models/quiz";
import Question from "../../Models/question";

export const getQuiz = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { quiz_id } = req.params;
    const user = req.user;

    if (!quiz_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      if (!quiz_id && user) {
        const quizzes = await Quiz.findAll({
          where: { userId: user.id },
          attributes: { exclude: ["userId"] },
        });

        if (!quizzes || quizzes.length === 0) {
          return res.status(404).json({ error: "No quizzes found." });
        }

        return res.status(200).json({
          success: true,
          message: "Quizzes retrieved successfully.",
          quizzes,
        });
      } else {
        const quiz = await Quiz.findOne({
          where: { id: quiz_id },
          attributes: { exclude: ["userId"] },
        });

        if (!quiz) {
          return res.status(404).json({ error: "Quiz not found." });
        }

        const questions = await Question.findAll({
          where: { quizId: quiz.id },
          attributes: { exclude: ["createdAt", "updatedAt", "id", "quizId"] },
        });

        return res.status(200).json({
          success: true,
          message: "Quiz retrieved successfully.",
          quiz,
          questions,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }