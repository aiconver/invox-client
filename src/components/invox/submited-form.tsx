import { useEffect, useState } from "react";
import { getSubmittedForms, updateFormStatus } from "@/services";
import DataTable from "@/components/ui/data-table"; // adjust import path

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

  const handleStatusChange = async (formId: string, status: "approved" | "rejected") => {
    try {
      const result = await updateFormStatus({ formId, status });
      console.log("✅", result.message);
      setForms((prev) =>
        prev.map((form) => (form.id === formId ? { ...form, status } : form))
      );
    } catch (error) {
      console.error("❌ Failed to update status", error);
    }
  };

  const columns = [
    {
      header: "Template",
      accessor: (form: Form) => form.template?.name,
      sortable: true,
    },
    {
      header: "Department",
      accessor: (form: Form) => form.template?.department,
      sortable: true,
    },
    {
      header: "Submitted By",
      accessor: (form: Form) =>
        `${form.creator?.firstName} ${form.creator?.lastName} (${form.creator?.email})`,
      sortable: true,
      searchAccessor: (form: Form) =>
        `${form.creator?.firstName} ${form.creator?.lastName} ${form.creator?.email}`,
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: (form: Form) => <span className="capitalize">{form.status}</span>,
    },
    {
      header: "Actions",
      accessor: () => "",
      cell: (form: Form) =>
        form.status === FormStatusEnums.Submitted ? (
          <div className="flex gap-2">
            <button
              className="text-green-600 hover:underline"
              onClick={() => handleStatusChange(form.id, "approved")}
            >
              Approve
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleStatusChange(form.id, "rejected")}
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-gray-400 italic">No actions</span>
        ),
    },
  ];

  if (loading) return <p>Loading submitted forms...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Submitted Forms</h2>
      <DataTable
        data={forms}
        columns={columns}
        searchKeys={["status"]} // optional, adjust as needed
        itemsPerPage={10}
        emptyMessage="No submitted forms found"
      />
    </div>
  );
}
