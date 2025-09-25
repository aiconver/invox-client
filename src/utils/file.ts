/** Convert Blob/File → base64 string without the "data:*;base64," prefix. */
export async function blobToBase64NoPrefix(blob: Blob): Promise<string> {
  const arr = await blob.arrayBuffer();
  // Node polyfill works in Next.js; fallback to btoa for browsers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (typeof Buffer !== "undefined"
    ? Buffer.from(arr).toString("base64")
    : (window as any).btoa(String.fromCharCode(...new Uint8Array(arr))));
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
