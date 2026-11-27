import { z } from "zod";
import { applicationProfile, type PartnerApplication } from "../../lib/partner-application";
import { partnerSubjects } from "../forms/partners";
import { ensurePartnerImages } from "../forms/partner-images";
import type { FormsDatabase } from "../forms/service";
import { ensureProfileSchema } from "./service";

export const applicationDraftAction = z.object({
  action: z.literal("profile-from-application"),
  submissionId: z.string().uuid(),
});
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
// Called only behind the existing owner session and same-origin POST checks.
export async function draftFromApplication(db: FormsDatabase, submissionId: string) {
  await ensureProfileSchema(db);
  await ensurePartnerImages(db);
  const source = await db
    .prepare(
      "SELECT id,name,subject,message,email,language,created_at,EXISTS(SELECT 1 FROM partner_application_images WHERE submission_id=form_submissions.id) AS hasImage FROM form_submissions WHERE id=? AND kind='contact' AND subject IN (?,?)",
    )
    .bind(submissionId, ...Object.values(partnerSubjects))
    .first<PartnerApplication>();
  if (!source)
    return json({ error: "not_found", message: "Este pedido já não está disponível." }, 404);
  const existing = await db
    .prepare("SELECT profile_id FROM member_profile_applications WHERE submission_id=?")
    .bind(submissionId)
    .first<{ profile_id: string }>();
  if (existing)
    return json({
      profileId: existing.profile_id,
      created: false,
      message: "Este pedido já tem um perfil. Abri o perfil existente sem alterar os dados.",
    });
  const id = crypto.randomUUID(),
    now = Date.now();
  const { data, warnings } = applicationProfile(source, source.hasImage ? id : null);
  const duplicate = await db
    .prepare(
      "SELECT id FROM member_profiles WHERE lower(trim(json_extract(payload,'$.name')))=lower(?) AND json_extract(payload,'$.kind')=? AND lower(trim(json_extract(payload,'$.city')))=lower(?) LIMIT 1",
    )
    .bind(data.name, data.kind, data.city)
    .first();
  if (duplicate)
    return json(
      {
        error: "possible_duplicate",
        message:
          "Já existe um perfil com este nome, tipo e cidade. Revê-o em Gerir perfis públicos antes de criar outro.",
      },
      409,
    );
  // D1 batches are transactional. The mapping prevents duplicate imports/retries;
  // the copy never changes the source image or any published profile snapshot.
  await db.batch([
    db
      .prepare(
        "INSERT INTO member_profiles(id,payload,updated_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM member_profiles)<500 AND NOT EXISTS(SELECT 1 FROM member_profile_applications WHERE submission_id=?)",
      )
      .bind(id, JSON.stringify(data), now, submissionId),
    db
      .prepare(
        "INSERT INTO member_profile_images(id,content_type,bytes,created_at) SELECT ?,content_type,bytes,? FROM partner_application_images WHERE submission_id=? AND EXISTS(SELECT 1 FROM member_profiles WHERE id=?)",
      )
      .bind(id, now, submissionId, id),
    db
      .prepare(
        "INSERT INTO member_profile_applications(submission_id,profile_id,created_at) SELECT ?,id,? FROM member_profiles WHERE id=?",
      )
      .bind(submissionId, now, id),
  ]);
  const saved = await db
    .prepare("SELECT profile_id FROM member_profile_applications WHERE submission_id=?")
    .bind(submissionId)
    .first<{ profile_id: string }>();
  if (!saved)
    return json(
      {
        error: "limit",
        message: "O limite de 500 perfis foi atingido. O pedido continua guardado.",
      },
      409,
    );
  return json(
    {
      profileId: saved.profile_id,
      created: saved.profile_id === id,
      message: `Rascunho guardado. Nada foi publicado. ${warnings.join(" ")}`,
    },
    201,
  );
}
