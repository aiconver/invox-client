import { FileText, Building2 } from "lucide-react";
import { DepartmentSummary } from "@/pages/invox";

interface Props {
	departments: DepartmentSummary[];
	onViewForms: (department: string) => void;
}

export function DepartmentGrid({ departments, onViewForms }: Props) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{departments.map((dept) => (
				<div
					key={dept.name}
					className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center"
				>
					<div className="bg-muted p-3 rounded-md mb-4">
						<Building2 className="w-6 h-6 text-primary" />
					</div>
					<h3 className="text-lg font-semibold">{dept.name}</h3>
					<div className="flex items-center text-sm text-muted-foreground mb-2">
						<FileText className="w-4 h-4 mr-1" />
						<span>{dept.formCount} forms</span>
					</div>
					<button
						className="border px-4 py-1.5 rounded text-sm hover:bg-muted transition"
						onClick={() => onViewForms(dept.name)}
					>
						View Forms
					</button>
				</div>
			))}
		</div>
	);
}
