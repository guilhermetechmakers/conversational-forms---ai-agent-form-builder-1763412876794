import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Webhook } from "@/types/webhook";
import type { FieldMapping } from "@/lib/api/webhook";

interface FieldMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
  availableFields: Array<{ id: string; name: string; type: string }>;
  onSave: (mappings: Record<string, string>) => void;
}

export function FieldMappingModal({
  open,
  onOpenChange,
  webhook,
  availableFields,
  onSave,
}: FieldMappingModalProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  useEffect(() => {
    if (webhook?.field_mapping) {
      const mapped = Object.entries(webhook.field_mapping).map(([source, target]) => ({
        source_field: source,
        target_field: target,
        transform: "none" as const,
      }));
      setMappings(mapped);
    } else {
      setMappings([]);
    }
  }, [webhook]);

  const addMapping = () => {
    setMappings([
      ...mappings,
      {
        source_field: "",
        target_field: "",
        transform: "none",
      },
    ]);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, field: keyof FieldMapping, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    setMappings(updated);
  };

  const handleSave = () => {
    const mappingObject: Record<string, string> = {};
    mappings.forEach((mapping) => {
      if (mapping.source_field && mapping.target_field) {
        mappingObject[mapping.source_field] = mapping.target_field;
      }
    });
    onSave(mappingObject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Field Mapping</DialogTitle>
          <DialogDescription>
            Map session data fields to your webhook payload format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No field mappings yet. Click "Add Mapping" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mappings.map((mapping, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Source Field</Label>
                      <Select
                        value={mapping.source_field}
                        onValueChange={(value) => updateMapping(index, "source_field", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.name} ({field.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Target Field</Label>
                      <Input
                        placeholder="target_field_name"
                        value={mapping.target_field}
                        onChange={(e) => updateMapping(index, "target_field", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMapping(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addMapping}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Mappings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
