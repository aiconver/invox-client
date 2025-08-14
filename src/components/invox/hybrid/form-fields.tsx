// src/components/hybrid/FormFields.tsx
import { FieldConfig } from "@/types/form";

type Field = {
  name: string;
  config: FieldConfig;
};

type Props = {
  fields: Field[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

export function FormFields({ fields, values, onChange }: Props) {
  return (
    <div className="bg-white rounded-lg p-6 shadow border space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Form Fields</h2>
        <p className="text-sm text-gray-500">Speak naturally – fields will fill automatically</p>
      </div>

      <div className="grid gap-4">
        {fields.map(({ name, config }) => (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {name}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={values[name] || ""}
              onChange={(e) => onChange(name, e.target.value)}
              placeholder={`Speak about ${name.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
