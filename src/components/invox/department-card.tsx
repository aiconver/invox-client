// components/invox/DepartmentCard.tsx
import { Building2, FileText } from "lucide-react";

interface DepartmentCardProps {
  name: string;
  description?: string;
  formCount: number;
  onClick: () => void;
}

export function DepartmentCard({ name, description, formCount, onClick }: DepartmentCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center">
      <div className="bg-muted p-3 rounded-md mb-4">
        <Building2 className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{name}</h3>
      {description && <p className="text-muted-foreground text-sm mb-4">{description}</p>}
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <FileText className="w-4 h-4 mr-1" />
        <span>{formCount} forms</span>
      </div>
      <button onClick={onClick} className="border px-4 py-1.5 rounded text-sm hover:bg-muted transition">
        View Forms
      </button>
    </div>
  );
}
