import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import { Op } from "sequelize";
import Workspace from "../../Models/Workspace";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";


export const search = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { s } = req.query;

    s = s?.toString();

    if(!s || s.trim() === "") {
      return res.status(400).json({ error: "Search string is required." });
    }

    try {
      const WorkspaceResult = await Workspace.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${s}%` } },
            { description: { [Op.like]: `%${s}%` } },
          ],
        },
      });

      const imageFilesResult = await ImageFiles.findAll({
        where: {
          [Op.or]: [
            { fileName: { [Op.like]: `%${s}%` } },
            { summary: { [Op.like]: `%${s}%` } },
          ],
        },
      });

      const pdfResult = await PDFFiles.findAll({
        where: {
          [Op.or]: [
            { fileName: { [Op.like]: `%${s}%` } },
            { summary: { [Op.like]: `%${s}%` } },
          ],
        },
      });

      return res.status(200).json({
        success: true,
        WorkspaceResult,
        imageFilesResult,
        pdfResult,
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