import { z } from "zod";

export const signinSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6)
});

export const signupSchema = z.object({
    name: z.string().min(3),
    username: z.string().email(),
    password: z.string().min(6)
});
