import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppShowcase, HowItWorks } from "@/components/site/Sections";

const locale = vi.hoisted(() => ({ pathname: "/en" }));
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: locale.pathname } }),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
}));
afterEach(cleanup);

it("switches all six screenshots with the route language and restores Portuguese originals", () => {
  const view = render(<><HowItWorks /><AppShowcase /></>);
  const sources = () => screen.getAllByRole("img").map(image => image.getAttribute("src"));
  for (const language of ["en", "es"]) {
    locale.pathname = `/${language}/app`;
    view.rerender(<><HowItWorks /><AppShowcase /></>);
    expect(sources()).toHaveLength(6);
    for (const source of sources()) expect(source).toContain(`-${language}.png`);
    expect(new Set(sources()).size).toBe(6);
  }
  locale.pathname = "/app";
  view.rerender(<><HowItWorks /><AppShowcase /></>);
  expect(sources().map(source => source?.split("/").at(-1))).toEqual([
    "app-explorar-foz.png", "app-ligate.png", "treino-lisboa-03.png",
    "app-ecra-1.jpg", "app-ecra-2.png", "app-ecra-3.png",
  ]);
});
