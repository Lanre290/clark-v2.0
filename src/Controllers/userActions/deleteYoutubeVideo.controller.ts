import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import YouTubeVideo from "../../Models/youtubeVideo";

export const deleteVideo = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { video_id, workspace_id } = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!video_id || !workspace_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const video = await YouTubeVideo.findOne({
        where: { videoId: video_id, workspaceId: workspace_id, userId: user.id },
      });

      if (!video) {
        return res.status(404).json({ error: "Video not found." });
      }

      await YouTubeVideo.destroy({
        where: { videoId: video_id, workspaceId: workspace_id, userId: user.id },
      });

      return res.status(200).json({
        success: true,
        message: "Video deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }