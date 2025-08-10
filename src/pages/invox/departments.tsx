import { Navbar } from "@/components/layout/navbar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getFormDepartments } from "@/services";
import { DepartmentGrid } from "@/components/invox/department-grid";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/lib/routes";
import { BackButton } from "@/components/ui/back-button";

export interface DepartmentSummary {
	name: string;
	formCount: number;
}

export function DepartmentsPage() {
	const { t } = useTranslation();
	const [departments, setDepartments] = useState<DepartmentSummary[] | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		getFormDepartments()
			.then(setDepartments)
			.catch((err) => {
				console.error("Failed to load departments:", err);
			})
			.finally(() => setLoading(false));
	}, []);

    console.log("Departments loaded:", departments);

	const handleViewForms = (department: string) => {
		const encoded = encodeURIComponent(department);
		const path = APP_ROUTES.formsByDepartment.to.replace(":department", encoded);
		navigate(path);
	};

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
            <BackButton label={`Back to Home`} />
			<div className="flex-1 overflow-auto p-6">
				<h2 className="text-xl font-semibold text-center mb-2">
					{t("pages.departments.title", "Select Department to Fill Forms")}
				</h2>
				<p className="text-center text-muted-foreground mb-6">
					{t("pages.departments.subtitle", "Choose a department to start filling forms")}
				</p>

				{loading ? (
					<p className="text-center text-muted">Loading departments...</p>
				) : (
					<DepartmentGrid
						departments={departments ?? []}
						onViewForms={handleViewForms}
					/>
				)}
			</div>
		</main>
	);
}
