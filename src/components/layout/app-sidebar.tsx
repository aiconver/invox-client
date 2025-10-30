import { APP_ROUTES } from "@/lib/routes";
import { useTranslation } from "react-i18next";
import { MdChevronRight, MdOutlinePerson } from "react-icons/md";
import { Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "react-oidc-context";
import { Button } from "../ui/button";

export function AppTopbar() {
	const { t } = useTranslation();
	const { user, signoutRedirect } = useAuth();

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-3">
				{/* Brand */}
				<Link to={APP_ROUTES.invox.to} className="flex items-center gap-2">
					<img src="/logo.svg" alt="logo" className="size-8" />
				</Link>

				{/* Spacer */}
				<div className="ml-auto" />

				{/* User menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="flex items-center gap-2">
							<MdOutlinePerson className="h-5 w-5" />
							<span className="max-w-[14rem] truncate">
								{user?.profile?.name || t("common.account")}
							</span>
							<MdChevronRight className="ml-1 rotate-90" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuItem onClick={() => void signoutRedirect()}>
							{t("common.signOut")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}