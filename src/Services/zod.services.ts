import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[A-Za-z0-9\s_]+$/, "Username must only contain letters, numbers, spaces, or underscores"),
  email: z
    .string()
    .email("Invalid email format"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1, "Username is required"),
});

export const exp = z.object({
  workspace_id: z.string().min(1, "Workspace ID is required"),
  person_two_name: z.string().min(1, "Person two name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  expiresAt: z
    .string()
    .regex(/^(\d+)([dh])$/, "Invalid expiry date format")
    .optional(),
  is_public: z.boolean().optional(),
})


export const addFileSchema = z.object({
  workspace_id: z.string().min(1, "Workspace ID is required")
});

export const addYoutubeVideoSchema = z.object({
  video_id: z.number().min(1, "Video ID is required"),
  workspace_id: z.string().min(1, "Workspace ID is required")
});

export const askQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  workspace_id: z.string().min(1, "Workspace ID is required"),
  thinking: z.string().min(1, "Thinking is required"),
  mode: z.string().min(1, "Mode is required"),
  file_id: z.string().optional(),
  previous_messages: z.string().optional(),
})