import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import userAnswers from "../../Models/userQuizAnswers";

export const fetchQuizLeaderBoard = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { quiz_id } = req.params;

    if (!quiz_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const leaderboard = await userAnswers.findAll({
        where: { quizId: quiz_id as string },
        attributes: [
          "id",
          "name",
          "userEmail",
          "userScore",
          "percentage",
          "totalQuestions",
        ],
        order: [["userScore", "DESC"]],
      });

      if (!leaderboard || leaderboard.length === 0) {
        return res.status(404).json({ error: "No leaderboard data found." });
      }

      return res.status(200).json({
        success: true,
        message: "Leaderboard retrieved successfully.",
        quiz_id,
        totalParticipants: leaderboard.length,
        averageScore: (
          leaderboard.reduce(
            (sum, entry) => sum + parseFloat(entry.userScore),
            0
          ) / leaderboard.length
        ).toFixed(2),
        averagePercentage: (
          leaderboard.reduce(
            (sum, entry) => sum + parseFloat(entry.percentage),
            0
          ) / leaderboard.length
        ).toFixed(2),
        averageTimeTaken: (
          leaderboard.reduce((sum, entry) => sum + (entry.timeTaken || 0), 0) /
          leaderboard.length
        ).toFixed(2),
        leaderboard,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }