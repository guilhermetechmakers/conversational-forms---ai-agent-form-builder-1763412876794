import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { ParsedField } from "@/types/session";

interface ParsedFieldsCardProps {
  fields: ParsedField[];
}

export function ParsedFieldsCard({ fields }: ParsedFieldsCardProps) {
  const getValidationIcon = (validated: boolean, hasError?: boolean) => {
    if (hasError) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (validated) {
      return <CheckCircle2 className="h-4 w-4 text-accent" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const formatValue = (value: string | string[] | boolean | number): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined) {
      return '—';
    }
    return String(value);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Parsed Fields</CardTitle>
        <CardDescription>
          Structured data extracted from the conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No fields have been parsed yet
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.field_id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{field.field_name}</h4>
                    {getValidationIcon(field.validated, !!field.validation_error)}
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {formatValue(field.value)}
                  </p>
                  {field.validation_error && (
                    <p className="text-xs text-destructive mt-1">
                      {field.validation_error}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Badge
                    variant={field.validated ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {field.validated ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
