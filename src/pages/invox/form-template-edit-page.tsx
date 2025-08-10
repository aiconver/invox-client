import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { FormTemplateEditor } from "@/components/invox/form-template-editor";

export function FormTemplateEditPage() {
  const { formTemplateId } = useParams<{ formTemplateId: string }>();

  return (
    <main className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label="Back to Templates" />
      <FormTemplateEditor formTemplateId={formTemplateId} />
    </main>
  );
}
