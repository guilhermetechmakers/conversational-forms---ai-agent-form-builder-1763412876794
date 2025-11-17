import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Webhook as WebhookIcon, 
  Edit, 
  Trash2, 
  TestTube,
  Copy,
  Shield,
  Map
} from "lucide-react";
import type { Webhook } from "@/types/webhook";
import { toast } from "sonner";

interface WebhookCardProps {
  webhook: Webhook;
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
  onTest: (webhook: Webhook) => void;
  onFieldMapping?: (webhook: Webhook) => void;
}

export function WebhookCard({ webhook, onEdit, onDelete, onTest, onFieldMapping }: WebhookCardProps) {
  const getStatusBadge = (status: Webhook["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      error: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(webhook.endpoint);
    toast.success("Endpoint copied to clipboard");
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <WebhookIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{webhook.endpoint}</CardTitle>
              <CardDescription className="mt-1">
                {webhook.agent_id ? "Agent-specific" : "Workspace-wide"}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(webhook.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Method:</span>
            <span className="font-medium">{webhook.method}</span>
          </div>
          {webhook.field_mapping && Object.keys(webhook.field_mapping).length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Field Mappings:</span>
              <span className="font-medium">{Object.keys(webhook.field_mapping).length}</span>
            </div>
          )}
          {webhook.secret && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">HMAC signed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(webhook)}
            className="flex-1 min-w-[80px]"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {onFieldMapping && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFieldMapping(webhook)}
              className="flex-1 min-w-[80px]"
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(webhook)}
            className="flex-1 min-w-[80px]"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyEndpoint}
            title="Copy endpoint"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(webhook)}
            className="text-destructive hover:text-destructive"
            title="Delete webhook"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
