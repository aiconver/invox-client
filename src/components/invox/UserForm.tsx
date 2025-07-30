import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { UserFormInput } from "@/types/user";

type UserFormProps = {
  initialData?: UserFormInput;
  onSubmit: (data: UserFormInput) => Promise<void>;
  isEdit?: boolean;
};

export function UserForm({ initialData, onSubmit, isEdit }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormInput>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "operator",
    ...(initialData ?? {}),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange =
    (field: keyof UserFormInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      navigate("/users");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label>Username</Label>
        <Input
          value={formData.username}
          onChange={handleChange("username")}
          required
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          required
        />
      </div>
      <div>
        <Label>First Name</Label>
        <Input
          value={formData.firstName}
          onChange={handleChange("firstName")}
          required
        />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input
          value={formData.lastName}
          onChange={handleChange("lastName")}
          required
        />
      </div>
      <div>
        <Label>Role</Label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.role}
          onChange={handleChange("role")}
        >
          <option value="operator">Operator</option>
          <option value="merchandiser">Merchandiser</option>
        </select>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isEdit ? "Update User" : "Add User"}
      </Button>
    </form>
  );
}
