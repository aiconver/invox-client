import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFormTemplate, addFormTemplate, updateFormTemplate } from "@/services"

interface Props {
  formTemplateId?: string
}

const departments = ["HR", "Logistics", "Sales", "Operations"]

const aiArchitectures = [
  "OneModelAllQuestion",
  "MultiModelAllQuestion",
  "OneModelOneQuestion",
  "MultiModelOneQuestion",
  "HybridFeedback",
]

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
]

export function FormTemplateEditor({ formTemplateId }: Props) {
  const isEdit = !!formTemplateId
  const navigate = useNavigate()

  const [fields, setFields] = useState<Field[]>([])
  const [formTitle, setFormTitle] = useState("")
  const [department, setDepartment] = useState(departments[0])
  const [aiArchitecture, setAiArchitecture] = useState(aiArchitectures[0])
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!formTemplateId) return
    getFormTemplate(formTemplateId)
      .then((tpl) => {
        setFormTitle(tpl.name)
        setDepartment(tpl.department)
        setAiArchitecture(tpl.processingType)
        setDescription(tpl.domainKnowledge ?? "")
        const structuredFields = Object.entries(tpl.structure).map(([label, def]) => ({
          id: `${Date.now()}-${label}`,
          label,
          type: def.type,
          required: def.required,
          options: def.options ?? [],
        }))
        setFields(structuredFields)
      })
      .catch((err) => {
        console.error("Failed to load template", err)
        alert("Error loading template.")
      })
  }, [formTemplateId])

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      { id: `${Date.now()}`, type: "text", label: "", required: false },
    ])
  }

  const handleFieldChange = (id: string, key: keyof Field, value: any) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)))
  }

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSave = async () => {
    const structure = fields.reduce((acc, field) => {
      acc[field.label] = {
        type: field.type,
        required: field.required,
      }
      if (field.options?.length) acc[field.label].options = field.options
      return acc
    }, {} as Record<string, any>)

    const payload = {
      name: formTitle,
      department,
      processingType: aiArchitecture,
      domainKnowledge: description,
      structure,
    }

    try {
      if (isEdit) {
        await updateFormTemplate({ id: formTemplateId!, ...payload })
      } else {
        await addFormTemplate(payload)
      }
      navigate("/")
    } catch (err) {
      console.error("Error saving template", err)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <h2 className="text-xl font-semibold text-center mb-2">
        {isEdit ? "Edit Form Template" : "Create Form Template"}
      </h2>
      <p className="text-center text-muted-foreground mb-6">
        Define the fields for your form template. Add questions, choose field types, and save your template.
      </p>

      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full p-3 border rounded-md shadow-sm"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 border rounded-md shadow-sm"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">AI Architecture</label>
            <select
              value={aiArchitecture}
              onChange={(e) => setAiArchitecture(e.target.value)}
              className="w-full p-3 border rounded-md shadow-sm"
            >
              {aiArchitectures.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm resize-none"
            placeholder="Enter description"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Form Fields</h3>
          <Button onClick={handleAddField} icon={<Plus />}>
            Add Field
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  Question {index + 1}: {field.label || "Untitled"}
                </h4>
                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium mb-1">Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                    className="w-full p-3 border rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(field.id, "type", e.target.value)}
                    className="w-full p-3 border rounded-md shadow-sm"
                  >
                    {fieldTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3 flex items-end">
                  <label className="flex items-center text-sm gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(field.id, "required", e.target.checked)}
                    />
                    Required
                  </label>
                </div>
              </div>

              {(field.type === "select" || field.type === "radio") && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  {(field.options || []).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleFieldChange(
                            field.id,
                            "options",
                            field.options!.map((o, i) => (i === idx ? e.target.value : o))
                          )
                        }
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <button
                        className="text-red-500"
                        onClick={() =>
                          handleFieldChange(
                            field.id,
                            "options",
                            field.options!.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleFieldChange(field.id, "options", [...(field.options || []), ""])
                    }
                  >
                    + Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button onClick={handleSave}>
          {isEdit ? "Update Template" : "Save Template"}
        </Button>
      </div>
    </div>
  )
}
