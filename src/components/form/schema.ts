import { z } from "zod";

export const FormSchema = z.object({
  date: z.string().min(1, "Date of Report is required"),
  reporterName: z.string().min(1, "Name of Reporting Person is required"),
  title: z.string().min(1, "Title or Summary is required"),
  description: z.string().min(1, "Please provide a short description"),
  affectedLine: z.string().min(1, "Affected Machine or Production Line is required"),
  correctiveAction: z.string().min(1, "Please describe the corrective action plan"),
});

export type FormValues = z.infer<typeof FormSchema>;
