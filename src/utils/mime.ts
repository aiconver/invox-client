export function mimeToExt(mime?: string) {
  if (!mime) return "webm";
  const typeOnly = mime.split(";")[0]; // e.g., "audio/webm;codecs=opus" -> "audio/webm"
  return typeOnly.split("/")[1] || "webm";
}
