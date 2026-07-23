import { describe, expect, it } from "vitest";
import { formatDate, formatDateShort, slugifyTag } from "./posts";

describe("slugifyTag", () => {
  it("lowercases and hyphenates multi-word tags", () => {
    expect(slugifyTag("Market Analysis")).toBe("market-analysis");
  });

  it("strips characters that aren't alphanumeric", () => {
    expect(slugifyTag("401(k) & IRA!")).toBe("401-k-ira");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyTag("  --Tax Tips--  ")).toBe("tax-tips");
  });
});

describe("formatDate", () => {
  it("renders a long-form UTC date", () => {
    expect(formatDate("2026-01-15")).toBe("January 15, 2026");
  });
});

describe("formatDateShort", () => {
  it("renders a short-form UTC date", () => {
    expect(formatDateShort("2026-01-15")).toBe("Jan 15, 2026");
  });
});
