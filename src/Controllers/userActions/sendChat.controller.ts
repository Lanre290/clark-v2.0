import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Chats from "../../Models/Chat";
import PDFFiles from "../../Models/PDFFile";
import ImageFiles from "../../Models/ImageFile";
import { uploadFile } from "../../Services/Cloudflare.services";
import { formatFileSize } from "../../utils/fileFormat.util";
import Messages from "../../Models/Message";
import { processFiles } from "../../utils/fileHandler.utils";
import { ai } from "../../Services/gemini.services";

export const sendChat = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      let { chat_id, text, previous_messages, strict_mode } = req.body;
      const user = req.user;
      const files = req.files;

      if (!user || !user.id) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      if (files && files != undefined && (files.length as number) > 10) {
        return res.status(400).json({
          error: "Bad request",
          message: "File to be uploaded at the same time cannot exceed 10.",
        });
      }

      const prompt = `You are a highly intelligent assistant. Please answer the user's question using the following rules:

                      1. If any files are provided, use them as your **primary source**.
                      2. If no files are provided but there is a previous conversation, use that as context.
                      3. ${
                        strict_mode
                          ? "**Strict Mode is ON**: Only rely on the provided files, if provided. Do not use outside knowledge."
                          : "**Strict Mode is OFF**: You may supplement with outside knowledge if needed."
                      }
                      4. If neither files nor conversation are provided, answer the question using your general knowledge.

                      📌 Format your response to be:
                      - **Well-organized** and easy to read
                      - Use **headings**, **horizontal lines (---)**, **bullet points**, **numbered steps**, **tables**, or **ASCII diagrams** when helpful
                      - Be visually pleasant and “sweet” to look at, even if technical

                      ---

                      ${
                        files?.length
                          ? `🗂️ Files have been provided. Use them as your primary reference.`
                          : previous_messages
                          ? `💬 Previous conversation:\n${previous_messages}`
                          : `❗ No prior context is available.`
                      }

                      ---

                      RESPOND IN PURE CLEAN MARKDOWN TEXT FORMAT❗❗❗

                      ❓ **User Question:**
                      ${text}
                      `;

      // create chat if its not provided.
      if (!chat_id) {
        await Chats.create({
          userId: user.id,
        }).then((chat) => {
          chat_id = chat.id;
        });
      }

      let parts: any[] = [];
      parts.push({ text: prompt });

      const filesArray: { url: string } & Express.Multer.File[] = [] as any;

      const pdfFiles = await PDFFiles.findAll({
        where: { chatId: chat_id, workspaceId: null },
        attributes: ["filePath"],
      });

      const imageFiles = await ImageFiles.findAll({
        where: { chatId: chat_id, workspaceId: null },
        attributes: ["filePath"],
      });

      if (files !== undefined && (files.length as number) > 0) {
        const uploadPromises = (files as Express.Multer.File[]).map(
          async (file) => {
            let key = `${Date.now()}_${file.originalname}`;

            key = key.replace(/[^a-zA-Z0-9.]/g, "_");
            const bucket = `chat_${chat_id}`;

            const url = `https://${process.env.R2_ENDPOINT_DOMAIN}/${bucket}/${key}`;
            await uploadFile(bucket, bucket, key, file.buffer, file.mimetype);

            if (file.mimetype.includes("pdf")) {
              await PDFFiles.create({
                fileName: file.originalname,
                chatId: chat_id,
                userId: user.id,
                filePath: url,
                size: formatFileSize(file.size),
              });
            } else if (file.mimetype.includes("image")) {
              await ImageFiles.create({
                fileName: file.originalname,
                size: formatFileSize(file.size),
                chatId: chat_id,
                userId: user.id,
                filePath: url,
              });
            }

            const newFile = {
              ...file,
              url,
            } as Express.Multer.File & { url: string };

            filesArray.push(newFile);

            return newFile;
          }
        );

        const processedFiles = await Promise.all(uploadPromises);

        await Messages.create({
          text,
          chatId: chat_id,
          fromUser: true,
          isFile: false,
        });
        processedFiles.forEach(async (file) => {
          await Messages.create(
            {
              text: file.originalname,
              chatId: chat_id,
              fromUser: true,
              isFile: true,
              filePath: file.url,
              size: formatFileSize(file.size),
            });
        });
      } else {
        await Messages.create({
          text: text,
          chatId: chat_id,
          fromUser: true,
        });
      }

      parts = await processFiles(parts, pdfFiles, imageFiles);

      // add the current uploaded files
      parts.push(
        ...(files as Express.Multer.File[]).map((file) => ({
          inlineData: {
            mimeType: file.mimetype,
            data: Buffer.from(file.buffer).toString("base64"),
          },
        }))
      );

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
      });

      const answer = response.text;

      await Messages.create({
        text: answer,
        chatId: chat_id,
        fromUser: false,
      });

      return res.status(200).json({ answer, chat_id });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  }