import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { sessionApi } from "@/lib/api/session";
import { toast } from "sonner";
import type { ParsedField } from "@/types/session";

interface CreateCRMContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  parsedFields: ParsedField[];
}

export function CreateCRMContactForm({ open, onOpenChange, sessionId, parsedFields }: CreateCRMContactFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Pre-fill form with parsed fields when dialog opens
  useEffect(() => {
    if (open) {
      const initialData: Record<string, string> = {};
      parsedFields.forEach(field => {
        if (field.value) {
          initialData[field.field_name] = String(field.value);
        }
      });
      setFormData(initialData);
      setSuccess(false);
    }
  }, [open, parsedFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const result = await sessionApi.createCRMContact(sessionId, formData);
      if (result.success) {
        setSuccess(true);
        toast.success(`CRM contact created${result.contact_id ? ` (ID: ${result.contact_id})` : ''}`);
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setFormData({});
        }, 2000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create CRM contact');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create CRM Contact</DialogTitle>
          <DialogDescription>
            Create a new contact in your CRM with the session data
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-accent mb-4" />
            <div className="text-lg font-semibold">Contact Created Successfully!</div>
            <div className="text-sm text-muted-foreground mt-2">
              The contact has been added to your CRM
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Job title"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Contact
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
