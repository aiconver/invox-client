import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { getSubmittedFormById, updateFormStatus } from "@/services";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Check, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuthRoles } from "@/components/auth/use-auth-roles";


interface SubmittedForm {
  id: string;
  templateId: string;
  createdAt: string;
  answers: Record<string, string>;
  status: "submitted" | "approved" | "rejected";
}

export function FormViewPage() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<SubmittedForm | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuthRoles();


  useEffect(() => {
    if (!formId) return;
    getSubmittedFormById(formId)
      .then(setForm)
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleDownload = () => {
    if (!form) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Submitted Form`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Form ID: ${form.id}`, 14, 30);
    doc.text(`Submitted on: ${new Date(form.createdAt).toLocaleString()}`, 14, 38);

    const entries = Object.entries(form.answers || {});
    if (entries.length > 0) {
      autoTable(doc, {
        startY: 48,
        head: [["Field", "Answer"]],
        body: entries.map(([key, value]) => [key, value]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });
    } else {
      doc.text("No answers available.", 14, 48);
    }

    doc.save(`form-${form.id}.pdf`);
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!formId) return;
    try {
      await updateFormStatus({ formId, status });
      setForm((prev) => (prev ? { ...prev, status } : prev));
    } catch (error) {
      console.error("❌ Failed to update form status", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-muted/50">
      <Navbar />
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading form...</p>
        ) : !form ? (
          <p className="text-center text-red-500">Form not found.</p>
        ) : (
          <div className="bg-white border rounded-xl shadow p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-primary w-5 h-5" />
              <h2 className="text-xl font-semibold">Submitted Form</h2>
            </div>

            <p className="text-sm text-muted-foreground">
              Submitted on:{" "}
              <span className="font-medium">
                {new Date(form.createdAt).toLocaleString()}
              </span>
            </p>

            <p className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span className="capitalize">{form.status}</span>
            </p>

            <div className="space-y-4">
              {Object.entries(form.answers).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-muted-foreground mb-1">{key}</p>
                  <div className="bg-muted rounded px-3 py-2 text-sm text-foreground">
                    {value || <em className="text-muted-foreground">No answer provided</em>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
              <Button variant="secondary" onClick={handleDownload} className="w-full sm:w-auto">
                Download PDF
              </Button>

              {isAdmin && form.status === "submitted" && (
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange("rejected")}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleStatusChange("approved")}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
