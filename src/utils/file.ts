/** Convert Blob/File → base64 string without the "data:*;base64," prefix. */
/** Convert Blob/File → base64 string without the "data:*;base64," prefix (stack-safe). */
export async function blobToBase64NoPrefix(blob: Blob): Promise<string> {
  // Node/Edge (Buffer available)
  if (typeof Buffer !== "undefined" && typeof (Buffer as any).from === "function") {
    const ab = await blob.arrayBuffer();
    return Buffer.from(ab).toString("base64");
  }

  // Browser: prefer FileReader (no giant argument lists)
  if (typeof window !== "undefined" && "FileReader" in window) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string; // "data:audio/...;base64,AAAA..."
        const comma = dataUrl.indexOf(",");
        resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
      };
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  }

  // Ultimate fallback: chunked binary string + btoa (never use .apply or spread)
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const CHUNK = 0x8000; // 32KB
  const pieces: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const end = Math.min(i + CHUNK, bytes.length);
    let s = "";
    for (let j = i; j < end; j++) s += String.fromCharCode(bytes[j]);
    pieces.push(s);
  }
  const binary = pieces.join("");
  // eslint-disable-next-line no-undef
  return typeof btoa !== "undefined"
    ? btoa(binary)
    : Buffer.from(binary, "binary").toString("base64");
}


/** Derive a filename extension from a MIME type. */
export function extFromMime(mime?: string): string {
  const map: Record<string, string> = {
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/aac": "aac",
    "audio/flac": "flac",
  };
  return (mime && map[mime]) || "wav";
}
