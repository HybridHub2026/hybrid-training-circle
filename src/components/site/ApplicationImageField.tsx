import { useRef, useState } from "react";
import type { partnerCopy } from "@/i18n/partners";

export type ApplicationImage = { contentType: "image/webp"; data: string };
type Props = {
  copy: ReturnType<typeof partnerCopy>;
  type: "coach" | "community";
  onChange: (image: ApplicationImage | null) => void;
  onBusy: (busy: boolean) => void;
};
export function ApplicationImageField({ copy: c, type, onChange, onBusy }: Props) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const sequence = useRef(0);
  async function select(file?: File) {
    const selected = ++sequence.current;
    setError("");
    setPreview("");
    onChange(null);
    setProcessing(false);
    onBusy(false);
    if (!file) {
      setProcessing(false);
      onBusy(false);
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0
    ) {
      setError(c.imageError);
      if (input.current) input.current.value = "";
      return;
    }
    setProcessing(true);
    onBusy(true);
    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file);
      if (bitmap.width < 1 || bitmap.height < 1 || bitmap.width * bitmap.height > 40000000)
        throw new Error("image_dimensions");
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas_unavailable");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob: Blob | null = null;
      for (const quality of [0.85, 0.7, 0.5]) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (blob?.type === "image/webp" && blob.size <= 500000) break;
      }
      if (!blob || blob.type !== "image/webp" || blob.size > 500000)
        throw new Error("image_too_large");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("image_read"));
        reader.readAsDataURL(blob);
      });
      if (selected !== sequence.current) return;
      setPreview(dataUrl);
      onChange({ contentType: "image/webp", data: dataUrl.split(",")[1]! });
    } catch {
      if (selected === sequence.current) {
        setError(c.imageError);
        if (input.current) input.current.value = "";
      }
    } finally {
      bitmap?.close();
      if (selected === sequence.current) {
        setProcessing(false);
        onBusy(false);
      }
    }
  }
  return (
    <div className="rounded-sm border border-border p-4">
      <label htmlFor="partner-image" className="block text-sm font-semibold">
        {type === "coach" ? c.imageCoach : c.imageCommunity}
      </label>
      <p id="partner-image-hint" className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {c.imageHint}
      </p>
      <input
        ref={input}
        id="partner-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-describedby="partner-image-hint partner-image-feedback"
        className="mt-3 block w-full min-w-0 text-sm file:mr-3 file:rounded-sm file:border file:border-primary/50 file:bg-background file:px-3 file:py-3 file:text-foreground"
        onChange={(event) => void select(event.target.files?.[0])}
      />
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt={c.imagePreview}
            className="max-h-56 max-w-full rounded-sm object-contain"
          />
          <button
            type="button"
            className="mt-3 min-h-11 text-sm text-primary underline"
            onClick={() => {
              if (input.current) input.current.value = "";
              void select();
            }}
          >
            {c.imageRemove}
          </button>
        </div>
      )}
      <p
        id="partner-image-feedback"
        role={error ? "alert" : "status"}
        className="mt-2 text-sm text-muted-foreground"
      >
        {error || (processing ? c.imageProcessing : "")}
      </p>
    </div>
  );
}
