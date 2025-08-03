import { Button } from "@/components/ui/button"
import { FileEdit, PlusCircle, Users } from "lucide-react"

interface DashboardActionsProps {
  onStartFilling: () => void
  onCreateTemplate: () => void
  onManageUsers: () => void
}

export function DashboardActions({
  onStartFilling,
  onCreateTemplate,
  onManageUsers,
}: DashboardActionsProps) {
  return (
    <div className="max-w-7xl mx-auto flex justify-end gap-2">
      <Button onClick={onStartFilling} variant="default" size="sm" icon={<FileEdit />}>
        Start Filling Form
      </Button>
      <Button onClick={onCreateTemplate} variant="outline" size="sm" icon={<PlusCircle />}>
        Add New Template
      </Button>
      <Button onClick={onManageUsers} variant="secondary" size="sm" icon={<Users />}>
        Manage Users
      </Button>
    </div>
  )
}
