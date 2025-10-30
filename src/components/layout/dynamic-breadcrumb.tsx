import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { APP_ROUTES } from "@/lib/routes";
import { useLocation } from "react-router-dom";

export function DynamicBreadcrumb() {
	const location = useLocation();


	const currentPathRoute = Object.values(APP_ROUTES).find((route) =>
		new RegExp(route.pathPattern).test(location.pathname)
	);

	if (!currentPathRoute) return null;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					{/* <BreadcrumbPage>{t(currentPathRoute.label)}</BreadcrumbPage> */}
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}