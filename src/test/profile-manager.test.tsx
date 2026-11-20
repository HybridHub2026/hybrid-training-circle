import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileManager } from "@/components/site/ProfileManager";
import { emptyProfile, translationSnapshot, type ManagedProfile } from "@/lib/profile-data";

function reviewed(profile: ManagedProfile): ManagedProfile {
  return {
    ...profile,
    translationReviews: {
      es: {
        source: translationSnapshot(profile.data, "pt"),
        target: translationSnapshot(profile.data, "es"),
        reviewedAt: Date.now(),
      },
      en: {
        source: translationSnapshot(profile.data, "pt"),
        target: translationSnapshot(profile.data, "en"),
        reviewedAt: Date.now(),
      },
    },
  };
}

vi.mock("@/i18n", () => ({ useLanguage: () => "pt", translateText: (value: string) => value }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("saves edits as drafts and enables publication only after saving and confirming permission", async () => {
  let profile: ManagedProfile = {
    id: crypto.randomUUID(),
    data: {
      ...emptyProfile(),
      name: "Coach confirmado",
      city: "Maia",
      country: { pt: "Portugal", es: "Portugal", en: "Portugal" },
      description: { pt: "Descrição", es: "Descripción", en: "Description" },
      sports: { pt: ["Corrida"], es: ["Running"], en: ["Running"] },
    },
    publishedData: null,
    revision: 1,
    updatedAt: Date.now(),
    publishedAt: null,
    archivedAt: null,
  };
  const calls: Array<{ action: string; data?: ManagedProfile["data"] }> = [];
  profile = reviewed(profile);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) return Response.json({ profiles: [profile] });
      const body = JSON.parse(String(init.body));
      calls.push(body);
      if (body.action === "profile-save")
        profile = { ...profile, data: body.data, revision: profile.revision + 1 };
      else if (body.action === "profile-publish")
        profile = {
          ...profile,
          publishedData: profile.data,
          revision: profile.revision + 1,
          publishedAt: Date.now(),
        };
      return Response.json({ profile });
    }),
  );
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  fireEvent.click(await screen.findByRole("button", { name: "Editar / publicar" }));
  const publish = screen.getByRole("button", { name: "Publicar no site" });
  expect(publish).toBeDisabled();
  const permission = screen.getByRole("checkbox", { name: /Confirmo que o participante/ });
  fireEvent.click(permission);
  expect(publish).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Nome", { exact: true }), {
    target: { value: "Nome revisto" },
  });
  expect(permission).not.toBeChecked();
  expect(publish).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Guardar rascunho" }));
  await screen.findByText(/Rascunho guardado/);
  expect(calls.map((call) => call.action)).toEqual(["profile-save"]);
  expect(calls[0]?.data?.name).toBe("Nome revisto");
  expect(publish).toBeDisabled();
  fireEvent.click(permission);
  expect(publish).toBeEnabled();
  fireEvent.click(publish);
  await waitFor(() =>
    expect(calls.map((call) => call.action)).toEqual(["profile-save", "profile-publish"]),
  );
  await screen.findByText(/Perfil publicado nos três idiomas/);
});
it("does not allow an expired session to read managed profiles", async () => {
  const expired = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: "unauthorized" }, { status: 401 })),
  );
  render(<ProfileManager onUnauthorized={expired} onLogout={vi.fn(async () => {})} />);
  await waitFor(() => expect(expired).toHaveBeenCalledOnce());
  expect(await screen.findByRole("alert")).toHaveTextContent("A sessão terminou");
});

it("marks Portuguese edits immediately, keeps the warning after saving and requires review of each language", async () => {
  const draft = portugueseDraft();
  draft.data.country.en = "Portugal";
  draft.data.description.en = "Running sessions.";
  draft.data.sports.en = ["Running"];
  let profile = reviewed(draft);
  const actions: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) return Response.json({ profiles: [profile] });
      const body = JSON.parse(String(init.body));
      actions.push(body.action);
      if (body.action === "profile-save")
        profile = { ...profile, data: body.data, revision: profile.revision + 1 };
      if (body.action === "profile-review") {
        const language = body.language as "es" | "en";
        profile = {
          ...profile,
          revision: profile.revision + 1,
          translationReviews: {
            ...profile.translationReviews!,
            [language]: {
              source: translationSnapshot(profile.data, "pt"),
              target: translationSnapshot(profile.data, language),
              reviewedAt: Date.now(),
            },
          },
        };
      }
      return Response.json({ profile });
    }),
  );
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  fireEvent.click(await screen.findByRole("button", { name: "Editar / publicar" }));
  expect(screen.getByText("Traduções revistas e atualizadas.")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Apresentação — Português"), {
    target: { value: "Novo texto português." },
  });
  expect(
    screen.getByText("Alteraste o português. As traduções precisam de revisão."),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Publicar no site" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Guardar rascunho" }));
  await screen.findByText(/Rascunho guardado/);
  expect(
    screen.getByText("Alteraste o português. As traduções precisam de revisão."),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Espanhol" }));
  fireEvent.click(screen.getByRole("button", { name: "Marcar espanhol como revisto" }));
  await screen.findByText("Tradução de espanhol marcada como revista.");
  expect(screen.getByRole("button", { name: "Publicar no site" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Inglês" }));
  fireEvent.click(screen.getByRole("button", { name: "Marcar inglês como revisto" }));
  await screen.findByText("Tradução de inglês marcada como revista.");
  expect(screen.getByText("Traduções revistas e atualizadas.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /Confirmo que o participante/ }));
  expect(screen.getByRole("button", { name: "Publicar no site" })).toBeEnabled();
  expect(actions).toEqual(["profile-save", "profile-review", "profile-review"]);
});

function portugueseDraft(): ManagedProfile {
  return {
    id: crypto.randomUUID(),
    data: {
      ...emptyProfile(),
      name: "Coach",
      city: "Maia",
      country: { pt: "Portugal", es: "Portugal revisto", en: "" },
      description: { pt: "Treinos de corrida.", es: "Texto espanhol revisto.", en: "" },
      sports: { pt: ["Corrida"], es: ["Atletismo revisto"], en: [] },
    },
    publishedData: null,
    revision: 1,
    updatedAt: Date.now(),
    publishedAt: null,
    archivedAt: null,
  };
}
it("automatically fills only empty translations on save and leaves them for review without publishing", async () => {
  let profile = portugueseDraft();
  const requests: Array<{ action: string; fields: { es: unknown } }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) return Response.json({ profiles: [profile] });
      const body = JSON.parse(String(init.body));
      requests.push(body);
      if (body.action === "profile-translate")
        return Response.json({
          translations: {
            es: {},
            en: { country: "Portugal", description: "Running sessions.", sports: ["Running"] },
          },
        });
      profile = { ...profile, data: body.data, revision: 2 };
      return Response.json({ profile });
    }),
  );
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  fireEvent.click(await screen.findByRole("button", { name: "Editar / publicar" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar rascunho" }));
  await screen.findByText(/Rascunho guardado com traduções automáticas/);
  expect(requests.map((request) => request.action)).toEqual(["profile-translate", "profile-save"]);
  expect(requests[0]?.fields.es).toEqual({
    country: false,
    description: false,
    sports: false,
    imageAlt: false,
  });
  expect(profile.data.description).toEqual({
    pt: "Treinos de corrida.",
    es: "Texto espanhol revisto.",
    en: "Running sessions.",
  });
  expect(screen.getByRole("button", { name: "Publicar no site" })).toBeDisabled();
});
it("requires explicit confirmation to replace reviewed translations and does not save or publish them automatically", async () => {
  const profile = portugueseDraft();
  const actions: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) return Response.json({ profiles: [profile] });
      actions.push(JSON.parse(String(init.body)).action);
      return Response.json({
        translations: {
          es: { description: "Nueva traducción." },
          en: { description: "New translation." },
        },
      });
    }),
  );
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  fireEvent.click(await screen.findByRole("button", { name: "Editar / publicar" }));
  fireEvent.click(screen.getByRole("button", { name: "Traduzir PT → ES e EN" }));
  expect(actions).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(actions).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Traduzir PT → ES e EN" }));
  fireEvent.click(screen.getByRole("button", { name: "Substituir traduções" }));
  await screen.findByText(/Traduções geradas/);
  expect(actions).toEqual(["profile-translate"]);
  expect(screen.getByLabelText("Apresentação — Espanhol")).toHaveValue("Nueva traducción.");
  expect(screen.getByRole("button", { name: "Publicar no site" })).toBeDisabled();
});
it("still saves the original draft if the translation service is unavailable", async () => {
  let profile = portugueseDraft();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) return Response.json({ profiles: [profile] });
      const body = JSON.parse(String(init.body));
      if (body.action === "profile-translate")
        return Response.json({ message: "Serviço indisponível." }, { status: 503 });
      profile = { ...profile, data: body.data, revision: 2 };
      return Response.json({ profile });
    }),
  );
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  fireEvent.click(await screen.findByRole("button", { name: "Editar / publicar" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar rascunho" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("O rascunho foi guardado");
  expect(profile.data.description.en).toBe("");
  expect(profile.data.description.pt).toBe("Treinos de corrida.");
});
