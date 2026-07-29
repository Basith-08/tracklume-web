import { describe, expect, it } from "vitest";
import { priorityLabels, statusLabels, typeLabels } from "./labels";

describe("issue labels", () => {
  it("covers every backend enum", () => {
    expect(Object.keys(statusLabels)).toEqual([
      "backlog",
      "todo",
      "in_progress",
      "done",
      "cancelled",
    ]);
    expect(priorityLabels.urgent).toBe("Urgent");
    expect(typeLabels.feature).toBe("Feature");
  });
});
