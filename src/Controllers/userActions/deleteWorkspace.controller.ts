import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import YouTubeVideo from "../../Models/youtubeVideo";
import Chats from "../../Models/Chat";

export const deleteWorkspace = async (
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
        return res.status(400).json({ error: "Bad request." });
      }

      const workspace = await Workspace.findOne({
        where: { enc_id: id, userId: user.id },
      });

      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found." });
      }

      await PDFFiles.destroy({ where: { workspaceId: workspace.id } });
      await ImageFiles.destroy({ where: { workspaceId: workspace.id } });
      await YouTubeVideo.destroy({ where: { workspaceId: workspace.id } });
      await Chats.destroy({ where: { workspaceId: id } });
      await Workspace.destroy({ where: { enc_id: id, userId: user.id } });

      return res.status(200).json({
        success: true,
        message: "Workspace deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }