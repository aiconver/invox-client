import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmittedForms, updateFormStatus } from "@/services";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import DataTable from "@/components/ui/data-table";
import { Check, X, Eye, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuthRoles } from "../auth/use-auth-roles";

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
  role: string;
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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuthRoles();

  useEffect(() => {
    getSubmittedForms()
      .then(setForms)
      .catch((err) => {
        console.error("Failed to load submitted forms:", err);
        setError("Failed to load submitted forms.");
      })
      .finally(() => setLoading(false));
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

  const handleDownload = (form: Form) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Form ID: ${form.id}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Submitted on: ${new Date(form.createdAt).toLocaleString()}`, 14, 30);

    const entries = Object.entries(form.answers || {});
    if (entries.length > 0) {
      autoTable(doc, {
        startY: 40,
        head: [["Question", "Answer"]],
        body: entries.map(([k, v]) => [k, String(v)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });
    } else {
      doc.text("No answers available.", 14, 40);
    }

    doc.save(`form-${form.id}.pdf`);
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
      cell: (form: Form) => (
        <div className="flex gap-2 items-center">
          {form.status === FormStatusEnums.Submitted && isAdmin && (
            <>
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => handleStatusChange(form.id, "approved")}
                title="Approve"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleStatusChange(form.id, "rejected")}
                title="Reject"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => navigate(`/forms/view/${form.id}`)}
            title="View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            className="text-muted-foreground hover:text-black"
            onClick={() => handleDownload(form)}
            title="Download"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader className="w-6 h-6 text-muted-foreground animate-spin" />
        <span className="mt-2 text-sm text-muted-foreground">Loading submitted forms...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-6 text-sm">{error}</p>;
  }

  if (!isAdmin) {
    return (
      <section className="mb-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Your Submitted Forms</h2>
        </div>
        <div className="max-w-7xl mx-auto">
          {forms.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              You haven’t submitted any forms yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="rounded-xl border bg-white p-6 shadow-sm flex flex-col"
                >
                  <div className="bg-muted p-3 rounded-md mb-4 w-fit">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    Submitted on:
                    <br />
                    <span className="text-black font-medium">
                      {new Date(form.createdAt).toLocaleString()}
                    </span>
                  </p>

                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/forms/view/${form.id}`)}>
                      View
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(form)}>
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Submitted Forms</h2>
      <DataTable
        data={forms}
        columns={columns}
        searchKeys={["status", "creator.email", "template.name"]}
        itemsPerPage={10}
        emptyMessage="No submitted forms found"
      />
    </div>
  );
}
