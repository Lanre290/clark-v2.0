import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { Op } from "sequelize";
import Workspace from "../../Models/Workspace";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import Chat from "../../Models/Chat";


export const search = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { s } = req.query;
    const user = req.user;

    s = s?.toString();

    if(!s || s.trim() === "") {
      return res.status(400).json({ error: "Search string is required." });
    }

    try {
      const WorkspaceResult = await Workspace.findAll({
        where: {
          userId: user.id,
          [Op.or]: [
            { name: { [Op.iLike]: `%${s}%` } },
            { description: { [Op.iLike]: `%${s}%` } },
          ],
        },
        attributes: { exclude: ["id", "userId", "createdAt", "updatedAt"] }
      });

      const imageFilesResult = await ImageFiles.findAll({
        where: {
          userId: String(user.id),
          [Op.or]: [
            { fileName: { [Op.iLike]: `%${s}%` } },
            { summary: { [Op.iLike]: `%${s}%` } },
          ],
        },
        attributes: { exclude: ["userId", "createdAt", "updatedAt"] }
      });

      const pdfResult = await PDFFiles.findAll({
        where: {
          userId: String(user.id),
          [Op.or]: [
            { fileName: { [Op.iLike]: `%${s}%` } },
            { summary: { [Op.iLike]: `%${s}%` } },
          ],
        },
        attributes: { exclude: ["userId", "createdAt", "updatedAt"] }
      });

      const chatResult = await Chat.findAll({
        where: {
          userId: user.id,
          workspaceId: null,
          [Op.or]: [
            { name: { [Op.iLike]: `%${s}%` } },
          ],
        },
        attributes: { exclude: ["userId", "createdAt", "updatedAt"] }
      });

      return res.status(200).json({
        success: true,
        WorkspaceResult,
        imageFilesResult,
        pdfResult,
        chatResult,
        message: "Search results retrieved successfully.",
      });
    } catch (error) {
      console.error("Error during search:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };