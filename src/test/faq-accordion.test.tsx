import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FaqAccordion } from "@/components/site/FaqAccordion";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
}));

afterEach(cleanup);

describe("FAQ expansion rules", () => {
  it("starts with every answer closed", () => {
    render(<FaqAccordion />);
    for (const question of screen.getAllByRole("button")) {
      expect(question).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("opens an answer and closes it when clicked again", () => {
    render(<FaqAccordion />);
    const question = screen.getAllByRole("button")[0];
    if (!question) throw new Error("No question rendered");
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "false");
  });

  it("allows only one open answer, including across categories", () => {
    render(<FaqAccordion />);
    const questions = screen.getAllByRole("button");
    const first = questions[0];
    const otherCategory = questions[4];
    if (!first || !otherCategory) throw new Error("Missing FAQ categories");
    fireEvent.click(first);
    fireEvent.click(otherCategory);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(otherCategory).toHaveAttribute("aria-expanded", "true");
    expect(questions.filter((question) => question.getAttribute("aria-expanded") === "true")).toHaveLength(1);
  });
});