import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ParsedField } from "@/types/session";
import type { AgentField } from "@/types/agent";

interface ValidationFeedbackSidebarProps {
  fields: AgentField[];
  parsedFields: ParsedField[];
  className?: string;
}

export function ValidationFeedbackSidebar({
  fields,
  parsedFields,
  className,
}: ValidationFeedbackSidebarProps) {
  // Group fields by validation status
  const validatedFields = parsedFields.filter((f) => f.validated);
  const invalidFields = parsedFields.filter((f) => !f.validated && f.value);
  const pendingFields = fields.filter(
    (f) => f.required && !parsedFields.find((pf) => pf.field_id === f.id)
  );

  const getFieldLabel = (fieldId: string): string => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Validation Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-4">
            {/* Validated Fields */}
            {validatedFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Validated ({validatedFields.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {validatedFields.map((field) => (
                    <div
                      key={field.field_id}
                      className="p-3 bg-accent/10 rounded-lg border border-accent/20 animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {getFieldLabel(field.field_id)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {formatValue(field.value)}
                          </p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invalid Fields */}
            {invalidFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Needs Correction ({invalidFields.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {invalidFields.map((field) => (
                    <div
                      key={field.field_id}
                      className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {getFieldLabel(field.field_id)}
                          </p>
                          {field.validation_error && (
                            <p className="text-xs text-destructive mt-1 line-clamp-2">
                              {field.validation_error}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            Current: {formatValue(field.value)}
                          </p>
                        </div>
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Required Fields */}
            {pendingFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Pending ({pendingFields.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingFields.map((field) => (
                    <div
                      key={field.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border animate-fade-in"
                    >
                      <div className="flex items-start gap-2">
                        <Loader2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 animate-spin" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground truncate">
                            {field.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Waiting for input...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {parsedFields.length === 0 && pendingFields.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No fields collected yet
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
