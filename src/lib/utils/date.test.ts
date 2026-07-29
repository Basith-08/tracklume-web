import { describe, expect, it } from "vitest";
import { formatDate, initials } from "./date";

describe("date helpers", () => {
  it("handles empty and invalid dates safely", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
  it("creates stable user initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials()).toBe("?");
  });
});
