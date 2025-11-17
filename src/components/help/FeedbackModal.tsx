import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { supportApi } from "@/lib/api/support";
import { feedbackSchema, type FeedbackFormData } from "@/lib/validations/help";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docId?: string;
  tutorialId?: string;
  onSuccess?: () => void;
}

export function FeedbackModal({ open, onOpenChange, docId, tutorialId, onSuccess }: FeedbackModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      doc_id: docId,
      tutorial_id: tutorialId,
      rating: 'helpful',
    },
  });

  const rating = watch('rating');

  const mutation = useMutation({
    mutationFn: supportApi.submitFeedback,
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit feedback');
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Was this helpful?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve our documentation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={rating === 'helpful' ? 'default' : 'outline'}
                onClick={() => setValue('rating', 'helpful')}
                className={cn(
                  "flex-1",
                  rating === 'helpful' && "bg-primary text-primary-foreground"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful
              </Button>
              <Button
                type="button"
                variant={rating === 'not_helpful' ? 'default' : 'outline'}
                onClick={() => setValue('rating', 'not_helpful')}
                className={cn(
                  "flex-1",
                  rating === 'not_helpful' && "bg-primary text-primary-foreground"
                )}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Not Helpful
              </Button>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              {...register('comment')}
              placeholder="Tell us more about your experience..."
              rows={4}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
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
              {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
