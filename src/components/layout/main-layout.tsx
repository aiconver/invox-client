import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";

export function MainLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}