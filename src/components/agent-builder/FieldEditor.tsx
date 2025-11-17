import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Trash2 } from "lucide-react";
import type { AgentField, FieldType } from "@/types/agent";
import { agentFieldSchema, type AgentFieldFormData } from "@/lib/validations/agent";
import { useEffect } from "react";

interface FieldEditorProps {
  field: AgentField | null;
  onUpdate: (field: AgentField) => void;
  onDelete?: (fieldId: string) => void;
  allFields?: AgentField[];
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multi-select", label: "Multi-Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" },
];

export function FieldEditor({ field, onUpdate, onDelete, allFields = [] }: FieldEditorProps) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AgentFieldFormData>({
    resolver: zodResolver(agentFieldSchema),
    defaultValues: field || undefined,
    mode: "onChange",
  });

  const fieldType = watch("type");
  const requiresOptions = fieldType === "select" || fieldType === "multi-select";
  const options = watch("validation.options") || [];
  const conditionalLogic = watch("conditional_logic");
  
  // Get available fields for conditional logic (exclude current field)
  const availableFields = allFields.filter(f => f.id !== field?.id);

  useEffect(() => {
    if (field) {
      setValue("id", field.id);
      setValue("name", field.name);
      setValue("type", field.type);
      setValue("label", field.label);
      setValue("placeholder", field.placeholder || "");
      setValue("required", field.required);
      setValue("validation", field.validation || {});
    }
  }, [field, setValue]);

  const onSubmit = (data: AgentFieldFormData) => {
    if (field) {
      onUpdate(data as AgentField);
    }
  };

  const addOption = () => {
    const newOptions = [...options, { label: "", value: "" }];
    setValue("validation.options", newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setValue("validation.options", newOptions);
  };

  const updateOption = (index: number, key: "label" | "value", value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    setValue("validation.options", newOptions);
  };

  if (!field) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Select a field to edit its properties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Field Properties</CardTitle>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Field Label *</Label>
            <Input
              id="label"
              {...register("label")}
              placeholder="Enter field label"
            />
            {errors.label && (
              <p className="text-xs text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Field Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="field_name"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Field Type *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              {...register("placeholder")}
              placeholder="Enter placeholder text"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="required">Required Field</Label>
            <Controller
              name="required"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {requiresOptions && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <Input
                      placeholder="Label"
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, "label", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) =>
                        updateOption(index, "value", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No options added yet
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="regex">Validation Regex (Optional)</Label>
            <Input
              id="regex"
              {...register("validation.regex")}
              placeholder="^[a-zA-Z0-9]+$"
            />
            <p className="text-xs text-muted-foreground">
              Regular expression pattern for validation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="min">Min Length</Label>
              <Input
                id="min"
                type="number"
                {...register("validation.min", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max Length</Label>
              <Input
                id="max"
                type="number"
                {...register("validation.max", { valueAsNumber: true })}
                placeholder="100"
              />
            </div>
          </div>

          {/* Conditional Logic Section */}
          {availableFields.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Conditional Logic</Label>
                <Controller
                  name="conditional_logic"
                  control={control}
                  render={({ field: conditionalField }) => (
                    <Switch
                      checked={!!conditionalField.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          conditionalField.onChange({
                            field_id: availableFields[0]?.id || "",
                            operator: "equals",
                            value: "",
                          });
                        } else {
                          conditionalField.onChange(undefined);
                        }
                      }}
                    />
                  )}
                />
              </div>
              {conditionalLogic && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="conditional-field">Show this field when</Label>
                    <Controller
                      name="conditional_logic.field_id"
                      control={control}
                      render={({ field: conditionalField }) => (
                        <Select
                          value={conditionalField.value}
                          onValueChange={conditionalField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditional-operator">Operator</Label>
                    <Controller
                      name="conditional_logic.operator"
                      control={control}
                      render={({ field: conditionalField }) => (
                        <Select
                          value={conditionalField.value}
                          onValueChange={conditionalField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditional-value">Value</Label>
                    <Input
                      id="conditional-value"
                      {...register("conditional_logic.value")}
                      placeholder="Enter value"
                    />
                    <p className="text-xs text-muted-foreground">
                      This field will only be shown when the condition is met
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" size="sm">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
