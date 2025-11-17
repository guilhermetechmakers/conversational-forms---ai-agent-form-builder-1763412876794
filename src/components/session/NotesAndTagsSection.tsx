import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, User, Star, Tag as TagIcon } from "lucide-react";
import { sessionApi } from "@/lib/api/session";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { SessionNote, SessionTag } from "@/types/session";

interface NotesAndTagsSectionProps {
  sessionId: string;
  notes?: SessionNote[];
  tags?: SessionTag[];
  assigneeId?: string;
  assigneeName?: string;
  leadScore?: number;
}

export function NotesAndTagsSection({
  sessionId,
  notes = [],
  tags = [],
  assigneeName,
  leadScore,
}: NotesAndTagsSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => sessionApi.addNote(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      setNewNote('');
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add note');
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    addNoteMutation.mutate(newNote);
  };

  const removeTagMutation = useMutation({
    mutationFn: (tagId: string) => sessionApi.removeTag(sessionId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      toast.success('Tag removed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove tag');
    },
  });

  const updateLeadScoreMutation = useMutation({
    mutationFn: (score: number) => sessionApi.updateLeadScore(sessionId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      toast.success('Lead score updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead score');
    },
  });

  const handleLeadScoreChange = (score: number) => {
    if (score < 0 || score > 100) {
      toast.error('Lead score must be between 0 and 100');
      return;
    }
    updateLeadScoreMutation.mutate(score);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Notes & Tags</CardTitle>
        <CardDescription>
          Add internal notes, manage tags, and track lead information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Score */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Lead Score
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              max="100"
              value={leadScore ?? 0}
              onChange={(e) => handleLeadScoreChange(Number(e.target.value))}
              className="w-24"
            />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${leadScore ?? 0}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {leadScore ?? 0}/100
            </span>
          </div>
        </div>

        <Separator />

        {/* Assignee */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assignee
          </Label>
          <div className="text-sm">
            {assigneeName ? (
              <Badge variant="secondary">{assigneeName}</Badge>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="flex items-center gap-1"
                style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
              >
                {tag.name}
                <button
                  onClick={() => removeTagMutation.mutate(tag.id)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTagName.trim()) {
                  // TODO: Implement tag creation/selection
                  toast.info('Tag creation will be implemented with tag management system');
                  setNewTagName('');
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (newTagName.trim()) {
                  toast.info('Tag creation will be implemented with tag management system');
                  setNewTagName('');
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">
                      {note.author_name} • {format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNoteMutation.isPending}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
