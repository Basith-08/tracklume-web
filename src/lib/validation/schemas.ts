import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export const projectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  key: z
    .string()
    .trim()
    .min(2, "Key is required")
    .max(8, "Use up to 8 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*$/,
      "Start with a letter; use letters, numbers, - or _",
    ),
  description: z.string().max(500, "Keep the description under 500 characters"),
});
export const issueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Keep the title under 200 characters"),
  description: z.string().max(10000, "Description is too long"),
  type: z.enum(["task", "bug", "feature"]),
  status: z.enum(["backlog", "todo", "in_progress", "done", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee_id: z.string().nullable(),
  due_date: z.string().nullable(),
});
export const memberSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "member", "viewer"]),
});
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  avatar_url: z.string().url("Enter a valid URL").or(z.literal("")),
});
export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type IssueInput = z.infer<typeof issueSchema>;
