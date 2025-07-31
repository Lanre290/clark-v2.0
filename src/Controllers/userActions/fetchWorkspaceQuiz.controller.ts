import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import Quiz from "../../Models/quiz";
import Question from "../../Models/question";

export const fetchWorkspaceQuiz = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, quiz_id } = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!workspace_id && !quiz_id) {
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

      if (!quiz_id) {
        const quiz = await Quiz.findAll({
          where: { workspaceId: workspace_id },
          attributes: { exclude: ["userId"] },
        });

        if (!quiz || quiz.length === 0) {
          return res.status(404).json({ error: "No quizzes found." });
        }

        return res.status(200).json({
          success: true,
          message: "Quiz retreived successfully.",
          quiz,
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
          message: "Quiz retreived successfully.",
          quiz,
          questions,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }