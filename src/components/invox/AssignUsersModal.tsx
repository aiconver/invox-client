import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getAssignableUsers, assignUsers } from "@/services"
import { Loader } from "@/components/ui/loader"

type Props = {
  open: boolean
  onClose: () => void
  formTemplateId: string
}

interface User {
  id: string
  username: string
  email: string
}

export function AssignUsersModal({ open, onClose, formTemplateId }: Props) {
  const [assigned, setAssigned] = useState<User[]>([])
  const [unassigned, setUnassigned] = useState<User[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getAssignableUsers(formTemplateId)
      .then(({ assignedUsers, unassignedUsers }) => {
        setAssigned(assignedUsers)
        setUnassigned(unassignedUsers)
        setSelectedIds(new Set(assignedUsers.map((u) => u.id)))
      })
      .finally(() => setLoading(false))
  }, [open, formTemplateId])

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId)
      return newSet
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await assignUsers(formTemplateId, Array.from(selectedIds))
      onClose()
    } catch (err) {
      console.error("Failed to assign users:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Users to Template</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              <div>
                <p className="font-medium mb-2">Available Users</p>
                {unassigned.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 py-1 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    {user.username} <span className="text-muted-foreground text-xs">({user.email})</span>
                  </label>
                ))}
              </div>
              <div>
                <p className="font-medium mb-2">Currently Assigned</p>
                {assigned.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 py-1 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    {user.username} <span className="text-muted-foreground text-xs">({user.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting}>
                Save
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
