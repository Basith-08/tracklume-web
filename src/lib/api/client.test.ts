import { describe, expect, it } from "vitest";
import { ApiError, queryString } from "./client";

describe("API client utilities", () => {
  it("serializes only meaningful query params", () => {
    expect(
      queryString({ search: "bug fix", status: "all", page: 2, empty: "" }),
    ).toBe("search=bug+fix&page=2");
  });
  it("retains normalized server error fields", () => {
    const error = new ApiError(
      422,
      "Request validation failed",
      "VALIDATION_ERROR",
      { title: ["Title is required"] },
      "req-1",
    );
    expect(error.status).toBe(422);
    expect(error.fields?.title).toEqual(["Title is required"]);
    expect(error.requestId).toBe("req-1");
  });
});
