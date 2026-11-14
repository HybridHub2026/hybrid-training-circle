import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LaunchNotice } from "@/components/site/LaunchNotice";
const locale = vi.hoisted(() => ({ pathname: "/es" }));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: locale.pathname } }),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
}));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); locale.pathname = "/es"; });

it("submits English consent and confirms success in English", async () => {
  locale.pathname = "/en";
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetch);
  render(<LaunchNotice />);
  fireEvent.change(screen.getByLabelText("Your email"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Notify me at launch" }));
  await waitFor(() => expect(screen.getByText("Your request has been received!")).toBeVisible());
  expect(fetch.mock.calls[0]?.[0]).toBe("https://formspree.io/f/mwlovnjz");
  const payload = JSON.parse(fetch.mock.calls[0]?.[1].body);
  expect(payload).toMatchObject({ email: "locale-test@example.com", idioma: "en" });
  expect(payload.consentimento).toMatch(/^I want to receive/);
});

it("submits the Spanish consent to the existing launch form and confirms success", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetch);
  render(<LaunchNotice />);
  fireEvent.change(screen.getByLabelText("Tu email"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Avísame del lanzamiento" }));
  await waitFor(() => expect(screen.getByText("¡Hemos recibido tu solicitud!")).toBeVisible());
  expect(fetch.mock.calls[0]?.[0]).toBe("https://formspree.io/f/mwlovnjz");
  const payload = JSON.parse(fetch.mock.calls[0]?.[1].body);
  expect(payload).toMatchObject({ email: "locale-test@example.com", idioma: "es" });
  expect(payload.consentimento).toMatch(/^Quiero recibir por email/);
});

it("shows Spanish failure feedback without clearing the email", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  render(<LaunchNotice />);
  fireEvent.change(screen.getByLabelText("Tu email"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Avísame del lanzamiento" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No se ha podido enviar la solicitud."));
  expect(screen.getByLabelText("Tu email")).toHaveValue("locale-test@example.com");
});
