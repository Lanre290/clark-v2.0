import { Request, Response } from "express";
import { ai } from "../../Services/gemini.services";
import { Type } from "@google/genai";

export const generateMaterial = async (req: Request, res: Response) => {
    const { topic, pages, is_tag, user_message } = req.body;
    const files = req.files as Express.Multer.File[];

    try {
      let prompt = "";
      if (files && files.length > 0) {
        prompt = `You are provided with one or more files (documents, PDFs, images, etc). Using ONLY the content of the uploaded file(s), generate an extremely comprehensive, well-structured, and highly detailed PDF guide in Markdown format ${
          topic ? 'that fully explains the topic "' + topic : ""
        }" in a way that is accessible and easy for a student to understand. The guide should be long (at least ${
          pages && !is_tag ? pages : "5"
        } pages where one page is about 450 words), educational, and rich in content.
            ${
              is_tag
                ? "Here is the user's specific request: " + user_message
                : ""
            }
            HIGHLY PRIORTIZE USERS REQUEST
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

            Use proper Markdown formatting: section headings, subheadings, bullet points, code blocks (if applicable), and spacing for high readability. Make sure the guide is long enough to serve as a standalone learning resource or mini-textbook on the topic.

            IMPORTANT: Only use information found in the uploaded file(s). If the answer is not present in the files, politely state that the information is unavailable.`;
      } else {
        prompt = `Generate an extremely comprehensive, well-structured, and highly detailed PDF guide in Markdown format ${
          topic ? 'that fully explains the topic "' + topic : ""
        }" in a way that is accessible and easy for a student to understand. The guide should be long (at least ${
          pages && !is_tag ? pages : "5"
        } pages where one page is about 450 words), educational, and rich in content.
        ${is_tag ? "Here is the user's specific request: " + user_message : ""}
          HIGHLY PRIORTIZE USERS REQUEST
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
      }

      const parts: any[] = [];
      parts.push({ text: prompt });

      if (files && files.length > 0) {
        for (const file of files) {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: Buffer.from(file.buffer).toString("base64"),
            },
          });
        }
      }

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
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The generated content.",
              },
              successful: {
                type: Type.BOOLEAN,
                description:
                  "Indicates if the material was generated successfully or you couldn't due to some reasons.",
              },
            },
            required: ["text", "successful"],
          },
        },
      });

      const json = JSON.parse(response.text as string);
      const text = json.text;
      const pdfGenerated = json.successful;
      return res.status(200).json({ text, pdfGenerated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }