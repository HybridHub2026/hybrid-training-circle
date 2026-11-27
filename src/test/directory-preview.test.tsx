import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileManager } from "@/components/site/ProfileManager";
import { emptyProfile, type ManagedProfile } from "@/lib/profile-data";

vi.mock("@/i18n", () => ({
  useLanguage: () => "pt",
  translateText: (value: string) => value,
  T: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to, hash, ...props }: any) => (
    <a href={to + (hash ? `#${hash}` : "")} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/site/Header", () => ({ Header: () => <header>Hybrid Hub</header> }));
vi.mock("@/components/site/Footer", () => ({ Footer: () => <footer>Hybrid Hub</footer> }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("previews both saved drafts and private images without publishing or modifying profiles", async () => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
  const profiles: ManagedProfile[] = ["Tiago Passos", "RUNMISSION", "Arquivado"].map(
    (name, index) => ({
      id: `profile-${index}`,
      data: {
        ...emptyProfile(),
        name,
        kind: index === 0 ? "coach" : "community",
        city: "Porto",
        imageId: `image-${index}`,
        imageAlt: { pt: `Foto ${name}`, es: "Foto", en: "Photo" },
        description: { pt: `Descrição ${name}`, es: "Descripción", en: "Description" },
      },
      publishedData: null,
      revision: 1,
      updatedAt: 1,
      publishedAt: null,
      archivedAt: index === 2 ? 1 : null,
    }),
  );
  const fetcher = vi.fn(async () => Response.json({ profiles }));
  vi.stubGlobal("fetch", fetcher);
  render(<ProfileManager onUnauthorized={vi.fn()} onLogout={vi.fn(async () => {})} />);
  await screen.findByText("Tiago Passos");
  fireEvent.click(screen.getByRole("button", { name: "Pré-visualizar página" }));
  const preview = screen.getByRole("dialog");
  expect(within(preview).getByRole("heading", { name: "Tiago Passos" })).toBeVisible();
  expect(within(preview).getByRole("heading", { name: "RUNMISSION" })).toBeVisible();
  expect(within(preview).queryByText("Arquivado")).not.toBeInTheDocument();
  expect(within(preview).getByRole("img", { name: "Foto Tiago Passos" })).toHaveAttribute(
    "src",
    "/api/profile-images?id=image-0&preview=1",
  );
  fireEvent.click(within(preview).getByRole("button", { name: "Fechar pré-visualização" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(profiles.every((profile) => profile.publishedData === null)).toBe(true);
});
