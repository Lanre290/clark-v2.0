import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Chats from "../../Models/Chat";
import Messages from "../../Models/Message";

export const getChat = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;
    const { page = 1, chat_id } = req.query;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!chat_id) {
        const chats = await Chats.findAll({
          where: { userId: user.id, workspaceId: null },
          attributes: { exclude: ["userId"] },
        });
        return res.status(200).json({ chats });
      } else {
        const limit = 60;
        const offset = ((page as number) - 1) * limit;

        const chat = await Chats.findOne({
          where: { id: chat_id },
          attributes: { exclude: ["createdAt", "updatedAt"] },
        });

        if (!chat) {
          return res.status(404).json({ error: "Chat not found" });
        }

        if (chat.userId !== user.id) {
          return res
            .status(404)
            .json({ error: "Chat not found.", message: "Forbidden access." });
        }

        const messages = await Messages.findAll({
          where: { chatId: chat_id },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
          attributes: { exclude: ["id", "chatId"] },
        });

        messages.reverse();
        delete chat.dataValues.userId;
        return res.status(200).json({ page, messages, chat });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }