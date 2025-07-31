import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Chats from "../../Models/Chat";

export const createChat =  async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;

    try {
      if (!user) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      Chats.create({
        userId: user.id,
      }).then((chat) => {
        const plainChat = chat.get({ plain: true });

        delete plainChat.userId;
        delete plainChat.createdAt;
        delete plainChat.updatedAt;

        return res.status(201).json({ success: true, chat: plainChat });
      });
    } catch (error) {
      return res.status(500).json({ error: "Server error." });
    }
  }