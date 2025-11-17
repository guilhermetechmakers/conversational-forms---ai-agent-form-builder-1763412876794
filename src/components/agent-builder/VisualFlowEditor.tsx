import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Trash2 } from "lucide-react";
import type { AgentField } from "@/types/agent";
import { cn } from "@/lib/utils";

interface VisualFlowEditorProps {
  fields: AgentField[];
  selectedField: AgentField | null;
  onSelectField: (field: AgentField) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields?: (fields: AgentField[]) => void;
}

const fieldTypeLabels: Record<string, string> = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  select: "Select",
  "multi-select": "Multi-Select",
  checkbox: "Checkbox",
  date: "Date",
  file: "File Upload",
};

export function VisualFlowEditor({
  fields,
  selectedField,
  onSelectField,
  onDeleteField,
}: VisualFlowEditorProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground">
                <p className="text-sm mb-2">No fields added yet</p>
                <p className="text-xs">
                  Add fields from the Field Palette to get started
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    "group relative p-4 border rounded-lg transition-all duration-200",
                    "hover:shadow-md hover:border-primary/50",
                    selectedField?.id === field.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "bg-card hover:bg-muted/30"
                  )}
                  onClick={() => onSelectField(field)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {field.label}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {fieldTypeLabels[field.type] || field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="outline" className="text-xs text-destructive">
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.placeholder && (
                        <p className="text-xs text-muted-foreground">
                          Placeholder: {field.placeholder}
                        </p>
                      )}
                      {field.validation?.options && field.validation.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.validation.options.slice(0, 3).map((option, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {option.label}
                            </Badge>
                          ))}
                          {field.validation.options.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{field.validation.options.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteField(field.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
