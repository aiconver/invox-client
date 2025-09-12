import type { AppRoutes } from "@/types/routes";
import { FileText } from "lucide-react";

export const APP_ROUTES: AppRoutes = {
	form: {
		label: "navigation.invox",
		to: "/",
		icon: FileText,
		pathPattern: "^/",
	},
} as const;
