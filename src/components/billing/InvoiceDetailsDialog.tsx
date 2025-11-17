import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import type { Invoice } from "@/types/billing";
import { format } from "date-fns";

interface InvoiceDetailsDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

export function InvoiceDetailsDialog({
  invoice,
  open,
  onOpenChange,
  onDownload,
}: InvoiceDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      void: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice #{invoice.invoiceNumber}
          </DialogTitle>
          <DialogDescription>
            View invoice details and download PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium">
                {format(new Date(invoice.invoiceDate), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <p className="font-medium">
                {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold">
                ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-4">Line Items</h3>
            <div className="space-y-3">
              {invoice.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.description}</p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">
                    ${item.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>
              ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {invoice.pdfUrl && (
              <Button onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
