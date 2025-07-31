import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import YouTubeVideo from "../../Models/youtubeVideo";

export const deleteFiles = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, file_url } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!workspace_id || !file_url) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const workspaceExists = await Workspace.findOne({
        where: { enc_id: workspace_id, userId: user.id },
        attributes: ["id"],
      });

      if (!workspaceExists) {
        return res.status(404).json({ error: "Workspace not found." });
      }

      const fileExists = await PDFFiles.findOne({
        where: { filePath: file_url, workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const imageExists = await ImageFiles.findOne({
        where: { filePath: file_url, workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const youtubeExists = await YouTubeVideo.findOne({
        where: { videoId: file_url, workspaceId: workspace_id },
        attributes: ["videoId"],
      });

      if (!fileExists && !imageExists && !youtubeExists) {
        return res.status(404).json({ error: "File not found." });
      }

      const succcesspayload = {
        success: true,
        message: "File deleted successfully.",
      };

      if (fileExists && !imageExists && !youtubeExists) {
        await PDFFiles.destroy({
          where: { filePath: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else if (imageExists && !fileExists && !youtubeExists) {
        await ImageFiles.destroy({
          where: { filePath: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else if (youtubeExists && !fileExists && !imageExists) {
        await YouTubeVideo.destroy({
          where: { videoId: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else {
        return res.status(400).json({ error: "Bad request." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }