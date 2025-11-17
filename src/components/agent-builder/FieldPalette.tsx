import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  Calendar,
  Upload,
  GripVertical,
} from "lucide-react";
import type { FieldType } from "@/types/agent";
import { cn } from "@/lib/utils";

interface FieldTypeOption {
  value: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const fieldTypes: FieldTypeOption[] = [
  {
    value: "text",
    label: "Text",
    icon: Type,
    description: "Single-line text input",
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    description: "Email address input",
  },
  {
    value: "phone",
    label: "Phone",
    icon: Phone,
    description: "Phone number input",
  },
  {
    value: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input",
  },
  {
    value: "select",
    label: "Select",
    icon: List,
    description: "Single choice dropdown",
  },
  {
    value: "multi-select",
    label: "Multi-Select",
    icon: List,
    description: "Multiple choice dropdown",
  },
  {
    value: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Boolean checkbox",
  },
  {
    value: "date",
    label: "Date",
    icon: Calendar,
    description: "Date picker",
  },
  {
    value: "file",
    label: "File Upload",
    icon: Upload,
    description: "File upload input",
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Field Palette</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Drag or click to add fields
        </p>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {fieldTypes.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.value}
                  onClick={() => onAddField(fieldType.value)}
                  className={cn(
                    "w-full p-3 rounded-lg border border-border bg-card",
                    "hover:bg-muted/50 hover:border-primary/50",
                    "transition-all duration-200 hover:shadow-sm",
                    "text-left group cursor-pointer",
                    "flex items-start gap-3"
                  )}
                  type="button"
                >
                  <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-sm font-medium text-foreground">
                        {fieldType.label}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fieldType.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
