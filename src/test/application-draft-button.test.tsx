import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { ApplicationDraftButton } from "@/components/site/ApplicationDraftButton";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("creates only a draft, opens it for review and prevents a second in-flight click", async () => {
  let finish!: (value: Response) => void;
  const fetcher = vi.fn(
    (_url: string, _init: RequestInit) =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  const created = vi.fn();
  render(<ApplicationDraftButton id="submission" onCreated={created} onUnauthorized={vi.fn()} />);
  const button = screen.getByRole("button", { name: "Criar perfil em rascunho" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(button).toBeDisabled();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(JSON.parse(String(fetcher.mock.calls[0]![1].body))).toEqual({
    action: "profile-from-application",
    submissionId: "submission",
  });
  finish(Response.json({ profileId: "draft", message: "Nada foi publicado." }));
  await waitFor(() => expect(created).toHaveBeenCalledWith("draft", "Nada foi publicado."));
});
it("opens an already imported profile without overwriting or sending another request", () => {
  const fetcher = vi.fn(),
    created = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(
    <ApplicationDraftButton
      id="submission"
      profileId="existing"
      onCreated={created}
      onUnauthorized={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Abrir perfil existente" }));
  expect(fetcher).not.toHaveBeenCalled();
  expect(created.mock.calls[0]![0]).toBe("existing");
});
