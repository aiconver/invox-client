import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { getSubmittedForms } from "@/services"
import { Loader } from "@/components/ui/loader"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface SubmittedForm {
  id: string
  createdAt: string
  answers: Record<string, any>
}

export function SubmittedFormsSection() {
  const [submittedForms, setSubmittedForms] = useState<SubmittedForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    getSubmittedForms()
      .then(setSubmittedForms)
      .catch((err) => {
        console.error("Failed to load submitted forms:", err)
        setError("Failed to load submitted forms.")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleView = (formId: string) => {
    navigate(`/forms/view/${formId}`)
  }

  const handleDownload = (form: SubmittedForm) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Form ID: ${form.id}`, 14, 20)

    doc.setFontSize(12)
    doc.text(`Submitted on: ${new Date(form.createdAt).toLocaleString()}`, 14, 30)

    const answerEntries = Object.entries(form.answers || {})
    if (answerEntries.length > 0) {
      const tableData = answerEntries.map(([key, value]) => [key, String(value)])
      autoTable(doc, {
        startY: 40,
        head: [["Question", "Answer"]],
        body: tableData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      })
    } else {
      doc.text("No answers available.", 14, 40)
    }

    doc.save(`form-${form.id}.pdf`)
  }

  return (
    <section className="mb-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Your Submitted Forms</h2>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="w-6 h-6 text-muted-foreground animate-spin" />
            <span className="mt-2 text-sm text-muted-foreground">
              Loading submitted forms...
            </span>
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-6">{error}</p>
        ) : submittedForms.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            You haven’t submitted any forms yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {submittedForms.map((form) => (
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
                  <Button variant="outline" size="sm" onClick={() => handleView(form.id)}>
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
  )
}
