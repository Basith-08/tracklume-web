import { describe, expect, it } from "vitest";
import {
  canCreateIssue,
  canDeleteIssue,
  canManageMembers,
  canManageProject,
} from "./permissions";

describe("role permissions", () => {
  it("keeps viewers read-only", () => {
    expect(canCreateIssue("viewer")).toBe(false);
    expect(canDeleteIssue("viewer")).toBe(false);
    expect(canManageMembers("viewer")).toBe(false);
  });
  it("allows owners to manage the project", () => {
    expect(canManageProject("owner")).toBe(true);
    expect(canManageMembers("owner")).toBe(true);
    expect(canDeleteIssue("owner")).toBe(true);
  });
});
