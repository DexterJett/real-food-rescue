import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveListingImage(
  file: File | null,
  previousPath?: string | null,
) {
  if (!file || file.size === 0) return previousPath ?? null;
  if (file.size > MAX_BYTES) {
    throw new Error("Das Bild darf höchstens 4 MB haben.");
  }
  const ext = TYPES[file.type];
  if (!ext) {
    throw new Error("Bitte ein JPG-, PNG- oder WebP-Bild wählen.");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}
