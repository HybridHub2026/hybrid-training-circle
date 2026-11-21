import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LaunchNotice } from "@/components/site/LaunchNotice";
import { webcrypto } from "node:crypto";
const locale = vi.hoisted(() => ({ pathname: "/es" }));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => unknown }) => select({ location: { pathname: locale.pathname } }),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => <a href={to} {...props}>{children}</a>,
}));
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("turnstile", { render: vi.fn((_element, options) => { queueMicrotask(() => options.callback("test-proof")); return "test-widget"; }), remove: vi.fn() });
});
function setupFetch(ok = true) {
  const fetch = vi.fn(async (_url: string, options?: RequestInit) => options?.method === "POST" ? Response.json(ok ? { accepted: true } : { error: "unavailable" }, { status: ok ? 202 : 503 }) : Response.json({ ready: true, siteKey: "public-test-key" }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); locale.pathname = "/es"; });

it("submits English consent and confirms success in English", async () => {
  locale.pathname = "/en";
  const fetch = setupFetch();
  render(<LaunchNotice />);
  await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Your email"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "I'd like to take part" }));
  await waitFor(() => expect(screen.getByText("We've received your request!")).toBeVisible());
  const post = fetch.mock.calls.find(([, options]) => options?.method === "POST");
  expect(post?.[0]).toBe("/api/forms");
  const payload = JSON.parse(post?.[1]?.body as string);
  expect(payload).toMatchObject({ consent: true, campaign: true, token: "test-proof", kind: "launch" });
  expect(payload).toMatchObject({ email: "locale-test@example.com", idioma: "en" });
  expect(payload.consentimento).toMatch(/^I want to receive/);
});

it("submits the Spanish consent to the website form service and confirms success", async () => {
  const fetch = setupFetch();
  render(<LaunchNotice />);
  await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Tu correo electrónico"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Quiero formar parte" }));
  await waitFor(() => expect(screen.getByText("¡Hemos recibido tu solicitud!")).toBeVisible());
  const post = fetch.mock.calls.find(([, options]) => options?.method === "POST");
  expect(post?.[0]).toBe("/api/forms");
  const payload = JSON.parse(post?.[1]?.body as string);
  expect(payload).toMatchObject({ consent: true, campaign: true, token: "test-proof", kind: "launch" });
  expect(payload).toMatchObject({ email: "locale-test@example.com", idioma: "es" });
  expect(payload.consentimento).toMatch(/^Quiero recibir por correo electrónico/);
});

it("shows Spanish failure feedback without clearing the email", async () => {
  setupFetch(false);
  render(<LaunchNotice />);
  await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Tu correo electrónico"), { target: { value: "locale-test@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Quiero formar parte" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No se ha podido enviar la solicitud."));
  expect(screen.getByLabelText("Tu correo electrónico")).toHaveValue("locale-test@example.com");
});
