import { useEffect, useState } from "react";
import { getSubmittedForms, updateFormStatus } from "@/services";
import { Button } from "@/components/ui/button";

const FormStatusEnums = {
  Submitted: "submitted",
  Approved: "approved",
  Rejected: "rejected",
} as const;

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Template = {
  id: string;
  name: string;
  department: string;
};

type Form = {
  id: string;
  templateId: string;
  answers: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: keyof typeof FormStatusEnums;
  creator: User;
  template: Template;
};

export function SubmittedForms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await getSubmittedForms();
        setForms(data);
      } catch (error) {
        console.error("Failed to load submitted forms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const handleStatusChange = (formId: string, status: "approved" | "rejected") => async () => {
    try {
      const result = await updateFormStatus({ formId, status });
      console.log("✅", result.message);
      // Refresh list
      setForms((prev) =>
        prev.map((f) => (f.id === formId ? { ...f, status } : f))
      );
    } catch (error) {
      console.error("❌ Failed to update status", error);
    }
  };

  if (loading) return <p>Loading submitted forms...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Submitted Forms</h2>
      <div className="overflow-x-auto rounded-md shadow border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 font-medium">Template</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Submitted By</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{form.template?.name}</td>
                <td className="px-4 py-3">{form.template?.department}</td>
                <td className="px-4 py-3">
                  {form.creator?.firstName} {form.creator?.lastName} <br />
                  <span className="text-xs text-gray-500">{form.creator?.email}</span>
                </td>
                <td className="px-4 py-3 capitalize">{form.status}</td>
                <td className="px-4 py-3 text-center">
                  {form.status === FormStatusEnums.Submitted ? (
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleStatusChange(form.id, FormStatusEnums.Approved)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleStatusChange(form.id, FormStatusEnums.Rejected)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}
            {forms.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No submitted forms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
