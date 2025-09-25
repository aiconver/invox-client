import { client } from "@/lib/trpc";

export const transcribeAudio = async () => {
  try {
    const id = 2;
    const result = await client.main.api.v1.form.transcribe.query({id});
    return result;
  } catch (err) {
      console.error("Failed to Transcribe audio :", err);
    throw err;
  }
};