import { Request, Response } from "express";
import Workspace from "../Models/Workspace";
import { GoogleGenAI, Type } from "@google/genai";
import { uploadFile } from "../Services/Cloudflare.services";
import { v5 as uuidv5 } from "uuid";
import PDFFiles from "../Models/PDFFile";
import {
  afterVerificationMiddlerwareInterface,
  prefileInterface,
  userActionsInterface,
} from "../Interfaces/Index";
import ImageFiles from "../Models/ImageFile";
import { formatFileSize } from "../utils/fileFormat.util";
import { fetchVideoData } from "../utils/youtube.utils";
import YouTubeVideo from "../Models/youtubeVideo";
import { processFiles } from "../utils/fileHandler.utils";
import { GEMINI_API_KEY, generateDetailedContent } from "../utils/gemini.utils";
import Quiz from "../Models/quiz";
import Question from "../Models/question";
import Chats from "../Models/Chat";
import Messages from "../Models/Message";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const userActions: userActionsInterface = {
  createWorkspace: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { name } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!name) {
      name = null;
    }

    try {
      if (name) {
        const workspaceExists = await Workspace.findOne({
          where: { name, userId: user.id },
        });
        if (workspaceExists) {
          return res
            .status(422)
            .json({ error: `A workspace named '${name}' exists.` });
        }
      }

      Workspace.create({
        name: name,
        userId: user.id,
      })
        .then(async(workspace) => {
          const hashedWorkspaceId = uuidv5(
            workspace.id.toString(),
            process.env.UUID_SECRET as string
          );

          const chat = await Chats.create({
            userId: user.id,
            workspaceId: hashedWorkspaceId,
          });

          await Workspace.update(
            { enc_id: hashedWorkspaceId },
            { where: { id: workspace.id } }
          );

          return res.status(201).json({
            success: true,
            message: "Workspace created successfully.",
            workspace_id: hashedWorkspaceId,
            name: workspace.name,
            chat
          });
        })
        .catch((error) => {
          console.error("Error creating workspace:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error creating workspace.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  askQuestion: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { question, workspace_id, thinking, mode, file_id } = req.body;
    let pdfFiles: PDFFiles[] | null = [];
    let imageFiles: ImageFiles[] | null = [];
    let youtubeVideos: YouTubeVideo[] | null = [];
    const userOriginalQuestion = question;

    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!question) {
      return res.status(400).json({ error: "Bad request." });
    }

    if (!thinking) {
      thinking = false;
    }

    try {
      if (mode == "workspace" && !workspace_id) {
        return res.status(400).json({ error: "Bad request." });
      }
  
      if (mode == "file" && !file_id) {
        return res.status(400).json({ error: "Bad request." });
      }
  
      if (mode == "workspace") {
        const workspaceExists = await Workspace.findOne({
          where: { enc_id: workspace_id },
          attributes: ["id"],
        });
  
        if (!workspaceExists) {
          return res.status(404).json({ error: "Workspace not found." });
        }
  
        pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace_id, chatId: null },
          attributes: ["filePath"],
        });
  
        imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace_id, chatId: null },
          attributes: ["filePath"],
        });
  
        youtubeVideos = await YouTubeVideo.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["description", "title"],
        });
  
        youtubeVideos = youtubeVideos.map(
          (video) => video.dataValues
        ) as unknown as YouTubeVideo[];
  
        question = `You are a student AI assistant. Based on the following:
  
                  - Provided documents
                  ${
                    youtubeVideos.length > 0
                      ? "- YouTube video descriptions\n"
                      : ""
                  }- Uploaded images
  
                  Answer the following question: ${question}.
  
                  Thoroughly analyze all sources:
                  - Review all documents${
                    youtubeVideos.length > 0
                      ? ", YouTube video descriptions,"
                      : ""
                  } and uploaded images in detail.
                  - Use the conversation in previous_messages to understand the user's context, goals, prior questions, and your past responses. This helps ensure continuity and relevance in your answer.
  
                  ${
                    youtubeVideos.length > 0
                      ? `If the question relates to a topic covered in a YouTube video, use the video description and your general web knowledge to answer thoroughly — as if you had watched the video — but **do not mention** the video, its title, or description. Your explanation must be standalone and clear.`
                      : ""
                  }
  
                  If the answer cannot be found in the documents${
                    youtubeVideos.length > 0 ? ", YouTube descriptions," : ""
                  }, uploaded images, or previous_messages, explicitly state that.
  
                  Your response must be:
                  - Very detailed and accurate
                  - Clear and easy to understand
                  - Well-structured: use section headings, subheadings, bullet points, code blocks (if needed), and appropriate spacing for high readability.`;
      } else if (mode == "file") {
        pdfFiles = await PDFFiles.findAll({ where: { id: file_id } });
        imageFiles = await ImageFiles.findAll({ where: { id: file_id } });
  
        question = `You are a helpful AI assistant for students.
  
                    Use **only** the provided context to answer the following question: ${question}.
  
                    You are provided with:
                    - Documents (text, PDFs, etc.)
                    ${
                      youtubeVideos.length > 0
                        ? "- YouTube video descriptions\n"
                        : ""
                    }- Uploaded images
  
                    Do **not** use any external knowledge or training beyond the given context.
  
                    ${
                      youtubeVideos.length > 0
                        ? `If the question relates to a topic covered in a YouTube video, use only the description to answer — but **do not mention** the video or its source.`
                        : ""
                    }
  
                    If the answer cannot be found in the provided documents, images, or conversation history, clearly state that the information is not available.
  
                    Your answer must be:
                    - Accurate and based solely on the provided context
                    - Clear, well-explained, and easy to understand
                    - Structured with headings, subheadings, bullet points, and code blocks where appropriate for readability.`;
      }
  
      async function analyzeDocumentsAndImages() {
        let parts: any[] = [];
  
        // Add the user's question as a prompt
        parts.push({ text: question });
  
        // Add YouTube videos
        if (youtubeVideos) {
          for (const video of youtubeVideos) {
            parts.push({
              text: `YouTube Video Title: ${video.title}\nDescription: ${video.description}`,
            });
          }
        }
  
        parts = await processFiles(parts, pdfFiles, imageFiles);
  
        const response = await ai.models.generateContent({
          model: process.env.THINKING_MODEL as string,
          contents: [
            {
              role: "user",
              parts: parts,
            },
          ],
        });
        const aiResponse = response.text;
  
        await Chats.findOne({where: {workspaceId: workspace_id}})
              .then(async (chat) => {
                await Messages.bulkCreate(
                  [
                    {
                      text: userOriginalQuestion,
                      chatId: chat?.id,
                      fromUser: true,
                      isFile: false,
                    },
                    {
                      text: aiResponse,
                      chatId: chat?.id,
                      fromUser: false,
                      isFile: false,
                    }
                  ]
                );
              })
  
        res.setHeader("Content-Type", "text/plain");
        return res.send(aiResponse);
      }
  
      analyzeDocumentsAndImages();
    } catch (error) {
      return res.status(500).json({error: 'Server error.'});
    }
  },

  generateMaterial: async (req: Request, res: Response) => {
    const { topic, word_range } = req.query;

    if (!topic) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      // const prompt = `Generate an extremely comprehensive, well-structured, and highly detailed PDF guide in Markdown format that fully explains the topic "${topic}" in a way that is accessible and easy for a student to understand. The guide should be long (at least 5,000–10,000 words if necessary), educational, and rich in content.
      //                       aThe document should:
      //                       Start with a detailed introduction, explaining the topic’s background, importance, and real-world applications.
      //                       Provide precise definitions of all key terms and concepts, with contextual explanations.
      //                       Break down complex ideas into simple, digestible parts, using analogies, storytelling, and practical examples.
      //                       Include visual aids (diagrams, illustrations, tables, or charts), or clearly indicate where such visuals should be placed.
      //                       Give step-by-step explanations for processes, workflows, formulas, or problem-solving techniques, with sample problems and solutions where appropriate.
      //                       Include real-life use cases, industry practices, and related case studies to strengthen understanding.
      //                       Provide revision tables, mnemonics, or summarized charts for key points.
      //                       Include a FAQ section addressing likely student questions, misconceptions, or confusions.
      //                       End with a recap of key takeaways, glossary, further reading suggestions, and practice questions or exercises with solutions.
      //                       The tone should be engaging, clear, and student-friendly, assuming no prior expertise in the subject.
      //                       Use proper formatting: section headings, subheadings, bullet points, code blocks (if applicable), and spacing for high readability.
      //                       Make sure the guide is long enough to serve as a standalone learning resource or mini-textbook on the topic.`;
      
      const prompt = `Generate an extremely comprehensive, well-structured, and highly detailed PDF guide in Markdown format that fully explains the topic "${topic}" in a way that is accessible and easy for a student to understand. The guide should be long (at least ${
        word_range ? word_range : "5,000–10,000"
      } words if necessary), educational, and rich in content.
                      The document should:
                      - Start with a detailed introduction, explaining the topic’s background, importance, and real-world applications.
                      - Provide precise definitions of all key terms and concepts, with contextual explanations.
                      - Break down complex ideas into simple, digestible parts, using analogies, storytelling, and practical examples.
                      - Include visual aids (diagrams, illustrations, tables, or charts) using proper Markdown image syntax, like: 
                        ![Descriptive Alt Text](https://your-domain.com/path/to/diagram.png)  
                        Do NOT write placeholders like [Diagram: XYZ]. Always use valid Markdown image syntax with actual images from the internet.
                      - Give step-by-step explanations for processes, workflows, formulas, or problem-solving techniques, with sample problems and solutions where appropriate.
                      - Include real-life use cases, industry practices, and related case studies to strengthen understanding.
                      - Provide revision tables, mnemonics, or summarized charts for key points.
                      - Include a FAQ section addressing likely student questions, misconceptions, or confusions.
                      - End with a recap of key takeaways, glossary, further reading suggestions, and practice questions or exercises with solutions.

                      The tone should be engaging, clear, and student-friendly, assuming no prior expertise in the subject.

                      Use proper Markdown formatting: section headings, subheadings, bullet points, code blocks (if applicable), and spacing for high readability. Make sure the guide is long enough to serve as a standalone learning resource or mini-textbook on the topic.`;

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: prompt,
      });

      const text = response.text;
      res.setHeader("Content-Type", "text/plain");
      return res.send(text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  addFiles: async (
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
        return res
          .status(400)
          .json({
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
  },

  generateQuiz: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, name, size, duration } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!workspace_id || !size || !name || !duration) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const pdfFiles = await PDFFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const imageFiles = await ImageFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const prompt = `Generate a quiz with ${size} questions and answers on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
      let parts: any[] = [];

      parts.push({ text: prompt });

      parts = await processFiles(parts, pdfFiles, imageFiles);

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description:
              "List of quiz questions with options and correct answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The quiz question.",
                  nullable: false,
                },
                options: {
                  type: Type.ARRAY,
                  description: "Multiple choice answer options.",
                  items: {
                    type: Type.STRING,
                  },
                  nullable: false,
                },
                correct_answer: {
                  type: Type.STRING,
                  description: "The correct answer from the options.",
                  nullable: false,
                },
                explanation: {
                  type: Type.STRING,
                  description:
                    "explanation why the correct answer is the correct answer based on what is in the documents and additional images provided. Make sure to describe the document reference and the image reference too.",
                  nullable: false,
                },
              },
              required: [
                "question",
                "options",
                "correct_answer",
                "explanation",
              ],
            },
          },
        },
      });

      const json = JSON.parse(response.text as string);
      let quiz_id = "";
      if (json.length > size) {
        json.length = size;
      }
      Quiz.create({
        name: name,
        creator: user.name,
        userId: user.id,
        workspaceId: workspace_id,
        duration: duration,
      })
        .then(async (quiz) => {
          quiz_id = quiz.id as any;

          // Map the questions creation into an array of promises
          const questionPromises = json.map((item: any) => {
            return Question.create({
              quizId: quiz.id,
              question: item.question,
              options: item.options,
              correctAnswer: item.correct_answer,
              explanation: item.explanation,
            });
          });

          // Wait for all question creations to complete
          try {
            await Promise.all(questionPromises);

            // Send response after all questions created
            return res.status(200).json({
              success: true,
              quiz_id: quiz_id,
              message: "Quiz created successfully.",
            });
          } catch (error) {
            console.error("Error creating questions:", error);
            return res.status(500).json({
              error: "Server error.",
              message: "Error creating questions.",
            });
          }
        })
        .catch((error) => {
          console.error("Error creating quiz:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error creating quiz.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  generateFlashcards: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, size } = req.body;

    if (!workspace_id || !size) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const pdfFiles = await PDFFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const imageFiles = await ImageFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const prompt = `Generate a ${size} of flashcard based on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
      let parts: any[] = [];

      parts.push({ text: prompt });

      parts = await processFiles(parts, pdfFiles, imageFiles);

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of flashcards with questions and answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description:
                    "The question or prompt on one side of the flashcard.",
                  nullable: false,
                },
                answer: {
                  type: Type.STRING,
                  description:
                    "The answer or explanation on the other side of the flashcard.",
                  nullable: false,
                },
              },
              required: ["question", "answer"],
            },
          },
        },
      });

      res.setHeader("Content-Type", "application/json");
      return res.send(response.text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  getWorkspace: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!id) {
        const workspaces = await Workspace.findAll({
          where: { userId: user.id },
          attributes: { exclude: ["id", "createdAt", "updatedAt", "userId"] },
        });

        return res.status(200).json({
          success: true,
          message: "Workspaces retrieved successfully.",
          workspaces,
        });
      } else {
        let workspace = await Workspace.findOne({
          where: { enc_id: id, userId: user.id },
          attributes: { exclude: ["id", "createdAt", "updatedAt", "userId"] },
        });

        if (!workspace) {
          return res.status(404).json({ error: "Workspace not found." });
        }

        const imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: ["id", "filePath", "fileName", "size"],
        });

        const pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: ["id", "filePath", "fileName", "size"],
        });

        const youtubeVideos = await YouTubeVideo.findAll({
          where: { workspaceId: workspace?.dataValues.enc_id },
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        });

        if (!workspace) {
          return res.status(404).json({ error: "Workspace not found." });
        }

        const files = {
          imageFiles,
          pdfFiles,
          youtubeVideos,
        };

        workspace = {
          ...workspace.get({ plain: true }),
          files,
        };

        return res.status(200).json({
          success: true,
          message: "Workspace retrieved successfully.",
          workspace,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  getYoutubeVideo: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const videoData = await fetchVideoData(id);
      if (!videoData) {
        return res.status(404).json({ error: "Video not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Video retrieved successfully.",
        videoData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  addYoutubeVideo: async (
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
  },

  generateRandomFact: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      const prompt = `Generate 8 unique, non-repeating educational fact from a random subject like space, biology, physics, chemistry, math, art, philosophy, literature, history, general studies, or others. Each fact should introduce fresh knowledge or context, be accurate, and not exceed 50 words. Rotate subjects frequently to ensure diversity.enerate a random educational fact ranging from philosophy to physics, math, english, general studies, history and many more for a student, providing new knowledge or context. It must be accurate and must be a different one everytime. not more than only 50 words.`;

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of random educational facts.",
            items: {
              type: Type.STRING,
              description: "A random educational fact.",
              nullable: false,
            },
            minimum: 8,
            maximum: 8,
          },
        },
      });

      const text = response.text;
      res.setHeader("Content-Type", "application/json");
      return res.send(text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  suggestQuestion: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, mode, file_url } = req.body;
    let pdfFiles: any = [];
    let imageFiles: any = [];
    let prompt = "";
    let summary = "";

    if (mode == "workspace") {
      if (!workspace_id) {
        return res.status(400).json({ error: "Bad request." });
      }
    }

    try {
      if (mode == "workspace") {
        pdfFiles = await PDFFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });

        imageFiles = await ImageFiles.findAll({
          where: { workspaceId: workspace_id },
          attributes: ["filePath"],
        });
      } else if (mode == "file") {
        pdfFiles = await PDFFiles.findOne({
          where: { filePath: file_url },
          attributes: ["summary"],
        });

        if (pdfFiles) {
          summary = pdfFiles.sumarry;
        }

        imageFiles = await ImageFiles.findOne({
          where: { filePath: file_url },
          attributes: ["summary"],
        });

        if (imageFiles) {
          summary = imageFiles.dataValues.summary;
        }
      } else {
        return res
          .status(400)
          .json({
            error: "Bad request.",
            message: "Invalid mode parameter passed.",
          });
      }

      mode == "workspace"
        ? (prompt = `Based on the provided documents and images, suggest 3 short unique, contextual questions for students to ask you that require students to explain or demonstrate and deepen their understanding of the material in the workspace. Avoid questions that reference specific slides, pages, or sections directly. Focus on questions that encourage comprehension, critical thinking, and application of the content in a meaningful way.`)
        : (prompt = `Based on the provided summary, suggest 3 short unique, contextual questions for students to ask you that require students to explain or demonstrate and deepen their understanding of the material from the sumarry provided. Avoid questions that reference specific slides, pages, or sections directly. Focus on questions that encourage comprehension, critical thinking, and application of the content in a meaningful way.`);

      let parts: any[] = [];
      parts.push({ text: prompt });

      mode == "workspace"
        ? (parts = await processFiles(parts, pdfFiles, imageFiles))
        : parts.push({ text: summary });

      const response = await ai.models.generateContent({
        model: process.env.REGULAR_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of suggested questions.",
            items: {
              type: Type.STRING,
              description: "questions.",
              nullable: false,
            },
            minItems: "3",
            maxItems: "3",
          },
        },
      });

      res.setHeader("Content-Type", "application/json");
      return res.send(response.text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  getQuiz: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { quiz_id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    try {
      if (!quiz_id) {
        return res.status(400).json({ error: "Bad request." });
      }

      const quiz = await Quiz.findOne({
        where: { id: quiz_id, userId: user.id },
        attributes: { exclude: ["userId"] },
      });

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      const questions = await Question.findAll({
        where: { quizId: quiz.id },
        attributes: { exclude: ["createdAt", "updatedAt", "id", "quizId"] },
      });

      return res.status(200).json({
        success: true,
        message: "Quiz retrieved successfully.",
        quiz,
        questions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  deleteFiles: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, file_url } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!workspace_id || !file_url) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const workspaceExists = await Workspace.findOne({
        where: { enc_id: workspace_id, userId: user.id },
        attributes: ["id"],
      });

      if (!workspaceExists) {
        return res.status(404).json({ error: "Workspace not found." });
      }

      const fileExists = await PDFFiles.findOne({
        where: { filePath: file_url, workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const imageExists = await ImageFiles.findOne({
        where: { filePath: file_url, workspaceId: workspace_id },
        attributes: ["filePath"],
      });

      const youtubeExists = await YouTubeVideo.findOne({
        where: { videoId: file_url, workspaceId: workspace_id },
        attributes: ["videoId"],
      });

      if (!fileExists && !imageExists && !youtubeExists) {
        return res.status(404).json({ error: "File not found." });
      }

      const succcesspayload = {
        success: true,
        message: "File deleted successfully.",
      };

      if (fileExists && !imageExists && !youtubeExists) {
        await PDFFiles.destroy({
          where: { filePath: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else if (imageExists && !fileExists && !youtubeExists) {
        await ImageFiles.destroy({
          where: { filePath: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else if (youtubeExists && !fileExists && !imageExists) {
        await YouTubeVideo.destroy({
          where: { videoId: file_url, workspaceId: workspace_id },
        });

        return res.status(200).json(succcesspayload);
      } else {
        return res.status(400).json({ error: "Bad request." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  getFile: async (
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
      return res.status(500).json({error: 'Server error.'});
    }
  },

  sendChat: async (
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
        return res
          .status(400)
          .json({
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
                          : previous_messages?.trim()
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

      const filesArray: { url: string } & Express.Multer.File[] =
        [] as any;

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
            const bucket = `chat_${chat_id}`

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

        Messages.create({
          text,
          chatId: chat_id,
          fromUser: true,
          isFile: false,
        });
        processedFiles.forEach(async (file) => {
          await Messages.bulkCreate(
            [
              {
                text: file.originalname,
                chatId: chat_id,
                fromUser: true,
                isFile: true,
                filePath: file.url
              }
            ]
          );
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
              data: Buffer.from(file.buffer).toString('base64'),
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

      return res.status(200).json({answer, chat_id});
    } catch (error) {
      res.status(500).json({error: 'Server error.'});
    }
  },

  createChat: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;

    try {
      if (!user) {
        return res.status(401).json({ error: "Unauthoruized access." });
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
      return res.status(500).json({error: 'Server error.'});
    }
  },

  getChat: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const user = req.user;
    const { page = 1, chat_id } = req.query;

  
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
  
    if (!chat_id) {
      return res.status(400).json({ error: "chat_id is required." });
    }
  
    const limit = 20;
    const offset = (page as number - 1) * limit;
  
    try {
      const chat = await Chats.findOne({where:{id: chat_id}, attributes: {exclude: ['createdAt', 'updatedAt', 'userId']}});

      if(!chat){
        return res.status(404).json({error: 'Chat not found'})
      }


      const messages = await Messages.findAll({
        where: { chatId: chat_id },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        attributes: {exclude: ['id', 'chatId']}
      });
  
      messages.reverse();
      return res.status(200).json({ page, messages, chat });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
  
};

export default userActions;
