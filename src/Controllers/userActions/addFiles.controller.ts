import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface, prefileInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import { formatFileSize } from "../../utils/fileFormat.util";
import { uploadFile } from "../../Services/Cloudflare.services";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import { generateDetailedContent } from "../../utils/gemini.utils";
import { addFileSchema } from "../../Services/zod.services";



export const addFiles = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      const { workspace_id } = req.body;
      const user = req.user;
      let files: prefileInterface[] = [];

      if (!user) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      if (!workspace_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const parseResult = addFileSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.errors });
      }

      const workspaceExists = await Workspace.findOne({
        where: { enc_id: workspace_id, userId: user.id },
        attributes: ["id"],
      });

      if (!workspaceExists) {
        return res.status(404).json({ error: "Workspace not found." });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (req.files.length > 10) {
        return res.status(400).json({
          error: "Bad request.",
          message: "Number of files cannot exceed 10.",
        });
      }

      // Validate all files first
      for (const file of req.files) {
        const mimeType = file.mimetype;
        if (!mimeType.includes("pdf") && !mimeType.includes("image")) {
          return res.status(400).json({
            error: "Invalid file type. Only PDF and image files are allowed.",
          });
        }
      }

      const bucket = workspace_id;

      // Prepare upload promises and metadata
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file) => {
          let key = `${Date.now()}_${file.originalname}`;
          const mimeType = file.mimetype;

          key = key.replace(/[^a-zA-Z0-9.]/g, "_");

          let preFile: prefileInterface = {
            originalname: file.originalname,
            size: formatFileSize(file.size),
            mimetype: mimeType,
            url: `https://${process.env.R2_ENDPOINT_DOMAIN}/${bucket}/${key}`,
            workspaceId: workspace_id,
          };
          files.push(preFile);

          return uploadFile(workspace_id, bucket, key, file.buffer, mimeType);
        }
      );

      // Wait for all files to upload
      const urls = await Promise.all(uploadPromises);

      // After upload, create database records
      for (const file of files) {
        if (file.mimetype.includes("pdf")) {
          await PDFFiles.create({
            fileName: file.originalname,
            workspaceId: file.workspaceId,
            userId: user.id,
            filePath: file.url,
            size: file.size,
          });
        } else if (file.mimetype.includes("image")) {
          await ImageFiles.create({
            fileName: file.originalname,
            size: file.size,
            workspaceId: file.workspaceId,
            userId: user.id,
            filePath: file.url,
          });
        }

        generateDetailedContent(file.url, file.mimetype);
      }

      return res.status(201).json({
        message: "Files uploaded successfully.",
        urls,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }