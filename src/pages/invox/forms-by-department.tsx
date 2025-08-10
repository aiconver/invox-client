import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteFormTemplate, getFormsByDepartment } from "@/services"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Settings, Users, Trash2 } from "lucide-react"
import { APP_ROUTES } from "@/lib/routes"
import { BackButton } from "@/components/ui/back-button"
import { useAuthRoles } from "@/components/auth/use-auth-roles"
import { useState } from "react"
import { AssignUsersModal } from "@/components/invox/assign-users-modal"

export function FormsByDepartmentPage() {
  const { isAdmin, isEmployee } = useAuthRoles()
  const { department } = useParams()
  const decodedDepartment = decodeURIComponent(department ?? "")
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const { data: forms, isLoading, error } = useQuery({
    queryKey: ["forms", decodedDepartment],
    queryFn: () => getFormsByDepartment(decodedDepartment),
    enabled: !!decodedDepartment,
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteFormTemplate(id)
      await queryClient.invalidateQueries(["forms", decodedDepartment])
    } catch (err) {
      console.error(err)
      alert("Failed to delete template")
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Navbar />
        <p className="text-center text-muted">Loading forms...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Navbar />
        <p className="text-center text-red-500">Error loading forms.</p>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-muted/50">
      <Navbar />
      <BackButton label="Back to Departments" />
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold text-center mb-2">
          Forms in {decodedDepartment}
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          Select a form to start filling it
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {forms?.map((form) => (
            <div
              key={form.id}
              className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center"
            >
              <div className="bg-muted p-3 rounded-md mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold mb-4">{form.name}</h3>

              {isEmployee && (
                <Button
                  variant="outline"
                  className="text-sm mt-auto w-full"
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => {
                    const path =
                      form.processingType === "HybridFeedback"
                        ? APP_ROUTES.hybridform.to.replace(":formId", encodeURIComponent(form.id))
                        : APP_ROUTES.form.to.replace(":formId", encodeURIComponent(form.id))
                    navigate(path)
                  }}
                >
                  Fill
                </Button>
              )}

              {isAdmin && (
                <>
                  <div className="flex gap-2 w-full mt-auto">
                    <Button
                      variant="outline"
                      className="text-sm w-1/2"
                      icon={<Settings className="w-4 h-4" />}
                      onClick={() => navigate(`/form-template/edit/${form.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm w-1/2"
                      icon={<Users className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedTemplateId(form.id)
                        setAssignModalOpen(true)
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    className="text-sm w-full mt-2"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDelete(form.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {selectedTemplateId && (
          <AssignUsersModal
            open={assignModalOpen}
            formTemplateId={selectedTemplateId}
            onClose={() => setAssignModalOpen(false)}
          />
        )}
      </div>
    </main>
  )
}
