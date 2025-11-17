import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { supportApi } from "@/lib/api/support";
import { supportTicketSchema, type SupportTicketFormData } from "@/lib/validations/help";
import { toast } from "sonner";

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SupportTicketModal({ open, onOpenChange, onSuccess }: SupportTicketModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<SupportTicketFormData>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const priority = watch('priority');

  const mutation = useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: (data) => {
      toast.success(`Support ticket created successfully! Ticket ID: ${data.id}`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create support ticket');
    },
  });

  const onSubmit = (data: SupportTicketFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Support Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Brief description of your issue"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Billing, Technical"
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Please provide as much detail as possible about your issue..."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
