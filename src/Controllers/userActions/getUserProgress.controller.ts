import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import userAnswers from "../../Models/userQuizAnswers";

export const getUserProgress = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (id) {
        const progress = await userAnswers.findOne({
          where: { id: id, userEmail: user.email },
          order: [["createdAt", "DESC"]],
        });

        if (!progress) {
          return res.status(404).json({ error: "Progress not found." });
        }

        return res.status(200).json({
          success: true,
          message: "User progress retrieved successfully.",
          progress,
        });
      } else {
        const progress = await userAnswers.findAll({
          where: { userEmail: user.email },
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({
          success: true,
          message: "User progress retrieved successfully.",
          progress,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }