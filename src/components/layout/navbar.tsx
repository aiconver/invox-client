import { Separator } from "@/components/ui/separator";
import { AppTopbar } from "./app-sidebar";

export function Navbar() {
	return (
		<div className="sticky top-0 z-40 w-full bg-background">
			<AppTopbar />
			<Separator />
		</div>
	);
}