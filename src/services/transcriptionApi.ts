"use client";

import { mimeToExt } from "@/utils/mime";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export async function uploadAndTranscribe(
  audioBlob: Blob,
  opts?: { filename?: string; baseUrl?: string }
): Promise<{ transcript: string; raw: any }> {
  const ext = mimeToExt(audioBlob.type);
  const filename = opts?.filename ?? `recording.${ext}`;

  const form = new FormData();
  form.append("audio", audioBlob, filename);

  // If you have a different base URL (e.g., behind proxy), set NEXT_PUBLIC_API_BASE
  const base = opts?.baseUrl ?? (process.env.NEXT_PUBLIC_API_BASE || "");
  const url = `${base}/api/v1/form/transcribe`.replace(/([^:]\/)\/+/g, "$1");

  const res = await fetch(url, { method: "POST", body: form });
  let body: ApiResponse<{ transcript: string }> | any = null;
  try {
    body = await res.json();
  } catch {
    // ignore parse error; we'll throw a generic error below
  }

  if (!res.ok) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }

  const transcript = body?.data?.transcript ?? body?.transcript ?? "";
  return { transcript, raw: body };
}
