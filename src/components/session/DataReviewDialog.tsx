import { CheckCircle2, XCircle, AlertCircle, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ParsedField } from "@/types/session";
import type { AgentField } from "@/types/agent";

interface DataReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: AgentField[];
  parsedFields: ParsedField[];
  onConfirm: () => void;
  onEdit?: (fieldId: string) => void;
  isLoading?: boolean;
}

export function DataReviewDialog({
  open,
  onOpenChange,
  fields,
  parsedFields,
  onConfirm,
  onEdit,
  isLoading = false,
}: DataReviewDialogProps) {
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
    if (value === null || value === undefined) {
      return "Not provided";
    }
    return String(value);
  };

  const allValidated = parsedFields.every((f) => f.validated);
  const hasInvalidFields = parsedFields.some((f) => !f.validated && f.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Collected Data</DialogTitle>
          <DialogDescription>
            Please review the information collected during this session before submitting.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-4">
            {parsedFields.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data collected yet</p>
              </div>
            ) : (
              parsedFields.map((field) => {
                const isValid = field.validated;
                const hasError = !isValid && field.validation_error;

                return (
                  <div
                    key={field.field_id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      isValid
                        ? "border-accent/20 bg-accent/5"
                        : hasError
                        ? "border-destructive/20 bg-destructive/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold">
                            {getFieldLabel(field.field_id)}
                          </h4>
                          {isValid ? (
                            <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/20">
                              <CheckCircle2 className="h-3 w-3" />
                              Validated
                            </Badge>
                          ) : hasError ? (
                            <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
                              <XCircle className="h-3 w-3" />
                              Error
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-foreground">
                            {formatValue(field.value)}
                          </p>
                          {hasError && (
                            <p className="text-xs text-destructive mt-1">
                              {field.validation_error}
                            </p>
                          )}
                        </div>
                      </div>

                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(field.field_id)}
                          className="h-8 flex-shrink-0"
                        >
                          <Edit2 className="h-3 w-3 mr-1.5" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {hasInvalidFields && (
          <div className="px-6 py-3 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Some fields have validation errors. Please correct them before submitting.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || !allValidated || hasInvalidFields}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Confirm & Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
