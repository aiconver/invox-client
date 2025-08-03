import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAssignableUsers, assignUsers } from "@/services"
import { Loader } from "@/components/ui/loader"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

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

function DraggableUser({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: user.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-muted px-3 py-2 rounded-md text-sm shadow-sm cursor-move"
    >
      {user.username}
      <span className="ml-1 text-muted-foreground text-xs">({user.email})</span>
    </div>
  )
}

export function AssignUsersModal({ open, onClose, formTemplateId }: Props) {
  const [assigned, setAssigned] = useState<User[]>([])
  const [unassigned, setUnassigned] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getAssignableUsers(formTemplateId)
      .then(({ assignedUsers, unassignedUsers }) => {
        setAssigned(assignedUsers)
        setUnassigned(unassignedUsers)
      })
      .finally(() => setLoading(false))
  }, [open, formTemplateId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const isFromAssigned = assigned.find((u) => u.id === active.id)
    const source = isFromAssigned ? assigned : unassigned
    const target = isFromAssigned ? unassigned : assigned

    const movedUser = source.find((u) => u.id === active.id)
    if (!movedUser) return

    const newSource = source.filter((u) => u.id !== active.id)
    const newTarget = [movedUser, ...target]

    isFromAssigned ? (setAssigned(newSource), setUnassigned(newTarget)) : (setAssigned(newTarget), setUnassigned(newSource))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await assignUsers(formTemplateId, assigned.map((u) => u.id))
      onClose()
    } catch (err) {
      console.error("Failed to assign users:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Users to Template</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            <div className="grid grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
              <div>
                <p className="font-medium mb-2">Available Users</p>
                <SortableContext items={unassigned.map((u) => u.id)} strategy={rectSortingStrategy}>
                  <div className="space-y-2">
                    {unassigned.map((user) => (
                      <DraggableUser key={user.id} user={user} />
                    ))}
                  </div>
                </SortableContext>
              </div>
              <div>
                <p className="font-medium mb-2">Assigned Users</p>
                <SortableContext items={assigned.map((u) => u.id)} strategy={rectSortingStrategy}>
                  <div className="space-y-2">
                    {assigned.map((user) => (
                      <DraggableUser key={user.id} user={user} />
                    ))}
                  </div>
                </SortableContext>
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
          </DndContext>
        )}
      </DialogContent>
    </Dialog>
  )
}
