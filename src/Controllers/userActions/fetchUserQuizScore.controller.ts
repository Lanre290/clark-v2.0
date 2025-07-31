import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import userAnswers from "../../Models/userQuizAnswers";
import Quiz from "../../Models/quiz";
import Question from "../../Models/question";

export const fetchUserQuizScore = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;
    const { quiz_id } = req.params;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!quiz_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const userScore = await userAnswers.findOne({
        where: { quizId: quiz_id as string, userEmail: user.email },
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      });

      const pickedAnswers = userScore?.userAnswers
        ? JSON.parse(userScore.userAnswers)
        : [];

      const quiz = await Quiz.findOne({
        where: { id: quiz_id as string },
      });

      const questions = await Question.findAll({
        where: { quizId: quiz_id as string },
        attributes: ["question", "options", "correctAnswer", "explanation"],
      });

      questions.forEach((question, index) => {
        question.dataValues.userAnswer = pickedAnswers[index];
        question.dataValues.isCorrect =
          pickedAnswers[index] == question.correctAnswer;
      });

      if (!userScore) {
        return res.status(404).json({ error: "User score not found." });
      }

      return res.status(200).json({
        success: true,
        message: "User score retrieved successfully.",
        userScore,
        quiz,
        quizData: questions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }