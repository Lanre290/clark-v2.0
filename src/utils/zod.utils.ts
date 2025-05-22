import z from 'zod';

export const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    nickname: z.string(),
    password: z.string(),
    role: z.string(),
    school: z.string(),
    department: z.string(),
    interests: z.array(z.string()),
    study_vibe: z.string(),
    oauth: z.boolean().optional(),
    oauth_method: z.string().optional(),
    oauth_token: z.string().optional(),
  });