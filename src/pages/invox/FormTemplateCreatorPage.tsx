import { FormTemplateEditor } from "@/components/invox/FormTemplateEditor";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";

export function FormTemplateCreatorPage() {
  return (
    <main className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label="Back to Templates" />
      <FormTemplateEditor />
    </main>
  );
}
