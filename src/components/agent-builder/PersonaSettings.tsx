import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { agentPersonaSchema, type AgentPersonaFormData } from "@/lib/validations/agent";
import type { AgentPersona } from "@/types/agent";
import { useEffect } from "react";

interface PersonaSettingsProps {
  persona: AgentPersona;
  onUpdate: (persona: AgentPersona) => void;
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
];

export function PersonaSettings({ persona, onUpdate }: PersonaSettingsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AgentPersonaFormData>({
    resolver: zodResolver(agentPersonaSchema),
    defaultValues: persona,
    mode: "onChange",
  });

  useEffect(() => {
    setValue("name", persona.name);
    setValue("avatar_url", persona.avatar_url || "");
    setValue("tagline", persona.tagline || "");
    setValue("tone", persona.tone);
    setValue("instructions", persona.instructions || "");
  }, [persona, setValue]);

  const onSubmit = (data: AgentPersonaFormData) => {
    onUpdate(data as AgentPersona);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persona Settings</CardTitle>
        <CardDescription>
          Configure your agent's personality and behavior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">Persona Name *</Label>
            <Input
              id="persona-name"
              {...register("name")}
              placeholder="Assistant"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-url">Avatar URL</Label>
            <Input
              id="avatar-url"
              {...register("avatar_url")}
              placeholder="https://example.com/avatar.png"
              type="url"
            />
            {errors.avatar_url && (
              <p className="text-xs text-destructive">
                {errors.avatar_url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              {...register("tagline")}
              placeholder="I'm here to help you complete this form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Controller
              name="tone"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting Template</Label>
            <Textarea
              id="greeting"
              {...register("greeting_template")}
              placeholder="Hello! I'm here to help you..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">System Instructions</Label>
            <Textarea
              id="instructions"
              {...register("instructions")}
              placeholder="You are a helpful assistant that collects information through conversation..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Define how the agent should behave and interact with users
            </p>
          </div>

          <Button type="submit" className="w-full">
            Save Persona Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
