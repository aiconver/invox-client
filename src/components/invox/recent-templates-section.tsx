// components/invox/RecentTemplatesSection.tsx

import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentTemplate {
	id: string;
	name: string;
}

interface Props {
	templates: RecentTemplate[];
}

export function RecentTemplatesSection({ templates }: Props) {
	const navigate = useNavigate();

	const handleStartWithTemplate = (templateId: string) => {
		navigate(`/qa/forms/fill/${templateId}`);
	};

	return (
		<section className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Recently Used Templates</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{templates.map((tpl) => (
					<div
						key={tpl.id}
						className="bg-white rounded-lg border shadow-sm p-4 flex justify-between items-center"
					>
						<div>
							<p className="font-medium">{tpl.name}</p>
							<p className="text-sm text-muted-foreground">
								ID: {tpl.id.slice(0, 8)}...
							</p>
						</div>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => handleStartWithTemplate(tpl.id)}
						>
							<Rocket className="w-4 h-4 mr-1" />
							Start Again
						</Button>
					</div>
				))}
			</div>
		</section>
	);
}
