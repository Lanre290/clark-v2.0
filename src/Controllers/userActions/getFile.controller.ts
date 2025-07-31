import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import ImageFiles from "../../Models/ImageFile";
import PDFFiles from "../../Models/PDFFile";

export const getFile = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { file_id } = req.params;
    const user = req.user;
    let file;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      file = await ImageFiles.findOne({
        where: { id: file_id },
        attributes: ["id", "filePath", "fileName", "size"],
      });

      if (!file) {
        file = await PDFFiles.findOne({
          where: { id: file_id },
          attributes: ["id", "filePath", "fileName", "size"],
        });
      }

      if (!file) {
        return res.status(404).json({ error: "File not found." });
      }

      return res.status(200).json({ success: true, file });
    } catch (error) {
      return res.status(500).json({ error: "Server error." });
    }
  }