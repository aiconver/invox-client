import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import IncidentForm from "@/components/form/incident-form";
import ChatPanel from "@/components/chat/chat-panel";
import { FormValues } from "@/components/form/schema";

export function Invox() {
  const [patch, setPatch] = React.useState<Partial<FormValues> | null>(null);
  const [missingFields, setMissingFields] = React.useState<(keyof FormValues)[]>([]);

  return (
    // Full-bleed area below a sticky topbar of height h-14
    <div className="fixed inset-x-0 top-14 bottom-0 bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={50} minSize={25} className="min-w-[280px]">
          <ChatPanel onExtract={(vals) => setPatch(vals)} missingFields={missingFields} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={35}>
          <IncidentForm
            patch={patch}
            onMissingFields={setMissingFields}
            onSubmit={(values) => console.log("Submit", values)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Invox;
