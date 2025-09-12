import { useTranslation } from "react-i18next";

export function Invox() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen w-full flex flex-col bg-muted/50">
			<main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 w-full space-y-10">
				<div className="max-w-7xl mx-auto">
					form
				</div>
			</main>
		</div>
	);
}
