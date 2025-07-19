import type { AppRoutes } from "@/types/routes";
import { Bot, FileText } from "lucide-react";

export const APP_ROUTES: AppRoutes = {
	"invox": {
		label: "navigation.invox",
		to: "/qa/",
		icon: Bot,
		pathPattern: "^/qa/$",
	},
	"formsByDepartment": {
		label: "navigation.invox",
		to: "/qa/forms/:department",
		icon: FileText,
		pathPattern: "^/qa/forms/[^/]+$",
	},
	"form": {
		label: "navigation.invox",
		to: "/qa/forms/:formId",
		icon: FileText,
		pathPattern: "^/qa/forms/[^/]+/[^/]+$",
	},
} as const;
