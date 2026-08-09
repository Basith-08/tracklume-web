import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownContent } from "./markdown-content";

describe("MarkdownContent", () => {
  afterEach(cleanup);

  it("renders the Markdown commonly used in issue descriptions", () => {
    render(
      <MarkdownContent
        content={`## Objective

Ship **this** with [docs](https://example.com).

- First item
- Second item

\`\`\`bash
pnpm build
\`\`\``}
      />,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Objective",
    );
    expect(screen.getByText("this").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByRole("list")).toHaveTextContent("First item");
    expect(screen.getByText("pnpm build").tagName).toBe("CODE");
  });

  it("does not create links for unsafe protocols", () => {
    render(<MarkdownContent content="[click](javascript:alert)" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("click")).toBeInTheDocument();
  });
});
