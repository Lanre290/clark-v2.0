import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Chats from "../../Models/Chat";
import Messages from "../../Models/Message";

export const deleteChat = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { chat_id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!chat_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const chat = await Chats.findOne({
        where: { id: chat_id, userId: user.id },
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found." });
      }

      if (chat.workspaceId !== null) {
        return res.status(401).json({
          error: "unAuthorized access.",
          message: "Cannot delete workspace chat.",
        });
      }

      await Messages.destroy({ where: { chatId: chat_id } });
      await Chats.destroy({ where: { id: chat_id, userId: user.id } });

      return res.status(200).json({
        success: true,
        message: "Chat deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }