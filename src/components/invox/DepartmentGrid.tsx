// components/invox/DepartmentGrid.tsx
import { DepartmentCard } from "./DepartmentCard";

interface Department {
  name: string;
  formCount: number;
}

interface DepartmentGridProps {
  departments: Department[];
  onViewForms: (department: string) => void;
}

export function DepartmentGrid({ departments, onViewForms }: DepartmentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {departments.map((dept) => (
        <DepartmentCard
          key={dept.name}
          name={dept.name}
          formCount={dept.formCount}
          onClick={() => onViewForms(dept.name)}
        />
      ))}
    </div>
  );
}
