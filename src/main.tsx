import "@/styles/global.css";
import "./i18n.ts";

import { AuthProvider } from "@/components/auth/auth-provider.tsx";
import { MainLayout } from "@/components/layout/main-layout.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "@/lib/routes.tsx";
import { ProtectedRoute } from "./components/auth/protected-route.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Invox } from "./pages/invox.tsx";
import { DepartmentsPage } from "./pages/invox/departments.tsx"; // ✅ New Page
import { FormsByDepartmentPage } from "./pages/invox/forms-by-department.tsx";
import { FormPage } from "./pages/invox/form.tsx";
import { NotFound } from "./pages/not-found.tsx";
import { FormViewPage } from "./pages/invox/form-view.tsx";
import { HybridFormPage } from "./pages/invox/hybrid-form.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}

const queryClient = new QueryClient();

const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<BrowserRouter>
					{/* <AuthProvider> */}
						<Toaster />
						<Routes>
							<Route element={<ProtectedRoute />}>
								<Route element={<MainLayout />}>
									<Route path={APP_ROUTES["invox"].to} element={<Invox />} />
									<Route path={APP_ROUTES["departments"].to} element={<DepartmentsPage />} /> {/* ✅ Added */}
									<Route path={APP_ROUTES["formsByDepartment"].to} element={<FormsByDepartmentPage />} />
									<Route path={APP_ROUTES["form"].to} element={<FormPage />} />
									<Route path={APP_ROUTES["hybridform"].to} element={<HybridFormPage />} />
									<Route path={APP_ROUTES["formView"].to} element={<FormViewPage />} />
								</Route>
							</Route>

							<Route path="*" element={<NotFound />} />
						</Routes>
					{/* </AuthProvider> */}
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</StrictMode>
);
