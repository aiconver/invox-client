import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UserForm } from "@/components/invox/user-form";
import { getUserById, updateUser } from "@/services/user";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { UserFormInput } from "@/types/user";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  });

  if (isLoading || !user) {
    return (
      <main className="p-6">
        <Navbar />
        <p className="text-muted text-center">Loading user...</p>
      </main>
    );
  }

  const initialData: UserFormInput = {
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  return (
    <main className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label="Back to Users" to="/users" />
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold text-center mb-6">Edit user</h2>
        <UserForm
          initialData={initialData}
          isEdit
          onSubmit={(formData) => updateUser(user.id, formData)}
        />
      </div>
    </main>
  );
}
