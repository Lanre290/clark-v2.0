import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Question from "../../Models/question";
import userAnswers from "../../Models/userQuizAnswers";

export const assessUserAnswers = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { quiz_id, answers, name, email, timeTaken, time_remaining } = req.body;

    if (!name && !email && !req.user) {
      return res
        .status(400)
        .json({
          error: "Bad request. Name, email, or is_creator are required.",
        });
    }

    if (req.user) {
      name = req.user.name;
      email = req.user.email;
    }

    if (!quiz_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Bad request." });
    }

    const quizQuestions = await Question.findAll({
      where: { quizId: quiz_id },
      attributes: ["id", "question", "correctAnswer"],
    });

    if (!quizQuestions || quizQuestions.length === 0) {
      return res.status(404).json({ error: "Quiz not found." });
    }
    if (answers.length !== quizQuestions.length) {
      return res.status(400).json({ error: "Invalid quiz error." });
    }

    try {
      const results = answers.map((answer, index) => {
        const question = quizQuestions[index];
        const isCorrect = answer === question.correctAnswer;

        return {
          question: question.question,
          userAnswer: answer,
          correctAnswer: question.correctAnswer,
          isCorrect: isCorrect,
        };
      });

      // Calculate score
      const score = results.filter((result) => result.isCorrect).length;
      const totalQuestions = quizQuestions.length;

      if (totalQuestions === 0) {
        return res
          .status(400)
          .json({ error: "No questions found in the quiz." });
      }

      // Save the quiz assessment
      await userAnswers.create({
        name: name,
        userEmail: email,
        quizId: quiz_id,
        userScore: score.toString(),
        totalQuestions: totalQuestions.toString(),
        timeTaken: timeTaken || 0,
        userAnswers: JSON.stringify(answers),
        percentage: ((score / totalQuestions) * 100).toFixed(2),
        time_remaining: time_remaining || "0",
      });

      return res.status(200).json({
        success: true,
        message: "Quiz assessment completed successfully.",
        score,
        quiz_id,
        totalQuestions,
        percentage: ((score / totalQuestions) * 100).toFixed(2),
        results,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }