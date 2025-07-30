
import { addUser } from "@/services/userService";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { UserForm } from "@/components/invox/UserForm";

export default function NewUserPage() {
  return (
    <main className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label="Back to Users" to="/users" />
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold text-center mb-6">Add New User</h2>
        <UserForm onSubmit={addUser} />
      </div>
    </main>
  );
}
