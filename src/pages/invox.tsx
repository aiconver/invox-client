import { Navbar } from "@/components/layout/navbar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getFormDepartments, testPing } from "@/services/invox";
import { DepartmentGrid } from "@/components/invox/DepartmentGrid";

export interface DepartmentSummary {
	name: string;
	formCount: number;
}

export function Invox() {
	const { t } = useTranslation();
	const [departments, setDepartments] = useState<DepartmentSummary[] | null>(null);
	const [loadingDepartments, setLoadingDepartments] = useState(true);

	useEffect(() => {
		getFormDepartments()
			.then(setDepartments)
			.catch((err) => {
				console.error("Failed to load departments:", err);
			})
			.finally(() => setLoadingDepartments(false));
	}, []);
	console.log("Departments:", departments);

	const handleViewForms = (department: string) => {
		console.log("User selected department:", department);
		// You can navigate to /invox/forms?department=XYZ here
	};

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<div className="flex-1 overflow-auto p-6">
				<h2 className="text-xl font-semibold text-center mb-2">
					{t("pages.invox.selectDepartment", "Select Department")}
				</h2>
				<p className="text-center text-muted-foreground mb-6">
					{t("pages.invox.selectPrompt", "Choose a department to view the forms")}
				</p>

				{loadingDepartments ? (
					<p className="text-center text-muted">Loading departments...</p>
				) : (
					<DepartmentGrid departments={departments ?? []} onViewForms={handleViewForms} />
				)}
			</div>
		</main>
	);
}
