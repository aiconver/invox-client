// src/lib/routes.ts

import type { AppRoutes } from "@/types/routes";
import { Bot, FileText } from "lucide-react";

export const APP_ROUTES: AppRoutes = {
	"invox": {
		label: "navigation.invox",
		to: "/",
		icon: Bot,
		pathPattern: "^/?$",
	},
	"departments": {
		label: "navigation.invox",
		to: "/departments",
		icon: FileText,
		pathPattern: "^/departments/?$",
	},
	"formsByDepartment": {
		label: "navigation.invox",
		to: "/forms/:department",
		icon: FileText,
		pathPattern: "^/forms/[^/]+/?$",
	},
	"form": {
		label: "navigation.invox",
		to: "/forms/fill/:formId",
		icon: FileText,
		pathPattern: "^/forms/fill/[^/]+/?$",
	},
	"hybridform": {
		label: "navigation.invox",
		to: "/forms/hybrid/fill/:formId",
		icon: FileText,
		pathPattern: "^/forms/hybrid/fill/[^/]+/?$",
	},
	"formView": {
		label: "navigation.invox",
		to: "/forms/view/:formId",
		icon: FileText,
		pathPattern: "^/forms/view/[^/]+/?$",
	},
	"formTemplateCreator": {
		label: "navigation.invox",
		to: "/form-template-creator",
		icon: FileText,
		pathPattern: "^/form-template-creator/?$",
	},
} as const;
