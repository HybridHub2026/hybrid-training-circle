import { z } from "zod";
import type { FormsDatabase } from "./service";

export const partnerImageSchema = z.object({
  contentType: z.literal("image/webp"),
  data: z
    .string()
    .min(40)
    .max(666668)
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
});
const setup = new WeakMap<FormsDatabase, Promise<unknown>>();
export async function ensurePartnerImages(db: FormsDatabase) {
  let pending = setup.get(db);
  if (!pending) {
    pending = db
      .prepare(
        "CREATE TABLE IF NOT EXISTS partner_application_images (submission_id TEXT PRIMARY KEY REFERENCES form_submissions(id) ON DELETE CASCADE,content_type TEXT NOT NULL CHECK(content_type='image/webp'),bytes BLOB NOT NULL,created_at INTEGER NOT NULL)",
      )
      .run();
    setup.set(db, pending);
  }
  try {
    await pending;
  } catch (error) {
    setup.delete(db);
    throw error;
  }
}
export function decodePartnerImage(image: z.infer<typeof partnerImageSchema>) {
  const bytes = Uint8Array.from(atob(image.data), (character) => character.charCodeAt(0));
  if (
    bytes.length < 30 ||
    bytes.length > 500000 ||
    new TextDecoder().decode(bytes.slice(0, 4)) !== "RIFF" ||
    new TextDecoder().decode(bytes.slice(8, 12)) !== "WEBP" ||
    new DataView(bytes.buffer).getUint32(4, true) + 8 !== bytes.length
  )
    throw new Error("invalid_image");
  return bytes;
}
// This is called only after the existing owner-session and cross-site checks.
export async function readPartnerImage(db: FormsDatabase, id: string, download = false) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    Vary: "Cookie",
  };
  if (!z.string().uuid().safeParse(id).success)
    return Response.json({ error: "not_found" }, { status: 404, headers });
  await ensurePartnerImages(db);
  const row = await db
    .prepare("SELECT bytes FROM partner_application_images WHERE submission_id=?")
    .bind(id)
    .first<{ bytes: ArrayBuffer | Uint8Array }>();
  if (!row) return Response.json({ error: "not_found" }, { status: 404, headers });
  return new Response(new Uint8Array(row.bytes), {
    headers: {
      ...headers,
      "Content-Type": "image/webp",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="hybrid-hub-candidatura-${id}.webp"`,
    },
  });
}
