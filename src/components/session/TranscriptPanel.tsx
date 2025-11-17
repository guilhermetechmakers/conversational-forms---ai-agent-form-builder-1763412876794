import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Bot, User as UserIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import type { SessionMessage } from "@/types/session";

interface TranscriptPanelProps {
  messages: SessionMessage[];
}

export function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const [showSystemMessages, setShowSystemMessages] = useState(false);

  const filteredMessages = showSystemMessages 
    ? messages 
    : messages.filter(msg => msg.role !== 'system');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'user':
        return <UserIcon className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'assistant':
        return 'default';
      case 'user':
        return 'secondary';
      case 'system':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conversation Transcript</CardTitle>
            <CardDescription>
              Full conversation history between the agent and visitor
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSystemMessages(!showSystemMessages)}
          >
            {showSystemMessages ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide System
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show System
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages to display
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getRoleIcon(message.role)}
                    </div>
                  )}
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'order-2' : 'order-1'
                    }`}
                  >
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary/10 ml-auto'
                          : message.role === 'assistant'
                          ? 'bg-card border border-border'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getRoleBadgeVariant(message.role)} className="text-xs">
                          {getRoleIcon(message.role)}
                          <span className="ml-1 capitalize">{message.role}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center order-1">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
