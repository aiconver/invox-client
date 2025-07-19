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
		label: "navigation.formsByDepartment",
		to: "/qa/forms/:department",
		icon: FileText,
		pathPattern: "^/qa/forms/[^/]+$",
	},
	"form": {
		label: "navigation.form",
		to: "/qa/forms/:formId",
		icon: FileText,
		pathPattern: "^/qa/forms/[^/]+/[^/]+$",
	},
} as const;
