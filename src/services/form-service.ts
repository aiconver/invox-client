"use client";

import { client } from "@/lib/trpc";
import { blobToBase64NoPrefix, extFromMime } from "@/utils/file";
import type {
  FillTemplateInput,
  FillTemplateResult,
  TranscribeResult,
} from "@/types/form";

/** Transcribe an audio Blob/File via tRPC (base64 JSON payload). */
export async function transcribeAudio(options: {
  blob: Blob | File;
  filename?: string;
  lang?: string;
}): Promise<TranscribeResult> {
  const { blob, filename } = options;
  const base64 = await blobToBase64NoPrefix(blob);
  const mimetype = blob.type || "audio/wav";
  const originalname =
    filename ?? (blob instanceof File ? blob.name : `recording.${extFromMime(mimetype)}`);

  const res = await client.main.api.v1.form.transcribe.mutate({
    file: { originalname, mimetype, base64 },
    lang: options.lang,
  });

  if (!res || (res as any).success === false) {
    throw new Error((res as any)?.error || "Transcription failed");
  }
  return res.data as TranscribeResult;
}

/** Fill a template via tRPC. */
export async function fillTemplate(input: FillTemplateInput): Promise<FillTemplateResult> {
  const res = await client.main.api.v1.form.fill.mutate(input);

  if (!res || (res as any).success === false) {
    throw new Error((res as any)?.error || "Fill template failed");
  }
  return res.data as FillTemplateResult;
}
