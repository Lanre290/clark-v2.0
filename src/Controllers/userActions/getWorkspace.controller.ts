import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import ImageFiles from "../../Models/ImageFile";
import PDFFiles from "../../Models/PDFFile";
import YouTubeVideo from "../../Models/youtubeVideo";
import Chats from "../../Models/Chat";
import Quiz from "../../Models/quiz";
import FlashCard from "../../Models/flashCards";

export const getWorkspace = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!id) {
        const workspaces = await Workspace.findAll({
          where: { userId: user.id },
          attributes: { exclude: ["id", "createdAt", "updatedAt", "userId"] },
        });

        return res.status(200).json({
          success: true,
          message: "Workspaces retrieved successfully.",
          workspaces,
        });
      } else {
        let workspace = await Workspace.findOne({
          where: { enc_id: id, userId: user.id },
          attributes: { exclude: ["id", "createdAt", "updatedAt", "userId"] },
        });

        if (!workspace) {
          return res.status(404).json({ error: "Workspace not found." });
        }

        const imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: ["id", "filePath", "fileName", "size"],
        });

        const pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: ["id", "filePath", "fileName", "size"],
        });

        const youtubeVideos = await YouTubeVideo.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        });

        if (!workspace) {
          return res.status(404).json({ error: "Workspace not found." });
        }

        const workspaceChat = await Chats.findOne({
          where: { workspaceId: id },
        });

        const files = {
          imageFiles,
          pdfFiles,
          youtubeVideos,
        };

        const quizzes = await Quiz.findAll({where: {workspaceId: id}});
        const flashcards = await FlashCard.findAll({where: {workspaceId: id}});

        workspace = {
          ...workspace.get({ plain: true }),
          files,
          quizzes,
          flashcards
        };

        return res.status(200).json({
          success: true,
          message: "Workspace retrieved successfully.",
          workspace,
          chat: workspaceChat ? workspaceChat : null,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }