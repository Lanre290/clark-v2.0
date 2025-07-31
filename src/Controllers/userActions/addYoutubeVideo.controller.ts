import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import YouTubeVideo from "../../Models/youtubeVideo";
import { fetchVideoData } from "../../utils/youtube.utils";

export const addYoutubeVideo = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { video_id, workspace_id } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!video_id || !workspace_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      let videoData = await YouTubeVideo.findOne({
        where: { videoId: video_id, workspaceId: workspace_id },
      });

      if (videoData) {
        return res.status(200).json({
          success: true,
          message: "Video already exists.",
          workspace_id,
          videoData,
        });
      }

      const ytVideoData = await fetchVideoData(video_id);
      if (!ytVideoData) {
        return res.status(404).json({ error: "Video does not exist." });
      }

      await YouTubeVideo.create({
        videoId: video_id,
        title: ytVideoData.snippet.title,
        description: ytVideoData.snippet.description,
        channelTitle: ytVideoData.snippet.channelTitle,
        thumbnailUrl: ytVideoData.snippet.thumbnails.high.url,
        viewCount: ytVideoData.statistics.viewCount,
        likeCount: ytVideoData.statistics.likeCount,
        commentCount: ytVideoData.statistics.commentCount,
        duration: ytVideoData.statistics.viewCount,
        workspaceId: workspace_id,
      })
        .then((video) => {
          videoData = video;
          return res.status(200).json({
            success: true,
            message: "Video added successfully.",
            workspace_id,
            videoData,
          });
        })
        .catch((error) => {
          console.error("Error adding video:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error adding video.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }