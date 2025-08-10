import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/lib/routes"
import { FileEdit, PlusCircle, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthRoles } from "../auth/use-auth-roles"

export function DashboardActions() {
  const navigate = useNavigate()
  const {isAdmin} = useAuthRoles()

  const handleStartFilling = () => {
    navigate(APP_ROUTES.departments.to)
  }

  const handleCreateTemplate = () => {
    navigate(APP_ROUTES.formTemplateCreate.to)
  }

  const handleUsers = () => {
    navigate(APP_ROUTES.users.to)
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-wrap justify-end gap-2">
      <Button onClick={handleStartFilling} variant="default" size="sm" icon={<FileEdit />}>
        Start Filling Form
      </Button>
      {isAdmin && (
        <>
          <Button onClick={handleCreateTemplate} variant="outline" size="sm" icon={<PlusCircle />}>
            Add New Template
          </Button>
          <Button onClick={handleUsers} variant="secondary" size="sm" icon={<Users />}>
            Manage Users
          </Button>
        </>
      )}
    </div>
  )
}
