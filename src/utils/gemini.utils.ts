import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import PDFFiles from "../Models/PDFFile";
import ImageFiles from "../Models/ImageFile";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "GEMINI_API_KEY";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});


export async function generateDetailedContent(url: string, mimeType: string) {
    const pdfResp = await axios.get(url, {
        responseType: "arraybuffer",
      });
    const data = Buffer.from(pdfResp.data).toString("base64");

    const response = await ai.models.generateContent({
    model: process.env.THINKING_MODEL as string,
    contents: [
        {
        role: "user",
        parts: [
            {
            text: `You are an expert study assistant tasked with creating a comprehensive and standalone study guide based on the uploaded material (PDFs, images, video descriptions, or text).
                    Your goal is to produce a detailed resource covering all key concepts, definitions, explanations, and examples. However, if certain parts of the material (such as images or very short texts) contain limited information, provide concise summaries for those sections without unnecessary elaboration.

                    Instructions:

                    - Begin with a clear summary of the overall topic.
                    - Organize the guide into logical sections with headings and subheadings.
                    - For text-heavy sections, provide thorough explanations, relevant formulas, examples, and detailed insights.
                    - For images or short notes with limited content, create brief but accurate descriptions or summaries that capture the essential information without padding.
                    - Use bullet points and numbered lists where appropriate for clarity.
                    - Avoid mentioning or referencing the original files, videos, or descriptions—this guide must be fully self-contained.
                    - Write in a clear, student-friendly style, ensuring the material is easy to understand.
                    - Balance depth with brevity: be as detailed as needed, but avoid verbosity when the content is simple or minimal.
                    - Include any relevant formulas, diagrams described in text, and practical examples.

                    Your output will be saved as a definitive study resource for fast, accurate future answers without needing to reprocess the original material.

                    Start with a detailed overview of the topic, then proceed section by section, adapting your level of detail to the content richness of each part.
                    `,
            },
            {
            inlineData: {
                mimeType: mimeType,
                data: data,
            },
            }
        ],
        },
    ],
    });

    const text = response.text;

    if(mimeType === "application/pdf"){
        PDFFiles.update({
            summary: text,
        }, {
            where: {
                filePath: url,
            }
        });
    }
    else if(mimeType.includes("image")){
        ImageFiles.update({
            summary: text,
        }, {
            where: {
                filePath: url,
            }
        });
    }
}