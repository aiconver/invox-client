import { Navbar } from "@/components/layout/navbar";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { testPing } from "@/services/invox";
import { Building2, FileText } from "lucide-react";

const departments = [
	{
		id: "customer-service",
		name: "Customer Service",
		description: "Handle customer inquiries and feedback",
		formCount: 1,
	},
	{
		id: "hr",
		name: "Human Resources",
		description: "Employee management and onboarding",
		formCount: 2,
	},
	{
		id: "it-security",
		name: "IT Security",
		description: "Information security and compliance",
		formCount: 1,
	},
	{
		id: "operations",
		name: "Operations",
		description: "Daily operations and reporting",
		formCount: 2,
	},
];

export function Invox() {
	const { t } = useTranslation();
	const [pingResult, setPingResult] = useState<"pending" | "success" | "error">("pending");

	const handlePingCheck = async () => {
		try {
			const result = await testPing();
			setPingResult(result === "pong" ? "success" : "error");
		} catch (err) {
			console.error("Ping failed:", err);
			setPingResult("error");
		}
	};

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<div className="flex-1 overflow-auto p-6">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-3xl font-bold">
						{t("pages.invox.title", "My Dashboard")}
					</h1>
					<button
						onClick={handlePingCheck}
						className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
					>
						{t("pages.invox.checkConnection", "Check Connection")}
					</button>
				</div>

				{pingResult !== "pending" && (
					<p className={`mb-6 font-medium ${pingResult === "success" ? "text-green-600" : "text-red-600"}`}>
						{pingResult === "success"
							? t("pages.invox.connectionSuccess", "✅ Backend is reachable")
							: t("pages.invox.connectionError", "❌ Failed to reach backend")}
					</p>
				)}

				<h2 className="text-xl font-semibold text-center mb-2">
					{t("pages.invox.selectDepartment", "Select Department")}
				</h2>
				<p className="text-center text-muted-foreground mb-6">
					{t("pages.invox.selectPrompt", "Choose a department to view its assigned forms")}
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{departments.map((dept) => (
						<div
							key={dept.id}
							className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center"
						>
							<div className="bg-muted p-3 rounded-md mb-4">
								<Building2 className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-lg font-semibold">{dept.name}</h3>
							<p className="text-muted-foreground text-sm mb-4">{dept.description}</p>
							<div className="flex items-center text-sm text-muted-foreground mb-2">
								<FileText className="w-4 h-4 mr-1" />
								<span>{dept.formCount} forms</span>
							</div>
							<button className="border px-4 py-1.5 rounded text-sm hover:bg-muted transition">
								{t("pages.invox.viewForms", "View Forms")}
							</button>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
