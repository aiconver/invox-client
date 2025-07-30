import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, deleteUserById } from "@/services";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { UserCircle, Trash2, Pencil } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export function UsersPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: users, isLoading, error } = useQuery({
		queryKey: ["users"],
		queryFn: getAllUsers,
	});

	const deleteMutation = useMutation({
		mutationFn: deleteUserById,
		onSuccess: () => queryClient.invalidateQueries(["users"]),
	});

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<BackButton label="Back to Dashboard" />

			<div className="flex-1 overflow-auto p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">Users</h2>
					<Button onClick={() => navigate("/users/new")}>Add User</Button>
				</div>

				{isLoading ? (
					<p className="text-muted text-center">Loading users...</p>
				) : error ? (
					<p className="text-red-500 text-center">Failed to load users.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{users?.map((user) => (
							<div
								key={user.id}
								className="rounded-lg border bg-white p-6 shadow-sm flex flex-col"
							>
								<div className="flex items-center justify-center mb-4">
									<UserCircle className="w-8 h-8 text-primary" />
								</div>
								<h3 className="text-md font-semibold text-center">
									{user.firstName} {user.lastName}
								</h3>
								<p className="text-sm text-center text-muted-foreground mb-2">
									{user.email}
								</p>
								<p className="text-sm text-center text-muted mb-4">{user.role}</p>
								<div className="mt-auto flex justify-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate(`/users/${user.id}`)}
									>
										<Pencil className="w-4 h-4 mr-1" />
										Edit
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => deleteMutation.mutate(user.id)}
									>
										<Trash2 className="w-4 h-4 mr-1" />
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
