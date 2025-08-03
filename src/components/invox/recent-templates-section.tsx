import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getSubmittedForms, getFormTemplate } from "@/services"
import { Loader } from "@/components/ui/loader" 

interface RecentTemplate {
  id: string
  name: string
}

export function RecentTemplatesSection() {
  const [templates, setTemplates] = useState<RecentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleStartWithTemplate = (templateId: string) => {
    navigate(`/forms/fill/${templateId}`)
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const forms = await getSubmittedForms()
        const templateIdSet = new Set<string>()

        for (const form of forms) {
          if (templateIdSet.size >= 5) break
          if (typeof form.templateId === "string") {
            templateIdSet.add(form.templateId)
          }
        }

        const ids = Array.from(templateIdSet)

        const templateResults: RecentTemplate[] = []
        for (const id of ids) {
          try {
            const tpl = await getFormTemplate(id)
            templateResults.push({ id: tpl.id, name: tpl.name })
          } catch (err) {
            console.warn("Failed to load template", id, err)
          }
        }

        setTemplates(templateResults)
      } catch (err) {
        console.error(err)
        setError("Something went wrong while loading recent templates.")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recently Used Templates</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading recent templates...</span>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : templates.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Start by submitting a form — your recent templates will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-lg border shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{tpl.name}</p>
                <p className="text-sm text-muted-foreground">
                  Template ID: {tpl.id.slice(0, 8)}...
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStartWithTemplate(tpl.id)}
                icon={<Rocket />}
              >
                Start Again
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
