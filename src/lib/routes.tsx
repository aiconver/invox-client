// src/lib/routes.ts

import type { AppRoutes } from "@/types/routes";
import { Bot, FileText } from "lucide-react";

export const APP_ROUTES: AppRoutes = {
	"invox": {
		label: "navigation.invox",
		to: "/qa/",
		icon: Bot,
		pathPattern: "^/qa/?$",
	},
	"departments": {
		label: "navigation.invox",
		to: "/qa/departments",
		icon: FileText,
		pathPattern: "^/qa/departments/?$",
	},
	"formsByDepartment": {
		label: "navigation.invox",
		to: "/qa/forms/:department",
		icon: FileText,
		pathPattern: "^/qa/forms/[^/]+/?$",
	},
	"form": {
		label: "navigation.invox",
		to: "/qa/forms/fill/:formId",
		icon: FileText,
		pathPattern: "^/qa/forms/fill/[^/]+/?$",
	},
	"hybridform": {
		label: "navigation.invox",
		to: "/qa/forms/hybrid/fill/:formId",
		icon: FileText,
		pathPattern: "^/qa/forms/hybrid/fill/[^/]+/?$",
	},
	"formView": {
		label: "navigation.invox",
		to: "/qa/forms/view/:formId",
		icon: FileText,
		pathPattern: "^/qa/forms/view/[^/]+/?$",
	},
} as const;
