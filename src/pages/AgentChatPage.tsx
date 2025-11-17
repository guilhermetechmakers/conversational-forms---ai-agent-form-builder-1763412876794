import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Send, 
  Upload, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Type,
  RotateCcw,
  FileText,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAgent, useSession, useCreateSession, useSendMessage, useCompleteSession, useRestartSession } from "@/hooks/useAgentChat";
import { toast } from "sonner";
import type { SessionMessage } from "@/types/session";

interface QuickReply {
  label: string;
  value: string;
}

export function AgentChatPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showSessionState, setShowSessionState] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: "normal" as "small" | "normal" | "large",
    highContrast: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch agent data
  const { data: agent, isLoading: agentLoading, error: agentError } = useAgent();

  // Create session on mount
  const createSessionMutation = useCreateSession();
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const sendMessageMutation = useSendMessage();
  const completeSessionMutation = useCompleteSession();
  const restartSessionMutation = useRestartSession();

  // Initialize session when agent is loaded
  useEffect(() => {
    if (agent && !sessionId && !createSessionMutation.isPending && agent.status === 'published') {
      createSessionMutation.mutate(
        {
          agent_id: agent.id,
          metadata: {
            referrer: document.referrer || undefined,
            utm_source: new URLSearchParams(window.location.search).get("utm_source") || undefined,
            utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
            utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
          },
        },
        {
          onSuccess: (newSession) => {
            setSessionId(newSession.id);
          },
          onError: (error: Error) => {
            toast.error(error.message || "Failed to start session");
          },
        }
      );
    }
  }, [agent, sessionId, createSessionMutation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [session?.transcript, isTyping]);

  // Calculate progress
  const progress = session
    ? {
        current: session.parsed_fields.filter((f) => f.validated).length,
        total: agent?.fields.filter((f) => f.required).length || 0,
      }
    : { current: 0, total: 0 };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    if (!sessionId) return;

    setIsTyping(true);
    setQuickReplies([]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        session_id: sessionId,
        content: input,
        file_attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
      });

      setInput("");
      setSelectedFiles([]);
      
      // Update quick replies if provided by assistant
      if (result.assistant_response?.metadata && 'quick_replies' in result.assistant_response.metadata) {
        const replies = result.assistant_response.metadata.quick_replies;
        if (Array.isArray(replies)) {
          setQuickReplies(replies as QuickReply[]);
        }
      }

      // If session is complete, show summary modal
      if (result.is_complete) {
        setTimeout(() => {
          setShowSummaryModal(true);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (value: string) => {
    setInput(value);
    // Auto-send quick reply
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    
    try {
      await completeSessionMutation.mutateAsync(sessionId);
      setShowSummaryModal(false);
      toast.success("Session completed successfully!");
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

  const handleRestart = async () => {
    if (!sessionId) return;
    
    try {
      const newSession = await restartSessionMutation.mutateAsync(sessionId);
      setSessionId(newSession.id);
      setShowSummaryModal(false);
      toast.success("Session restarted");
    } catch (error) {
      console.error("Failed to restart session:", error);
    }
  };

  if (agentLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The agent you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agent.status !== 'published') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Agent Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This agent is not currently published and cannot accept new sessions.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const messages = session?.transcript || [];
  const isComplete = session?.status === "completed";

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      accessibilitySettings.highContrast && "contrast-150"
    )}>
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {agent.persona.avatar_url ? (
                  <AvatarImage src={agent.persona.avatar_url} alt={agent.persona.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {agent.persona.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-lg leading-tight">{agent.persona.name}</h1>
                {agent.persona.tagline && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {agent.persona.tagline}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Secure
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Tracker */}
      {!isComplete && (
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Stream */}
        <ScrollArea className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
            <div className="space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Type className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                  <p className="text-muted-foreground">
                    {agent.persona.name} is ready to help you. Start the conversation below.
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  fontSize={accessibilitySettings.fontSize}
                />
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Session State Panel (Collapsible) */}
        {session && session.parsed_fields.length > 0 && (
          <Collapsible open={showSessionState} onOpenChange={setShowSessionState}>
            <div className="border-t border-border bg-muted/30">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 sm:px-6 lg:px-8 py-3 rounded-none"
                >
                  <span className="text-sm font-medium">Collected Information</span>
                  {showSessionState ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
                  <div className="grid gap-3">
                    {session.parsed_fields.map((field) => (
                      <div
                        key={field.field_id}
                        className="flex items-start justify-between p-3 bg-card rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{field.field_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Array.isArray(field.value)
                              ? field.value.join(", ")
                              : String(field.value)}
                          </p>
                        </div>
                        {field.validated ? (
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 ml-2" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* Input Area */}
        {!isComplete && (
          <div className="border-t border-border bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedFiles.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1.5 pr-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Replies */}
              {quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply.value)}
                      className="text-xs"
                    >
                      {reply.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload file"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending || isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedFiles.length === 0) || sendMessageMutation.isPending || isTyping}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with End Session CTA and Accessibility */}
        {isComplete && (
          <div className="border-t border-border bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>Session completed</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRestart} disabled={restartSessionMutation.isPending}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                  <Button onClick={() => setShowSummaryModal(true)}>
                    View Summary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Controls */}
        <div className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Accessibility:</span>
                <select
                  value={accessibilitySettings.fontSize}
                  onChange={(e) =>
                    setAccessibilitySettings((prev) => ({
                      ...prev,
                      fontSize: e.target.value as "small" | "normal" | "large",
                    }))
                  }
                  className="text-xs border border-border rounded px-2 py-1 bg-background"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.highContrast}
                    onChange={(e) =>
                      setAccessibilitySettings((prev) => ({
                        ...prev,
                        highContrast: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  High Contrast
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Summary</DialogTitle>
            <DialogDescription>
              Review the information collected during this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {session?.parsed_fields.map((field) => (
              <div key={field.field_id} className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">{field.field_name}</p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(field.value)
                    ? field.value.join(", ")
                    : String(field.value)}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSummaryModal(false)}>
              Close
            </Button>
            {!isComplete && (
              <Button onClick={handleComplete} disabled={completeSessionMutation.isPending}>
                Complete Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Chat Message Component
interface ChatMessageProps {
  message: SessionMessage;
  fontSize: "small" | "normal" | "large";
}

function ChatMessage({ message, fontSize }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return null; // Hide system messages by default
  }

  const timestamp = new Date(message.timestamp);
  const fontSizeClass = {
    small: "text-xs",
    normal: "text-sm",
    large: "text-base",
  }[fontSize];

  return (
    <div
      className={cn(
        "flex animate-fade-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[75%] rounded-xl p-4 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border",
          fontSizeClass
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            "text-xs mt-2",
            isUser
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          )}
        >
          {format(timestamp, "h:mm a")}
        </p>
      </div>
    </div>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center">
      <div
        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}
