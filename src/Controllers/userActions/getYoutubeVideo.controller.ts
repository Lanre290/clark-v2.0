import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { fetchVideoData } from "../../utils/youtube.utils";

export const getYoutubeVideo = async (
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

      const videoData = await fetchVideoData(id);
      if (!videoData) {
        return res.status(404).json({ error: "Video not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Video retrieved successfully.",
        videoData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }