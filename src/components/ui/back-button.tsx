import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ label = "Back" }: { label?: string }) {
	const navigate = useNavigate();

	return (
		<div className="w-fit">
			<Button
				variant="outline"
				onClick={() => navigate(-1)}
				className="mx-2 my-2 px-4 py-2 text-sm gap-2"
			>
				<ArrowLeft className="w-4 h-4" />
				{label}
			</Button>
		</div>
	);
}
