import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

const paymentMethodSchema = z.object({
  cardNumber: z.string().min(13).max(19).regex(/^\d+$/, "Card number must contain only digits"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string().regex(/^\d{4}$/, "Invalid year"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentMethodModal({ open, onOpenChange }: PaymentMethodModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
  });

  // In a real implementation, you would integrate with Stripe Elements
  // For now, this is a placeholder that shows the form structure
  const onSubmit = async (_data: PaymentMethodFormData) => {
    setIsProcessing(true);
    
    try {
      // In production, you would:
      // 1. Create a payment method with Stripe.js
      // 2. Get the payment method ID
      // 3. Call the API to attach it to the customer
      
      // For now, we'll simulate this
      toast.info("Payment method integration requires Stripe.js setup");
      
      // Example: const paymentMethod = await stripe.createPaymentMethod({...});
      // await billingApi.addPaymentMethod(paymentMethod.id);
      
      reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["billing", "payment-methods"] });
    } catch (error) {
      toast.error("Failed to add payment method");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to your account. All payment information is securely processed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              {...register("cardholderName")}
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              {...register("cardNumber")}
            />
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Expiry Month</Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                maxLength={2}
                {...register("expiryMonth")}
              />
              {errors.expiryMonth && (
                <p className="text-sm text-destructive">{errors.expiryMonth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryYear">Expiry Year</Label>
              <Input
                id="expiryYear"
                placeholder="YYYY"
                maxLength={4}
                {...register("expiryYear")}
              />
              {errors.expiryYear && (
                <p className="text-sm text-destructive">{errors.expiryYear.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              type="password"
              maxLength={4}
              {...register("cvv")}
            />
            {errors.cvv && (
              <p className="text-sm text-destructive">{errors.cvv.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Your payment information is encrypted and secure</span>
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
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Payment Method"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This form is a placeholder. In production, integrate with Stripe Elements
            for secure payment method collection. Never collect raw card data directly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
