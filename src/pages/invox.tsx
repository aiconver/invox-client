import { Navbar } from "@/components/layout/navbar";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { testPing } from "@/services/invox";

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
		<main className="flex flex-col h-full">
			<Navbar />
			<div className="flex-1 overflow-auto p-6">
				<h1 className="text-2xl font-semibold mb-4">
					{t("pages.invox.title", "Invox Workspace")}
				</h1>
				<p className="text-muted-foreground mb-6">
					{t("pages.invox.description", "This is where you will interact with the Invox system.")}
				</p>

				<button
					onClick={handlePingCheck}
					className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
				>
					{t("pages.invox.checkConnection", "Check Connection")}
				</button>

				{pingResult !== "pending" && (
					<p className={`mt-4 font-medium ${pingResult === "success" ? "text-green-600" : "text-red-600"}`}>
						{pingResult === "success"
							? t("pages.invox.connectionSuccess", "✅ Backend is reachable")
							: t("pages.invox.connectionError", "❌ Failed to reach backend")}
					</p>
				)}
			</div>
		</main>
	);
}
