import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Chats from "../../Models/Chat";

export const renameController = async (req: Request & afterVerificationMiddlerwareInterface, res: Response) => {
  const { newName, chatId } = req.body;

  try {
    await Chats.update({ name: newName }, { where: { id: chatId } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to rename chat" });
  }
};
