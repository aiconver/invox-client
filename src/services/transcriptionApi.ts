"use client";

import { apiClient } from "@/lib/axios";
import { mimeToExt } from "@/utils/mime";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

type UploadAndTranscribeOpts = {
  /** Override filename; if omitted we’ll derive from blob mime via mimeToExt */
  filename?: string;
  /** Optional absolute base URL if you need to bypass apiClient.baseURL for this call */
  baseUrl?: string;
  /** Extra FormData fields to send alongside the audio */
  fields?: Record<
    string,
    string | number | boolean | Blob | File | Array<string | number | boolean>
  >;
  /** Upload progress hook for UI */
  onUploadProgress?: (e: ProgressEvent) => void;
  /** To allow cancelation from the caller */
  signal?: AbortSignal;
  /** Extra headers if ever needed */
  headers?: Record<string, string>;
};

function appendFields(form: FormData, fields?: UploadAndTranscribeOpts["fields"]) {
  if (!fields) return;
  Object.entries(fields).forEach(([key, value]) => {
    if (value instanceof Blob || value instanceof File) {
      form.append(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => form.append(key, String(v)));
      return;
    }
    // primitives & plain objects
    if (typeof value === "object" && value !== null) {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  });
}

export async function uploadAndTranscribe(
  audioBlob: Blob,
  opts?: UploadAndTranscribeOpts
): Promise<{ transcript: string; raw: any }> {
  // Keep filename parity with your caller if provided; else derive from mime
  const derivedExt = mimeToExt(audioBlob.type);
  const filename = opts?.filename ?? `recording.${derivedExt || "wav"}`;

  const form = new FormData();
  form.append("audio", audioBlob, filename);
  appendFields(form, opts?.fields);

  const path = "/api/v1/form/transcribe";
  const url = opts?.baseUrl
    ? `${opts.baseUrl}${path}`.replace(/([^:]\/)\/+/g, "$1")
    : path; // relative path uses apiClient.baseURL

  try {
    const res = await apiClient.post<ApiResponse<{ transcript: string }>>(url, form, {
      signal: opts?.signal,
      headers: opts?.headers, // don't set Content-Type; browser/axios will handle multipart boundary
    });

    if (!res.data || res.data.success === false) {
      throw new Error(res.data?.error || "Unknown API error");
    }

    const transcript =
      res.data.data?.transcript ?? (res.data as any)?.transcript ?? "";

    return { transcript, raw: res.data };
  } catch (err: any) {
    const message = err?.response?.data?.error || err?.message || "Request failed";
    throw new Error(message);
  }
}
