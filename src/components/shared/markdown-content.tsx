import type { ReactNode } from "react";

type MarkdownBlock =
  | { type: "heading"; level: number; content: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "code"; language: string; content: string };

function isBlockStart(line: string) {
  return (
    /^ {0,3}#{1,6}\s+/.test(line) ||
    /^ {0,3}[-*+]\s+/.test(line) ||
    /^ {0,3}\d+[.)]\s+/.test(line) ||
    /^ {0,3}>\s?/.test(line) ||
    /^ {0,3}```/.test(line)
  );
}

function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;

    const fence = line.match(/^ {0,3}```\s*([\w+-]*)\s*$/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^ {0,3}```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({
        type: "code",
        language: fence[1],
        content: codeLines.join("\n"),
      });
      continue;
    }

    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        content: heading[2],
      });
      continue;
    }

    const unordered = line.match(/^ {0,3}[-*+]\s+(.+)$/);
    const ordered = line.match(/^ {0,3}\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const items = [((unordered ?? ordered) as RegExpMatchArray)[1]];
      const orderedList = Boolean(ordered);
      while (index + 1 < lines.length) {
        const next = lines[index + 1].match(
          orderedList ? /^ {0,3}\d+[.)]\s+(.+)$/ : /^ {0,3}[-*+]\s+(.+)$/,
        );
        if (!next) break;
        items.push(next[1]);
        index += 1;
      }
      blocks.push({ type: "list", ordered: orderedList, items });
      continue;
    }

    if (/^ {0,3}>\s?/.test(line)) {
      const quoteLines = [line.replace(/^ {0,3}>\s?/, "")];
      while (index + 1 < lines.length && /^ {0,3}>\s?/.test(lines[index + 1])) {
        index += 1;
        quoteLines.push(lines[index].replace(/^ {0,3}>\s?/, ""));
      }
      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    const paragraph = [line];
    while (
      index + 1 < lines.length &&
      lines[index + 1].trim() &&
      !isBlockStart(lines[index + 1])
    ) {
      index += 1;
      paragraph.push(lines[index]);
    }
    blocks.push({ type: "paragraph", lines: paragraph });
  }

  return blocks;
}

function safeHref(href: string) {
  const value = href.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://tracklume.invalid");
    return ["http:", "https:", "mailto:"].includes(url.protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

function renderInline(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let text = "";
  let index = 0;
  let key = 0;

  const flushText = () => {
    if (text) {
      nodes.push(text);
      text = "";
    }
  };

  while (index < value.length) {
    if (value[index] === "`") {
      const end = value.indexOf("`", index + 1);
      if (end !== -1) {
        flushText();
        nodes.push(
          <code
            key={`${keyPrefix}-${key++}`}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {value.slice(index + 1, end)}
          </code>,
        );
        index = end + 1;
        continue;
      }
    }

    const imageOrLink = value
      .slice(index)
      .match(/^(!?)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (imageOrLink) {
      const href = safeHref(imageOrLink[3]);
      flushText();
      if (href && !imageOrLink[1]) {
        nodes.push(
          <a
            key={`${keyPrefix}-${key++}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            {renderInline(imageOrLink[2], `${keyPrefix}-link`)}
          </a>,
        );
      } else {
        nodes.push(imageOrLink[2]);
      }
      index += imageOrLink[0].length;
      continue;
    }

    const strong = value.slice(index).match(/^(\*\*|__)(.+?)\1/);
    if (strong) {
      flushText();
      nodes.push(
        <strong key={`${keyPrefix}-${key++}`}>
          {renderInline(strong[2], `${keyPrefix}-strong`)}
        </strong>,
      );
      index += strong[0].length;
      continue;
    }

    const strike = value.slice(index).match(/^~~(.+?)~~/);
    if (strike) {
      flushText();
      nodes.push(
        <del key={`${keyPrefix}-${key++}`}>
          {renderInline(strike[1], `${keyPrefix}-strike`)}
        </del>,
      );
      index += strike[0].length;
      continue;
    }

    const emphasis = value.slice(index).match(/^(\*|_)([^\s].+?)\1/);
    if (emphasis) {
      flushText();
      nodes.push(
        <em key={`${keyPrefix}-${key++}`}>
          {renderInline(emphasis[2], `${keyPrefix}-emphasis`)}
        </em>,
      );
      index += emphasis[0].length;
      continue;
    }

    text += value[index];
    index += 1;
  }
  flushText();
  return nodes;
}

function headingClassName(level: number) {
  return {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-base",
    5: "text-sm",
    6: "text-sm",
  }[level];
}

function InlineLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {renderInline(line, `line-${index}`)}
        </span>
      ))}
    </>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-sm leading-7 text-foreground">
      {parseBlocks(content).map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as keyof JSX.IntrinsicElements;
          return (
            <Heading
              key={index}
              className={`${headingClassName(block.level)} font-semibold leading-tight`}
            >
              {renderInline(block.content, `heading-${index}`)}
            </Heading>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={index}
              className={block.ordered ? "list-decimal pl-6" : "list-disc pl-6"}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-primary/40 pl-4 text-muted-foreground"
            >
              <InlineLines lines={block.lines} />
            </blockquote>
          );
        }
        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100"
            >
              <code data-language={block.language || undefined}>
                {block.content}
              </code>
            </pre>
          );
        }
        return (
          <p key={index}>
            <InlineLines lines={block.lines} />
          </p>
        );
      })}
    </div>
  );
}
