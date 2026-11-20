import { z } from "zod";
import {
  profileSchema,
  publicationErrors,
  type ProfileData,
  type ManagedProfile,
} from "../../lib/profile-data";
import type { FormsDatabase } from "../forms/service";
import type { MemberProfile } from "../../components/site/member-profiles";

const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
const initialized = new WeakMap<FormsDatabase, Promise<unknown>>();
export async function ensureProfileSchema(db: FormsDatabase) {
  // Fixed, additive setup for the existing D1 binding; no credentials or account changes.
  let pending = initialized.get(db);
  if (!pending) {
    pending = db.batch([
      db.prepare(
        "CREATE TABLE IF NOT EXISTS member_profiles (id TEXT PRIMARY KEY,payload TEXT NOT NULL,published_payload TEXT,revision INTEGER NOT NULL DEFAULT 1,updated_at INTEGER NOT NULL,published_at INTEGER,permission_confirmed_at INTEGER,archived_at INTEGER)",
      ),
      db.prepare(
        "CREATE TABLE IF NOT EXISTS member_profile_images (id TEXT PRIMARY KEY,content_type TEXT NOT NULL,bytes BLOB NOT NULL,created_at INTEGER NOT NULL)",
      ),
    ]);
    initialized.set(db, pending);
  }
  try {
    await pending;
  } catch (error) {
    initialized.delete(db);
    throw error;
  }
}
export const profileActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("profile-save"),
    id: z.string().uuid(),
    revision: z.number().int().min(0),
    data: profileSchema,
  }),
  z.object({
    action: z.literal("profile-publish"),
    id: z.string().uuid(),
    revision: z.number().int().min(1),
    permission: z.literal(true),
  }),
  z.object({
    action: z.enum(["profile-unpublish", "profile-archive", "profile-restore"]),
    id: z.string().uuid(),
    revision: z.number().int().min(1),
  }),
]);
type Row = {
  id: string;
  payload: string;
  published_payload: string | null;
  revision: number;
  updated_at: number;
  published_at: number | null;
  archived_at: number | null;
};
function managed(row: Row): ManagedProfile {
  return {
    id: row.id,
    data: profileSchema.parse(JSON.parse(row.payload)),
    publishedData: row.published_payload
      ? profileSchema.parse(JSON.parse(row.published_payload))
      : null,
    revision: row.revision,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    archivedAt: row.archived_at,
  };
}
export async function listManagedProfiles(db: FormsDatabase) {
  await ensureProfileSchema(db);
  const rows = await db
    .prepare(
      "SELECT id,payload,published_payload,revision,updated_at,published_at,archived_at FROM member_profiles ORDER BY updated_at DESC,id LIMIT 500",
    )
    .all<Row>();
  return rows.results.map(managed);
}
function publicProfile(id: string, data: ProfileData): MemberProfile {
  return {
    id,
    kind: data.kind,
    name: data.name,
    city: data.city,
    country: data.country,
    description: data.description,
    sports: data.sports,
    ...(data.imageId
      ? { image: { src: `/api/profile-images?id=${data.imageId}`, alt: data.imageAlt } }
      : {}),
    ...(data.website ? { website: data.website as `https://${string}` } : {}),
    ...(data.instagram ? { instagram: data.instagram as `https://${string}` } : {}),
  };
}
export async function listPublicProfiles(db: FormsDatabase): Promise<MemberProfile[]> {
  await ensureProfileSchema(db);
  const rows = await db
    .prepare(
      "SELECT id,published_payload FROM member_profiles WHERE published_payload IS NOT NULL AND archived_at IS NULL ORDER BY published_at,id LIMIT 500",
    )
    .all<{ id: string; published_payload: string }>();
  return rows.results.map((row) =>
    publicProfile(row.id, profileSchema.parse(JSON.parse(row.published_payload))),
  );
}
export async function mutateProfile(body: z.infer<typeof profileActionSchema>, db: FormsDatabase) {
  await ensureProfileSchema(db);
  const now = Date.now();
  if (body.action === "profile-save") {
    if (
      body.data.imageId &&
      !(await db
        .prepare("SELECT id FROM member_profile_images WHERE id=?")
        .bind(body.data.imageId)
        .first())
    )
      return json(
        { error: "missing_image", message: "A imagem já não está disponível. Volta a carregá-la." },
        400,
      );
    const payload = JSON.stringify(body.data);
    const changed =
      body.revision === 0
        ? await db
            .prepare(
              "INSERT INTO member_profiles(id,payload,updated_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM member_profiles)<500 ON CONFLICT DO NOTHING RETURNING id",
            )
            .bind(body.id, payload, now)
            .first()
        : await db
            .prepare(
              "UPDATE member_profiles SET payload=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=? AND archived_at IS NULL RETURNING id",
            )
            .bind(payload, now, body.id, body.revision)
            .first();
    if (!changed)
      return json(
        {
          error: "conflict",
          message:
            "O perfil foi alterado noutra janela ou o limite de 500 perfis foi atingido. Atualiza a lista antes de continuar.",
        },
        409,
      );
  } else {
    const current = await db
      .prepare(
        "SELECT id,payload,published_payload,revision,updated_at,published_at,archived_at FROM member_profiles WHERE id=?",
      )
      .bind(body.id)
      .first<Row>();
    if (!current || current.revision !== body.revision)
      return json(
        {
          error: "conflict",
          message: "O perfil foi alterado noutra janela. Atualiza a lista antes de continuar.",
        },
        409,
      );
    if (body.action === "profile-publish") {
      if (current.archived_at)
        return json({ error: "archived", message: "Recupera o perfil antes de publicar." }, 400);
      const data = profileSchema.parse(JSON.parse(current.payload));
      const errors = publicationErrors(data);
      if (errors.length) return json({ error: "incomplete", message: errors.join(" ") }, 400);
      const changed = await db
        .prepare(
          "UPDATE member_profiles SET published_payload=payload,published_at=?,permission_confirmed_at=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=? AND archived_at IS NULL RETURNING id",
        )
        .bind(now, now, now, body.id, body.revision)
        .first();
      if (!changed) return json({ error: "conflict" }, 409);
    } else {
      const query =
        body.action === "profile-restore"
          ? "UPDATE member_profiles SET archived_at=NULL,updated_at=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id"
          : body.action === "profile-archive"
            ? "UPDATE member_profiles SET archived_at=?,published_payload=NULL,published_at=NULL,updated_at=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id"
            : "UPDATE member_profiles SET published_payload=NULL,published_at=NULL,updated_at=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id";
      const values =
        body.action === "profile-archive"
          ? [now, now, body.id, body.revision]
          : [now, body.id, body.revision];
      if (
        !(await db
          .prepare(query)
          .bind(...values)
          .first())
      )
        return json({ error: "conflict" }, 409);
    }
  }
  const saved = await db
    .prepare(
      "SELECT id,payload,published_payload,revision,updated_at,published_at,archived_at FROM member_profiles WHERE id=?",
    )
    .bind(body.id)
    .first<Row>();
  return json({ profile: managed(saved!) });
}
