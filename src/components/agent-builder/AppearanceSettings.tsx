import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agentAppearanceSchema, type AgentAppearanceFormData } from "@/lib/validations/agent";
import type { AgentAppearance } from "@/types/agent";
import { useEffect } from "react";

interface AppearanceSettingsProps {
  appearance: AgentAppearance;
  onUpdate: (appearance: AgentAppearance) => void;
}

export function AppearanceSettings({
  appearance,
  onUpdate,
}: AppearanceSettingsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgentAppearanceFormData>({
    resolver: zodResolver(agentAppearanceSchema),
    defaultValues: {
      primary_color: appearance.primary_color || "#2563EB",
      secondary_color: appearance.secondary_color || "#10B981",
      font_family: appearance.font_family || "Inter",
      logo_url: appearance.logo_url || "",
      header_text: appearance.header_text || "",
      cta_text: appearance.cta_text || "",
    },
    mode: "onChange",
  });

  const primaryColor = watch("primary_color");

  useEffect(() => {
    setValue("primary_color", appearance.primary_color || "#2563EB");
    setValue("secondary_color", appearance.secondary_color || "#10B981");
    setValue("font_family", appearance.font_family || "Inter");
    setValue("logo_url", appearance.logo_url || "");
    setValue("header_text", appearance.header_text || "");
    setValue("cta_text", appearance.cta_text || "");
  }, [appearance, setValue]);

  const onSubmit = (data: AgentAppearanceFormData) => {
    onUpdate(data as AgentAppearance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>
          Customize the look and feel of your agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  {...register("primary_color")}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  {...register("primary_color")}
                  placeholder="#2563EB"
                  className="flex-1"
                />
              </div>
              {errors.primary_color && (
                <p className="text-xs text-destructive">
                  {errors.primary_color.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  {...register("secondary_color")}
                  className="h-10 w-20 p-1 cursor-pointer"
                />
                <Input
                  {...register("secondary_color")}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
              {errors.secondary_color && (
                <p className="text-xs text-destructive">
                  {errors.secondary_color.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Input
              id="font-family"
              {...register("font_family")}
              placeholder="Inter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input
              id="logo-url"
              {...register("logo_url")}
              placeholder="https://example.com/logo.png"
              type="url"
            />
            {errors.logo_url && (
              <p className="text-xs text-destructive">{errors.logo_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-text">Header Text</Label>
            <Input
              id="header-text"
              {...register("header_text")}
              placeholder="Welcome to our form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-text">Call-to-Action Text</Label>
            <Input
              id="cta-text"
              {...register("cta_text")}
              placeholder="Get Started"
            />
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-xs font-medium mb-2">Preview</p>
            <div
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: primaryColor || "#2563EB" }}
            >
              <p className="font-semibold mb-1">
                {watch("header_text") || "Welcome to our form"}
              </p>
              <p className="text-sm opacity-90">
                {watch("cta_text") || "Get Started"}
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Appearance Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
