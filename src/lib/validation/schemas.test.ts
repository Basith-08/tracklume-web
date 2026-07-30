import { describe, expect, it } from "vitest";
import {
  issueSchema,
  loginSchema,
  projectSchema,
  registerSchema,
} from "./schemas";

describe("validation schemas", () => {
  it("requires a valid login", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
      false,
    );
    expect(
      loginSchema.safeParse({
        email: "owner@tracklume.local",
        password: "secret",
      }).success,
    ).toBe(true);
  });
  it("keeps project keys predictable", () => {
    expect(
      projectSchema.safeParse({ name: "Web", key: "WEB", description: "" })
        .success,
    ).toBe(true);
    expect(
      projectSchema.safeParse({ name: "Web", key: "1BAD", description: "" })
        .success,
    ).toBe(false);
  });
  it("rejects mismatched registration passwords", () => {
    const result = registerSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "password",
      confirm_password: "different",
    });
    expect(result.success).toBe(false);
  });
  it("requires an issue title", () => {
    expect(
      issueSchema.safeParse({
        title: "",
        description: "",
        type: "task",
        status: "todo",
        priority: "medium",
        assignee_id: null,
        due_date: null,
      }).success,
    ).toBe(false);
  });
});
