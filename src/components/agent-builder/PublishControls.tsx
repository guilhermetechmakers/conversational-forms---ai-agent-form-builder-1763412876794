import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PublishControlsProps {
  slug: string;
  status: "draft" | "published" | "archived";
  webhookUrl?: string;
  enableCaptcha: boolean;
  onSlugChange: (slug: string) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onWebhookChange: (url: string) => void;
  onCaptchaToggle: (enabled: boolean) => void;
  workspaceSlug?: string;
}

export function PublishControls({
  slug,
  status,
  webhookUrl = "",
  enableCaptcha,
  onSlugChange,
  onPublish,
  onUnpublish,
  onWebhookChange,
  onCaptchaToggle,
  workspaceSlug = "workspace",
}: PublishControlsProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/a/${workspaceSlug}/${slug || "slug"}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Settings</CardTitle>
        <CardDescription>
          Configure webhooks and publish your agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Public URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                /a/{workspaceSlug}/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="my-contact-form"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {slug && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {status === "published" ? (
                    <Globe className="h-4 w-4 text-accent" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label className="text-sm font-medium">Public URL</Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground flex-1 break-all">
                  {publicUrl}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => window.open(publicUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="captcha" className="text-sm font-medium">
                Enable CAPTCHA
              </Label>
              <p className="text-xs text-muted-foreground">
                Protect your form from spam
              </p>
            </div>
            <Switch
              id="captcha"
              checked={enableCaptcha}
              onCheckedChange={onCaptchaToggle}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => onWebhookChange(e.target.value)}
              placeholder="https://example.com/webhook"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Receive notifications when sessions are completed
            </p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant={status === "published" ? "default" : "outline"}
              className={cn(
                status === "published" && "bg-accent text-accent-foreground"
              )}
            >
              {status === "published" ? (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
          </div>

          {status === "published" ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={onUnpublish}
            >
              Unpublish Agent
            </Button>
          ) : (
            <Button className="w-full" onClick={onPublish}>
              Publish Agent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
