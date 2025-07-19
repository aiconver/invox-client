import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFormsByDepartment } from "@/services/invox";

export function FormsByDepartmentPage() {
	const { department } = useParams();
	const decodedDepartment = decodeURIComponent(department ?? "");

	const { data: forms, isLoading, error } = useQuery({
		queryKey: ["forms", decodedDepartment],
		queryFn: () => getFormsByDepartment(decodedDepartment),
		enabled: !!decodedDepartment,
	});

	console.log("Forms for department:", decodedDepartment, forms);

	if (isLoading) return <p className="p-4">Loading forms...</p>;
	if (error) return <p className="p-4 text-red-500">Error loading forms.</p>;

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold mb-4">
				Forms for Department: {decodedDepartment}
			</h1>
			<ul className="space-y-2">
				{forms?.map((form) => (
					<li
						key={form.id}
						className="border p-4 rounded shadow hover:bg-gray-50 transition"
					>
						<p className="font-semibold">{form.name}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
