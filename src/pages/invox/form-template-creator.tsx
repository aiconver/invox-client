import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { addFormTemplate } from "@/services/invox";

export interface Field {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export function FormTemplateCreatorPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("HR");
  const [aiArchitecture, setAiArchitecture] = useState<string>("OneModelAllQuestion");
  const [description, setDescription] = useState<string>("");

  const handleAddField = () => {
    const newField: Field = {
      id: `${Date.now()}`,
      type: "text",
      label: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleFieldChange = (id: string, key: keyof Field, value: any) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)));
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleCreateForm = async () => {
  // Convert the fields array into an object
  const formattedFields = fields.reduce((acc, field) => {
    acc[field.label] = {
      type: field.type,
      required: field.required,
    };
    return acc;
  }, {} as Record<string, { type: string; required: boolean }>);

  const formTemplate = {
    name: formTitle,
    department,
    processingType: aiArchitecture,
    domainKnowledge: description,
    structure: formattedFields, // Use the formatted fields object
  };

  try {
    // Call the addFormTemplate service to create the form template
    const result = await addFormTemplate(formTemplate);

    // Log the result for debugging
    console.log("Created Form Template:", result);

    // Notify the user of successful creation
    alert("Form template created successfully!");
  } catch (error) {
    // Handle any errors
    console.error("Error creating form template:", error);
    alert("Failed to create form template. Please try again.");
  }
};
  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Textarea" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Select" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio" }
  ];

  const departments = [
    "HR",
    "Logistics",
    "Sales",
    "Operations"
  ];

enum ProcessingType {
  OneModelAllQuestion = "OneModelAllQuestion",
  MultiModelAllQuestion = "MultiModelAllQuestion",
  OneModelOneQuestion = "OneModelOneQuestion",
  MultiModelOneQuestion = "MultiModelOneQuestion",
  HybridFeedback = "HybridFeedback",
}

// Updated the aiArchitectures list to use the ProcessingType enum
const aiArchitectures = Object.values(ProcessingType);

  return (
    <main className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label="Back to Home" />
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold text-center mb-2">
          Create Form Template
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          Define the fields for your form template. Add questions, choose field types, and save your template.
        </p>

        {/* Basic Information Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Form Title
              </label>
              <input
                type="text"
                placeholder="Enter form title"
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Department
              </label>
              <select
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                AI Architecture
              </label>
              <select
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={aiArchitecture}
                onChange={(e) => setAiArchitecture(e.target.value)}
              >
                {aiArchitectures.map(arch => (
                  <option key={arch} value={arch}>{arch}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter form description"
              rows={3}
              className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Form Fields</h3>
              <p className="text-sm text-muted-foreground">Add and configure the fields for your form</p>
            </div>
            <button
              onClick={handleAddField}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Field
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    Question {index + 1}: {field.label || "Untitled Field"}
                  </h4>
                  {fields.length > 1 && (
                    <button
                      onClick={() => handleRemoveField(field.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete field"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Field Label */}
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      placeholder="Enter field label"
                      className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={field.label}
                      onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                    />
                  </div>

                  {/* Field Type */}
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium mb-1">
                      Field Type
                    </label>
                    <select
                      className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={field.type}
                      onChange={(e) => handleFieldChange(field.id, "type", e.target.value)}
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Required checkbox */}
                  <div className="md:col-span-3 flex items-end pb-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(field.id, "required", e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      Required
                    </label>
                  </div>
                </div>

                {/* Options for select/radio fields */}
                {(field.type === "select" || field.type === "radio") && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="block text-sm font-medium mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {field.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={option}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "options",
                                field.options!.map((opt, i) => (i === idx ? e.target.value : opt))
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              handleFieldChange(
                                field.id,
                                "options",
                                field.options!.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )) || []}
                      <button
                        onClick={() =>
                          handleFieldChange(field.id, "options", [...(field.options || []), ""])
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <Button
            onClick={handleCreateForm}
          >
            Save Template
          </Button>
        </div>
      </div>
    </main>
  );
}