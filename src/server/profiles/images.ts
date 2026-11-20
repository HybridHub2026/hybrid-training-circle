import { adminOrigin, adminSession } from "../forms/admin";
import type { FormsEnvironment } from "../forms/service";
import { ensureProfileSchema } from "./service";

const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
export async function handleProfileImages(request: Request, env: FormsEnvironment) {
  if (!env.FORMS_DB) return json({ error: "unavailable" }, 503);
  const db = env.FORMS_DB;
  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id") ?? "";
      if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: "not_found" }, 404);
      const preview = url.searchParams.get("preview") === "1";
      if (
        preview &&
        (request.headers.get("sec-fetch-site") === "cross-site" ||
          !(await adminSession(request, env)))
      )
        return json({ error: "unauthorized" }, 401);
      await ensureProfileSchema(db);
      const row = await db
        .prepare(
          preview
            ? "SELECT content_type,bytes FROM member_profile_images WHERE id=?"
            : "SELECT content_type,bytes FROM member_profile_images WHERE id=? AND EXISTS(SELECT 1 FROM member_profiles WHERE archived_at IS NULL AND json_extract(published_payload,'$.imageId')=?)",
        )
        .bind(...(preview ? [id] : [id, id]))
        .first<{ content_type: string; bytes: ArrayBuffer | Uint8Array }>();
      return row
        ? new Response(
            new Uint8Array(row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes)),
            { headers: { ...headers, "Content-Type": row.content_type } },
          )
        : json({ error: "not_found" }, 404);
    }
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    if (!adminOrigin(request)) return json({ error: "forbidden" }, 403);
    if (!(await adminSession(request, env))) return json({ error: "unauthorized" }, 401);
    await ensureProfileSchema(db);
    const contentType = request.headers.get("content-type") ?? "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType))
      return json({ error: "invalid_image", message: "Usa uma imagem JPG, PNG ou WebP." }, 415);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "invalid_image" }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 800000) {
        await reader.cancel();
        return json(
          {
            error: "too_large",
            message: "A imagem é demasiado grande. Escolhe uma fotografia mais pequena.",
          },
          413,
        );
      }
      chunks.push(next.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const signature =
      contentType === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : contentType === "image/png"
          ? [137, 80, 78, 71, 13, 10, 26, 10].every((n, index) => bytes[index] === n)
          : new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
            new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    if (!signature) return json({ error: "invalid_image" }, 400);
    // Only unreferenced temporary uploads expire; saved drafts and published photos are retained.
    await db
      .prepare(
        "DELETE FROM member_profile_images WHERE created_at<? AND NOT EXISTS(SELECT 1 FROM member_profiles WHERE json_extract(payload,'$.imageId')=member_profile_images.id OR json_extract(published_payload,'$.imageId')=member_profile_images.id)",
      )
      .bind(Date.now() - 86400000)
      .run();
    const id = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO member_profile_images(id,content_type,bytes,created_at) VALUES(?,?,?,?)",
      )
      .bind(id, contentType, bytes.buffer, Date.now())
      .run();
    return json({ id }, 201);
  } catch {
    return json(
      { error: "unavailable", message: "Não foi possível guardar a imagem. Tenta novamente." },
      503,
    );
  }
}
